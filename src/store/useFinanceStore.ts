import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Transaction, Category, Goal, GoalStatus, AppSettings, TransactionFormData, GoalFormData } from '../types';
import { defaultCategories } from '../data/defaultCategories';
import { isGoalOverdue } from '../utils/calculations';

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  settings: AppSettings;

  // ---- Transaction Actions ----
  addTransaction: (data: TransactionFormData) => void;
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionPaid: (id: string) => void;

  // ---- Category Actions ----
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;

  // ---- Goal Actions ----
  addGoal: (data: GoalFormData) => void;
  updateGoal: (id: string, data: Partial<GoalFormData & { status: GoalStatus }>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => void;

  // ---- Settings Actions ----
  updateSettings: (data: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  // ---- Data Management ----
  importData: (data: { transactions?: Transaction[]; categories?: Category[]; goals?: Goal[] }) => void;
  clearAllData: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  currency: 'BRL',
  locale: 'pt-BR',
};

function now() {
  return new Date().toISOString();
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,
      goals: [],
      settings: defaultSettings,

      // ---- Transaction Actions ----
      addTransaction: (data) => {
        const transaction: Transaction = {
          id: nanoid(),
          ...data,
          amount: Number(data.amount),
          isPaid: data.isPaid ?? false,
          isRecurring: data.isRecurring ?? false,
          createdAt: now(),
          updatedAt: now(),
        };
        set(state => ({ transactions: [transaction, ...state.transactions] }));
      },

      updateTransaction: (id, data) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id
              ? { ...t, ...data, amount: data.amount != null ? Number(data.amount) : t.amount, updatedAt: now() }
              : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
      },

      toggleTransactionPaid: (id) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id ? { ...t, isPaid: !t.isPaid, updatedAt: now() } : t
          ),
        }));
      },

      // ---- Category Actions ----
      addCategory: (data) => {
        const category: Category = { id: nanoid(), ...data };
        set(state => ({ categories: [...state.categories, category] }));
      },

      updateCategory: (id, data) => {
        set(state => ({
          categories: state.categories.map(c => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      deleteCategory: (id) => {
        const isDefault = get().categories.find(c => c.id === id)?.isDefault;
        if (isDefault) return; // não apaga categorias padrão
        set(state => ({
          categories: state.categories.filter(c => c.id !== id),
        }));
      },

      // ---- Goal Actions ----
      addGoal: (data) => {
        const goal: Goal = {
          id: nanoid(),
          ...data,
          targetAmount: Number(data.targetAmount),
          currentAmount: Number(data.currentAmount),
          status: 'active',
          createdAt: now(),
          updatedAt: now(),
        };
        set(state => ({ goals: [goal, ...state.goals] }));
      },

      updateGoal: (id, data) => {
        set(state => ({
          goals: state.goals.map(g => {
            if (g.id !== id) return g;
            const updated = {
              ...g,
              ...data,
              targetAmount: data.targetAmount != null ? Number(data.targetAmount) : g.targetAmount,
              currentAmount: data.currentAmount != null ? Number(data.currentAmount) : g.currentAmount,
              updatedAt: now(),
            };
            // recompute status
            if (updated.currentAmount >= updated.targetAmount) {
              updated.status = 'completed';
            } else if (isGoalOverdue(updated.deadline, updated.currentAmount, updated.targetAmount)) {
              updated.status = 'overdue';
            } else {
              updated.status = 'active';
            }
            return updated;
          }),
        }));
      },

      deleteGoal: (id) => {
        set(state => ({ goals: state.goals.filter(g => g.id !== id) }));
      },

      contributeToGoal: (goalId, amount) => {
        const { goals, updateGoal } = get();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;
        updateGoal(goalId, { currentAmount: goal.currentAmount + Number(amount) });
      },

      // ---- Settings Actions ----
      updateSettings: (data) => {
        set(state => ({ settings: { ...state.settings, ...data } }));
      },

      toggleTheme: () => {
        set(state => ({
          settings: {
            ...state.settings,
            theme: state.settings.theme === 'dark' ? 'light' : 'dark',
          },
        }));
      },

      // ---- Data Management ----
      importData: (data) => {
        set(state => ({
          transactions: data.transactions ?? state.transactions,
          categories: data.categories ?? state.categories,
          goals: data.goals ?? state.goals,
        }));
      },

      clearAllData: () => {
        set({ transactions: [], categories: defaultCategories, goals: [] });
      },
    }),
    {
      name: 'financeflow-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
