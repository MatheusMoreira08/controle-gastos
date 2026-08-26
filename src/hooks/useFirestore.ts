import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp,
  Timestamp, writeBatch, getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Transaction, Category, Goal, AppSettings,
  TransactionFormData, GoalFormData, GoalStatus, Owner
} from '../types';
import { defaultCategories } from '../data/defaultCategories';
import { isGoalOverdue } from '../utils/calculations';

// Collection names
const TRANSACTIONS_COL = 'transactions';
const GOALS_COL = 'goals';
const CATEGORIES_COL = 'categories';
const SETTINGS_DOC = 'shared/settings';

function sanitizeForFirestore(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function fromFirestore<T>(data: Record<string, unknown>, id: string): T {
  const converted: Record<string, unknown> = { ...data, id };
  for (const key of Object.keys(converted)) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = (converted[key] as Timestamp).toDate().toISOString();
    }
  }
  if (!converted.createdAt || typeof converted.createdAt !== 'string') {
    converted.createdAt = new Date().toISOString();
  }
  if (!converted.updatedAt || typeof converted.updatedAt !== 'string') {
    converted.updatedAt = new Date().toISOString();
  }
  if (!converted.owner) {
    converted.owner = 'ambos';
  }
  if (!converted.date) {
    converted.date = new Date().toISOString().split('T')[0];
  }
  return converted as T;
}

// ============================================================
// TRANSACTIONS HOOK
// ============================================================

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, TRANSACTIONS_COL);
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const data = snap.docs.map(d =>
          fromFirestore<Transaction>(d.data() as Record<string, unknown>, d.id)
        );
        // Ordena por data decrescente
        data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar transações do Firestore:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const addTransaction = useCallback(async (data: TransactionFormData) => {
    const rawData = {
      title: data.title,
      description: data.description || '',
      amount: Number(data.amount),
      type: data.type,
      categoryId: data.categoryId,
      date: data.date,
      dueDate: data.dueDate || '',
      isPaid: Boolean(data.isPaid),
      isRecurring: Boolean(data.isRecurring),
      recurrenceType: data.recurrenceType || 'monthly',
      installments: data.installments ? Number(data.installments) : null,
      currentInstallment: data.currentInstallment ? Number(data.currentInstallment) : null,
      goalId: data.goalId || '',
      owner: data.owner || 'ambos',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const clean = sanitizeForFirestore(rawData);
    await addDoc(collection(db, TRANSACTIONS_COL), clean);
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>) => {
    const ref = doc(db, TRANSACTIONS_COL, id);
    const clean = sanitizeForFirestore({
      ...data,
      ...(data.amount != null ? { amount: Number(data.amount) } : {}),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(ref, clean);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await deleteDoc(doc(db, TRANSACTIONS_COL, id));
  }, []);

  const toggleTransactionPaid = useCallback(async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    await updateDoc(doc(db, TRANSACTIONS_COL, id), {
      isPaid: !tx.isPaid,
      updatedAt: serverTimestamp(),
    });
  }, [transactions]);

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, toggleTransactionPaid };
}

// ============================================================
// GOALS HOOK
// ============================================================

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, GOALS_COL);
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const data = snap.docs.map(d =>
          fromFirestore<Goal>(d.data() as Record<string, unknown>, d.id)
        );
        setGoals(data);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar metas do Firestore:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const addGoal = useCallback(async (data: GoalFormData) => {
    const rawData = {
      name: data.name,
      description: data.description || '',
      targetAmount: Number(data.targetAmount),
      currentAmount: Number(data.currentAmount || 0),
      deadline: data.deadline,
      icon: data.icon || 'Home',
      color: data.color || '#6366f1',
      owner: data.owner || 'ambos',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const clean = sanitizeForFirestore(rawData);
    await addDoc(collection(db, GOALS_COL), clean);
  }, []);

  const updateGoal = useCallback(async (id: string, data: Partial<GoalFormData & { status: GoalStatus }>) => {
    const goalRef = doc(db, GOALS_COL, id);
    const snap = await getDoc(goalRef);
    if (!snap.exists()) return;

    const current = snap.data() as Goal;
    const updated = {
      ...current,
      ...data,
      targetAmount: data.targetAmount != null ? Number(data.targetAmount) : current.targetAmount,
      currentAmount: data.currentAmount != null ? Number(data.currentAmount) : current.currentAmount,
      updatedAt: serverTimestamp(),
    };

    if (!data.status) {
      if (updated.currentAmount >= updated.targetAmount) {
        updated.status = 'completed';
      } else if (isGoalOverdue(updated.deadline, updated.currentAmount, updated.targetAmount)) {
        updated.status = 'overdue';
      } else {
        updated.status = 'active';
      }
    }

    const clean = sanitizeForFirestore(updated);
    await updateDoc(goalRef, clean);
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await deleteDoc(doc(db, GOALS_COL, id));
  }, []);

  const contributeToGoal = useCallback(async (goalId: string, amount: number) => {
    const goalRef = doc(db, GOALS_COL, goalId);
    const snap = await getDoc(goalRef);
    if (!snap.exists()) return;
    const goal = snap.data() as Goal;
    await updateGoal(goalId, { currentAmount: goal.currentAmount + Number(amount) });
  }, [updateGoal]);

  return { goals, loading, addGoal, updateGoal, deleteGoal, contributeToGoal };
}

