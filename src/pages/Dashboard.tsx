import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { ExpensePieChart } from '../components/Charts/ExpensePieChart';
import { CashFlowChart } from '../components/Charts/CashFlowChart';
import { ProgressBar } from '../components/UI/ProgressBar';
import { Badge } from '../components/UI/Badge';
import { useTransactions, useGoals, useCategories, ownerLabel, ownerEmoji, ownerColor } from '../hooks/useFirestore';
import { calculateSummary, calculateCategoryBreakdown, calculateMonthlyData, getDateRangeForPeriod, filterTransactionsByDateRange, getGoalProgress, isGoalOverdue } from '../utils/calculations';
import { formatCurrency, formatDate, formatMonthYear, getMonthStart } from '../utils/formatters';
import { PeriodFilter, Owner, Transaction } from '../types';
import { TransactionForm } from '../components/Forms/TransactionForm';

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'current-month', label: 'Este mês' },
  { value: 'last-month', label: 'Mês anterior' },
  { value: 'last-3-months', label: '3 meses' },
  { value: 'current-year', label: 'Este ano' },
];

const OWNER_OPTIONS: { value: Owner | 'all'; label: string }[] = [
  { value: 'all', label: '💑 Todos' },
  { value: 'matheus', label: '👨 Matheus' },
  { value: 'vitoria', label: '👩 Vitória' },
  { value: 'ambos', label: '🤝 Ambos' },
];

function filterByOwner(txs: Transaction[], filter: Owner | 'all'): Transaction[] {
  if (filter === 'all') return txs;
  return txs.filter(t => t.owner === filter || t.owner === 'ambos');
}

