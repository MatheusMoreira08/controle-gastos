import { useFinanceStore } from '../store/useFinanceStore';
import { format, subDays, subMonths, addMonths } from 'date-fns';
import { Owner } from '../types';

function d(daysAgo: number): string {
  return format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
}

function futureDate(monthsAhead: number): string {
  return format(addMonths(new Date(), monthsAhead), 'yyyy-MM-dd');
}

export function seedDemoData() {
  const store = useFinanceStore.getState();

  // Transactions — current month
  const transactions = [
    // Income
    {
      title: 'Salário Matheus', amount: 5500, type: 'income' as const,
      categoryId: 'cat-salary', date: d(2), isPaid: true,
      isRecurring: true, recurrenceType: 'monthly' as const,
      owner: 'matheus' as Owner,
    },
    {
      title: 'Salário Vitória', amount: 4800, type: 'income' as const,
      categoryId: 'cat-salary', date: d(2), isPaid: true,
      isRecurring: true, recurrenceType: 'monthly' as const,
      owner: 'vitoria' as Owner,
    },
    {
      title: 'Freelance — Website', amount: 1200, type: 'income' as const,
      categoryId: 'cat-freelance', date: d(10), isPaid: true, isRecurring: false,
      owner: 'matheus' as Owner,
    },
    {
      title: 'Rendimentos Investimentos', amount: 380, type: 'income' as const,
      categoryId: 'cat-investment', date: d(5), isPaid: true, isRecurring: false,
      owner: 'ambos' as Owner,
    },
    // Expenses
    {
      title: 'Aluguel do Apartamento', amount: 1800, type: 'expense' as const,
      categoryId: 'cat-housing', date: d(1), dueDate: d(1), isPaid: true, isRecurring: true, recurrenceType: 'monthly' as const,
      owner: 'ambos' as Owner,
    },
    {
      title: 'Supermercado Mensal', amount: 650, type: 'expense' as const,
      categoryId: 'cat-food', date: d(3), isPaid: true, isRecurring: false,
      owner: 'ambos' as Owner,
    },
    {
      title: 'Plano de Saúde', amount: 280, type: 'expense' as const,
      categoryId: 'cat-health', date: d(5), isPaid: true, isRecurring: true, recurrenceType: 'monthly' as const,
      owner: 'matheus' as Owner,
    },
    {
      title: 'Curso de Especialização', amount: 320, type: 'expense' as const,
      categoryId: 'cat-education', date: d(5), isPaid: true, isRecurring: true, recurrenceType: 'monthly' as const,
      owner: 'vitoria' as Owner,
    },
    {
      title: 'Conta de Luz', amount: 165, type: 'expense' as const,
      categoryId: 'cat-housing', date: d(7), isPaid: true, isRecurring: false,
      owner: 'ambos' as Owner,
    },
    {
      title: 'Combustível / Uber', amount: 120, type: 'expense' as const,
      categoryId: 'cat-transport', date: d(4), isPaid: true, isRecurring: false,
      owner: 'ambos' as Owner,
    },
    {
      title: 'Netflix + Spotify + HBO', amount: 89, type: 'expense' as const,
      categoryId: 'cat-subscriptions', date: d(8), isPaid: true, isRecurring: true, recurrenceType: 'monthly' as const,
      owner: 'ambos' as Owner,
    },
    {
      title: 'Jantar Romântico', amount: 240, type: 'expense' as const,
      categoryId: 'cat-leisure', date: d(6), isPaid: true, isRecurring: false,
      owner: 'ambos' as Owner,
    },
    {
      title: 'Academia', amount: 110, type: 'expense' as const,
      categoryId: 'cat-health', date: d(1), isPaid: false,
      dueDate: d(-3), isRecurring: true, recurrenceType: 'monthly' as const,
      owner: 'matheus' as Owner,
    },
    {
      title: 'Parcela Notebook', amount: 350, type: 'expense' as const,
      categoryId: 'cat-tech', date: d(2), isPaid: false,
      dueDate: d(-1), isRecurring: false, installments: 12, currentInstallment: 5,
      owner: 'matheus' as Owner,
    },
  ];

  // Goals
  const goals = [
    {
      name: 'Viagem para a Europa', targetAmount: 20000, currentAmount: 8500,
      deadline: futureDate(10), icon: 'Plane', color: '#6366f1',
      description: 'Nossa viagem de férias dos sonhos!',
      owner: 'ambos' as Owner,
    },
    {
      name: 'Reserva de Emergência do Casal', targetAmount: 25000, currentAmount: 16000,
      deadline: futureDate(6), icon: 'Wallet', color: '#10b981',
      description: '6 meses de custos essenciais guardados',
      owner: 'ambos' as Owner,
    },
    {
      name: 'Carro Novo', targetAmount: 40000, currentAmount: 12000,
      deadline: futureDate(18), icon: 'Car', color: '#f59e0b',
      description: 'Troca de veículo',
      owner: 'ambos' as Owner,
    },
  ];

  transactions.forEach(tx => {
    store.addTransaction({
      ...tx,
      description: undefined,
      goalId: undefined,
    });
  });

  goals.forEach(goal => {
    store.addGoal(goal);
  });
}