// ============================================================
// CATEGORIES HOOK
// ============================================================

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, CATEGORIES_COL), (snap) => {
      if (snap.empty) {
        setCategories(defaultCategories);
        return;
      }
      const data = snap.docs.map(d => ({ ...(d.data() as Category), id: d.id }));
      // Combina defaultCategories com as categorias do Firestore
      const ids = new Set(data.map(c => c.id));
      const combined = [...data, ...defaultCategories.filter(c => !ids.has(c.id))];
      setCategories(combined);
    }, (err) => {
      console.warn("Usando categorias locais de fallback:", err);
      setCategories(defaultCategories);
    });
    return unsub;
  }, []);

  const addCategory = useCallback(async (data: Omit<Category, 'id'>) => {
    await addDoc(collection(db, CATEGORIES_COL), data);
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<Omit<Category, 'id'>>) => {
    await updateDoc(doc(db, CATEGORIES_COL, id), data);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (cat?.isDefault) return;
    await deleteDoc(doc(db, CATEGORIES_COL, id));
  }, [categories]);

  return { categories, addCategory, updateCategory, deleteCategory };
}

// ============================================================
// SETTINGS HOOK
// ============================================================

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark', currency: 'BRL', locale: 'pt-BR',
  });

  useEffect(() => {
    const [col, docId] = SETTINGS_DOC.split('/');
    const unsub = onSnapshot(doc(db, col, docId), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as AppSettings);
      }
    });
    return unsub;
  }, []);

  const updateSettings = useCallback(async (data: Partial<AppSettings>) => {
    const [col, docId] = SETTINGS_DOC.split('/');
    const ref = doc(db, col, docId);
    await updateDoc(ref, data).catch(async () => {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(ref, { theme: 'dark', currency: 'BRL', locale: 'pt-BR', ...data });
    });
    setSettings(prev => ({ ...prev, ...data }));
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  }, [settings.theme, updateSettings]);

  return { settings, updateSettings, toggleTheme };
}

// ============================================================
// DATA MANAGEMENT
// ============================================================

export async function clearAllData() {
  const batch = writeBatch(db);
  const [txSnap, goalSnap] = await Promise.all([
    import('firebase/firestore').then(f => f.getDocs(collection(db, TRANSACTIONS_COL))),
    import('firebase/firestore').then(f => f.getDocs(collection(db, GOALS_COL))),
  ]);
  txSnap.forEach(d => batch.delete(d.ref));
  goalSnap.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function exportData(
  transactions: Transaction[],
  categories: Category[],
  goals: Goal[]
) {
  return JSON.stringify({ transactions, categories, goals }, null, 2);
}

// Utility: owner label
export function ownerLabel(owner: Owner): string {
  return owner === 'matheus' ? 'Matheus' : owner === 'vitoria' ? 'Vitória' : 'Ambos';
}

export function ownerColor(owner: Owner): string {
  return owner === 'matheus' ? '#6366f1' : owner === 'vitoria' ? '#ec4899' : '#10b981';
}

export function ownerEmoji(owner: Owner): string {
  return owner === 'matheus' ? '👨' : owner === 'vitoria' ? '👩' : '💑';
}
