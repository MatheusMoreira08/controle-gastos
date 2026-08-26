import { parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths, startOfYear, format, isAfter } from 'date-fns';
import { Transaction, Category, FinancialSummary, CategoryBreakdown, MonthlyData, PeriodFilter, DateRange } from '../types';

// ============================================================
// FILTROS DE PERÍODO
// ============================================================

export function getDateRangeForPeriod(period: PeriodFilter, customRange?: DateRange): DateRange {
  const today = new Date();

  switch (period) {
    case 'current-month':
      return {
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'last-month': {
      const lastMonth = subMonths(today, 1);
      return {
        start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        end: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    }
    case 'last-3-months':
      return {
        start: format(startOfMonth(subMonths(today, 2)), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'last-6-months':
      return {
        start: format(startOfMonth(subMonths(today, 5)), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'current-year':
      return {
        start: format(startOfYear(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'custom':
      return customRange ?? {
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    default:
      return {
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
  }
}

export function filterTransactionsByDateRange(transactions: Transaction[], range: DateRange): Transaction[] {
  const start = parseISO(range.start);
  const end = parseISO(range.end);

  return transactions.filter(t => {
    try {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start, end });
    } catch {
      return false;
    }
  });
}

// ============================================================
// CÁLCULOS FINANCEIROS
// ============================================================

export function calculateSummary(transactions: Transaction[]): FinancialSummary {
  const paid = transactions.filter(t => t.isPaid);
  const pending = transactions.filter(t => !t.isPaid);

  const totalIncome = paid
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = paid
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingIncome = pending
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingExpenses = pending
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    pendingIncome,
    pendingExpenses,
    projectedBalance: totalIncome - totalExpenses + pendingIncome - pendingExpenses,
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[]
): CategoryBreakdown[] {
  const expenses = transactions.filter(t => t.type === 'expense' && t.isPaid);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  const groupedByCategory = expenses.reduce<Record<string, number & { count: number }>>((acc, t) => {
    if (!acc[t.categoryId]) {
      (acc[t.categoryId] as unknown as { total: number; count: number }) = { total: 0, count: 0 };
    }
    (acc[t.categoryId] as unknown as { total: number; count: number }).total += t.amount;
    (acc[t.categoryId] as unknown as { total: number; count: number }).count += 1;
    return acc;
  }, {} as Record<string, number & { count: number }>);

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  return Object.entries(groupedByCategory)
    .map(([categoryId, data]) => {
      const category = categoryMap.get(categoryId);
      const d = data as unknown as { total: number; count: number };
      return {
        categoryId,
        categoryName: category?.name ?? 'Outros',
        color: category?.color ?? '#94a3b8',
        total: d.total,
        percentage: totalExpenses > 0 ? (d.total / totalExpenses) * 100 : 0,
        count: d.count,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function calculateMonthlyData(transactions: Transaction[], months = 6): MonthlyData[] {
  const today = new Date();
  const result: MonthlyData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(today, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const monthTransactions = transactions.filter(t => {
      try {
        const tDate = parseISO(t.date);
        return isWithinInterval(tDate, { start, end });
      } catch {
        return false;
      }
    });

    const income = monthTransactions
      .filter(t => t.type === 'income' && t.isPaid)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense' && t.isPaid)
      .reduce((sum, t) => sum + t.amount, 0);

    result.push({
      month: format(date, 'MMM', { locale: undefined }),
      year: date.getFullYear(),
      income,
      expenses,
      balance: income - expenses,
    });
  }

  return result;
}

// ============================================================
// CÁLCULOS DE META
// ============================================================

export function getGoalProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min((currentAmount / targetAmount) * 100, 100);
}

export function isGoalOverdue(deadline: string, currentAmount: number, targetAmount: number): boolean {
  try {
    const deadlineDate = parseISO(deadline);
    return isAfter(new Date(), deadlineDate) && currentAmount < targetAmount;
  } catch {
    return false;
  }
}

export function isTransactionOverdue(dueDate: string, isPaid: boolean): boolean {
  if (isPaid || !dueDate) return false;
  try {
    const due = parseISO(dueDate);
    return isAfter(new Date(), due);
  } catch {
    return false;
  }
}
