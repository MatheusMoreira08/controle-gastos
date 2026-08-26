import { Category } from '../types';

export const defaultCategories: Category[] = [
  // DESPESAS
  { id: 'cat-food', name: 'Alimentação', icon: 'UtensilsCrossed', color: '#f59e0b', type: 'expense', isDefault: true },
  { id: 'cat-transport', name: 'Transporte', icon: 'Car', color: '#3b82f6', type: 'expense', isDefault: true },
  { id: 'cat-health', name: 'Saúde', icon: 'HeartPulse', color: '#ef4444', type: 'expense', isDefault: true },
  { id: 'cat-education', name: 'Educação', icon: 'GraduationCap', color: '#8b5cf6', type: 'expense', isDefault: true },
  { id: 'cat-leisure', name: 'Lazer', icon: 'Gamepad2', color: '#ec4899', type: 'expense', isDefault: true },
  { id: 'cat-housing', name: 'Moradia', icon: 'Home', color: '#06b6d4', type: 'expense', isDefault: true },
  { id: 'cat-clothing', name: 'Vestuário', icon: 'Shirt', color: '#f97316', type: 'expense', isDefault: true },
  { id: 'cat-tech', name: 'Tecnologia', icon: 'Monitor', color: '#6366f1', type: 'expense', isDefault: true },
  { id: 'cat-subscriptions', name: 'Assinaturas', icon: 'RefreshCw', color: '#14b8a6', type: 'expense', isDefault: true },
  { id: 'cat-shopping', name: 'Compras', icon: 'ShoppingBag', color: '#d946ef', type: 'expense', isDefault: true },
  { id: 'cat-beauty', name: 'Beleza & Cuidados', icon: 'Sparkles', color: '#f43f5e', type: 'expense', isDefault: true },
  { id: 'cat-pet', name: 'Pet', icon: 'PawPrint', color: '#84cc16', type: 'expense', isDefault: true },
  { id: 'cat-other-expense', name: 'Outros Gastos', icon: 'MoreHorizontal', color: '#94a3b8', type: 'expense', isDefault: true },

  // RECEITAS
  { id: 'cat-salary', name: 'Salário', icon: 'Wallet', color: '#10b981', type: 'income', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', icon: 'Briefcase', color: '#22c55e', type: 'income', isDefault: true },
  { id: 'cat-investment', name: 'Investimentos', icon: 'TrendingUp', color: '#06d6a0', type: 'income', isDefault: true },
  { id: 'cat-gift', name: 'Presente/Bônus', icon: 'Gift', color: '#fbbf24', type: 'income', isDefault: true },
  { id: 'cat-rent-income', name: 'Aluguel Recebido', icon: 'Building2', color: '#60a5fa', type: 'income', isDefault: true },
  { id: 'cat-other-income', name: 'Outras Receitas', icon: 'Plus', color: '#a3e635', type: 'income', isDefault: true },
];
