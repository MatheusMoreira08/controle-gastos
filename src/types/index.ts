// ============================================================
// ENTIDADES PRINCIPAIS DO DOMÍNIO FINANCEIRO
// ============================================================

export type TransactionType = 'income' | 'expense';
export type RecurrenceType = 'weekly' | 'monthly' | 'yearly';
export type GoalStatus = 'active' | 'completed' | 'overdue';
export type Theme = 'light' | 'dark';
export type Owner = 'matheus' | 'vitoria' | 'ambos';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string; // 'Matheus' | 'Vitória'
  owner: Exclude<Owner, 'ambos'>; // o owner ID deste usuário
}

export interface Category {
  id: string;
  name: string;
  icon: string;       // nome do ícone Lucide
  color: string;      // hex color
  type: TransactionType | 'both';
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;              // ISO date string (YYYY-MM-DD)
  dueDate?: string;          // data de vencimento
  isPaid: boolean;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  installments?: number;     // total de parcelas
  currentInstallment?: number; // parcela atual
  goalId?: string;           // vinculação a meta
  owner: Owner;              // de quem é este lançamento
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;          // ISO date string
  icon: string;
  color: string;
  status: GoalStatus;
  owner: Owner;              // de quem é esta meta
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: Theme;
  currency: string;          // 'BRL', 'USD', etc.
  locale: string;            // 'pt-BR', 'en-US', etc.
}

// ============================================================
// TIPOS DE FORMULÁRIO (React Hook Form)
// ============================================================

export interface TransactionFormData {
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  dueDate?: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  installments?: number;
  currentInstallment?: number;
  goalId?: string;
  owner: Owner;
}

export interface GoalFormData {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  owner: Owner;
}

export interface GoalContributionFormData {
  amount: number;
  date: string;
  description?: string;
}

// ============================================================
// TIPOS DE FILTRO E PERÍODO
// ============================================================

export type PeriodFilter = 'current-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'current-year' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface TransactionFilters {
  period: PeriodFilter;
  dateRange?: DateRange;
  type?: TransactionType | 'all';
  categoryId?: string;
  isPaid?: boolean | 'all';
  search?: string;
}

// ============================================================
// TIPOS DE RESUMO / DASHBOARD
// ============================================================

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingIncome: number;
  pendingExpenses: number;
  projectedBalance: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyData {
  month: string;    // 'Jan', 'Fev', etc.
  year: number;
  income: number;
  expenses: number;
  balance: number;
}