export function Dashboard() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { goals } = useGoals();
  const [period, setPeriod] = useState<PeriodFilter>('current-month');
  const [ownerFilter, setOwnerFilter] = useState<Owner | 'all'>('all');
  const [showTxForm, setShowTxForm] = useState(false);

  const dateRange = useMemo(() => getDateRangeForPeriod(period), [period]);

  const filteredByPeriod = useMemo(() => filterTransactionsByDateRange(transactions, dateRange), [transactions, dateRange]);
  const filtered = useMemo(() => filterByOwner(filteredByPeriod, ownerFilter), [filteredByPeriod, ownerFilter]);

  const summary = useMemo(() => calculateSummary(filtered), [filtered]);
  const categoryBreakdown = useMemo(() => calculateCategoryBreakdown(filtered, categories), [filtered, categories]);
  const monthlyData = useMemo(() => calculateMonthlyData(filterByOwner(transactions, ownerFilter), 6), [transactions, ownerFilter]);

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => (b?.date || '').localeCompare(a?.date || '') || (b?.createdAt || '').localeCompare(a?.createdAt || '')).slice(0, 5),
    [transactions]
  );

  const activeGoals = useMemo(() => goals.slice(0, 3), [goals]);

  const periodLabel = useMemo(() => {
    if (period === 'current-month') return formatMonthYear(getMonthStart());
    return `${formatDate(dateRange.start, 'dd/MM')} – ${formatDate(dateRange.end, 'dd/MM/yyyy')}`;
  }, [period, dateRange]);

  const summaryCards = [
    { label: 'Receitas', value: summary.totalIncome, icon: TrendingUp, accent: 'var(--color-success)', iconBg: 'var(--color-success-bg)', sub: `+${formatCurrency(summary.pendingIncome)} pendente`, className: 'stagger-1' },
    { label: 'Despesas', value: summary.totalExpenses, icon: TrendingDown, accent: 'var(--color-danger)', iconBg: 'var(--color-danger-bg)', sub: `${formatCurrency(summary.pendingExpenses)} pendente`, className: 'stagger-2' },
    { label: 'Saldo atual', value: summary.balance, icon: Wallet, accent: summary.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)', iconBg: summary.balance >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', sub: 'Receitas − Despesas pagas', className: 'stagger-3' },
    { label: 'Balanço previsto', value: summary.projectedBalance, icon: Calendar, accent: 'var(--accent-primary)', iconBg: 'var(--accent-primary-bg)', sub: 'Incluindo pendências', className: 'stagger-4' },
  ];

  return (
    <AppLayout
      title="Dashboard"
      subtitle={periodLabel}
      actions={
        <button className="btn btn-primary btn-sm" onClick={() => setShowTxForm(true)} id="dashboard-add-btn">
          + Lançamento
        </button>
      }
    >
      {/* Filters row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="period-selector">
          {PERIOD_OPTIONS.map(opt => (
            <button key={opt.value} className={`period-btn ${period === opt.value ? 'active' : ''}`} onClick={() => setPeriod(opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {OWNER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className="period-btn"
              onClick={() => setOwnerFilter(opt.value)}
              style={ownerFilter === opt.value ? {
                background: ownerFilter !== 'all' ? ownerColor(ownerFilter as Owner) + '22' : 'var(--accent-primary-bg)',
                borderColor: ownerFilter !== 'all' ? ownerColor(ownerFilter as Owner) + '66' : 'var(--accent-primary-border)',
                color: ownerFilter !== 'all' ? ownerColor(ownerFilter as Owner) : 'var(--accent-primary-light)',
              } : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid" style={{ marginBottom: 24 }}>
        {summaryCards.map((card, i) => (
          <div key={i} className={`summary-card animate-in ${card.className}`} style={{ '--card-accent': card.accent, '--card-icon-bg': card.iconBg } as React.CSSProperties}>
            <div className="summary-card-icon"><card.icon size={20} /></div>
            <div className="summary-card-label">{card.label}</div>
            <div className="summary-card-value" style={{ color: i === 2 && summary.balance < 0 ? 'var(--color-danger-light)' : undefined }}>
              {formatCurrency(card.value)}
            </div>
            <div className="summary-card-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <div className="card animate-in stagger-1">
          <div className="section-header"><h2 className="section-title">Despesas por categoria</h2></div>
          <ExpensePieChart data={categoryBreakdown} />
        </div>
        <div className="card animate-in stagger-2">
          <div className="section-header"><h2 className="section-title">Fluxo de caixa (6 meses)</h2></div>
          <CashFlowChart data={monthlyData} />
        </div>
      </div>

      {/* Recent + Goals */}
      <div className="charts-grid">
        {/* Recent Transactions */}
        <div className="card animate-in stagger-3">
          <div className="section-header">
            <h2 className="section-title">Últimos lançamentos</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum lançamento ainda</div>
          ) : (
            <div className="transaction-list">
              {recentTransactions.map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                return (
                  <div key={tx.id} className="transaction-item" onClick={() => navigate('/transactions')} role="button" tabIndex={0}>
                    <div className="transaction-icon" style={{ background: cat?.color ? cat.color + '22' : 'var(--bg-elevated)', color: cat?.color ?? 'var(--text-muted)' }}>
                      {tx.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-title">{tx.title}</div>
                      <div className="transaction-meta">
                        <span className="transaction-date">{formatDate(tx.date)}</span>
                        {cat && <Badge variant="neutral">{cat.name}</Badge>}
                        <span style={{ fontSize: '0.8rem' }}>{ownerEmoji(tx.owner)}</span>
                        {tx.isPaid ? <CheckCircle2 size={12} color="var(--color-success)" /> : <Clock size={12} color="var(--color-warning)" />}
                      </div>
                    </div>
                    <span className={`transaction-amount ${tx.type}`}>
                      {tx.type === 'expense' ? '−' : '+'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="card animate-in stagger-4">
          <div className="section-header">
            <h2 className="section-title">Metas financeiras</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/goals')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todas <ArrowRight size={14} />
            </button>
          </div>
          {activeGoals.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma meta cadastrada</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {activeGoals.map(goal => {
                const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
                const overdue = isGoalOverdue(goal.deadline, goal.currentAmount, goal.targetAmount);
                const variant = goal.status === 'completed' ? 'success' : overdue ? 'danger' : 'default';
                return (
                  <div key={goal.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/goals')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: goal.color + '22', color: goal.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🎯</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {goal.name}
                          <span style={{ fontSize: '0.9rem' }}>{ownerEmoji(goal.owner)}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prazo: {formatDate(goal.deadline)}</div>
                      </div>
                      <div>
                        {goal.status === 'completed' ? <Badge variant="success">Concluída</Badge>
                          : overdue ? <Badge variant="danger"><AlertTriangle size={10} /> Atrasada</Badge>
                          : <Badge variant="info">Ativa</Badge>}
                      </div>
                    </div>
                    <ProgressBar value={progress} variant={variant} sublabel={`${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button className="btn-fab" onClick={() => setShowTxForm(true)} aria-label="Novo lançamento" id="dashboard-fab">+</button>
      <TransactionForm isOpen={showTxForm} onClose={() => setShowTxForm(false)} />
    </AppLayout>
  );
}
