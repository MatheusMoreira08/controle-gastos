import { useState, useMemo } from 'react';
import { Plus, Search, Filter, CheckCircle2, Clock, Pencil, Trash2, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { TransactionForm } from '../components/Forms/TransactionForm';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { Badge } from '../components/UI/Badge';
import { EmptyState } from '../components/UI/EmptyState';
import { useTransactions, useCategories, ownerEmoji, ownerLabel, ownerColor } from '../hooks/useFirestore';
import { Transaction, TransactionType, PeriodFilter, Owner } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getDateRangeForPeriod, filterTransactionsByDateRange, isTransactionOverdue } from '../utils/calculations';

function filterByRange(txs: Transaction[], period: PeriodFilter) {
  return filterTransactionsByDateRange(txs, getDateRangeForPeriod(period));
}

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'current-month', label: 'Este mês' },
  { value: 'last-month', label: 'Mês anterior' },
  { value: 'last-3-months', label: '3 meses' },
  { value: 'current-year', label: 'Este ano' },
];

export function Transactions() {
  const { transactions, deleteTransaction, toggleTransactionPaid } = useTransactions();
  const { categories } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  // Filters
  const [period, setPeriod] = useState<PeriodFilter>('current-month');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [ownerFilter, setOwnerFilter] = useState<Owner | 'all'>('all');
  const [search, setSearch] = useState('');
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const filtered = useMemo(() => {
    let list = filterByRange(transactions, period);
    if (typeFilter !== 'all') list = list.filter(t => t.type === typeFilter);
    if (paidFilter !== 'all') list = list.filter(t => paidFilter === 'paid' ? t.isPaid : !t.isPaid);
    if (ownerFilter !== 'all') list = list.filter(t => t.owner === ownerFilter || t.owner === 'ambos');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (b?.date || '').localeCompare(a?.date || '') || (b?.createdAt || '').localeCompare(a?.createdAt || ''));
  }, [transactions, categories, period, typeFilter, search, paidFilter, ownerFilter]);

  const totalIncome = filtered.filter(t => t.type === 'income' && t.isPaid).reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense' && t.isPaid).reduce((s, t) => s + t.amount, 0);

  const handleEdit = (tx: Transaction) => { setEditTx(tx); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditTx(undefined); };

  return (
    <AppLayout
      title="Lançamentos"
      subtitle={`${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`}
      actions={
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)} id="transactions-add-btn">
          <Plus size={16} /> Novo
        </button>
      }
    >
      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Receitas', value: totalIncome, color: 'var(--color-success-light)' },
          { label: 'Despesas', value: totalExpense, color: 'var(--color-danger-light)' },
          { label: 'Saldo', value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'var(--color-success-light)' : 'var(--color-danger-light)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{formatCurrency(s.value)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar animate-in">
        <div className="search-input-wrap">
          <Search className="search-icon" />
          <input id="tx-search" className="form-input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto', minWidth: 130 }} value={period} onChange={e => setPeriod(e.target.value as PeriodFilter)} id="tx-period-filter">
          {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 110 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value as TransactionType | 'all')} id="tx-type-filter">
          <option value="all">Todos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 120 }} value={ownerFilter} onChange={e => setOwnerFilter(e.target.value as Owner | 'all')} id="tx-owner-filter">
          <option value="all">💑 Todos</option>
          <option value="matheus">👨 Matheus</option>
          <option value="vitoria">👩 Vitória</option>
          <option value="ambos">🤝 Ambos</option>
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 110 }} value={paidFilter} onChange={e => setPaidFilter(e.target.value as 'all' | 'paid' | 'pending')} id="tx-paid-filter">
          <option value="all">Situação</option>
          <option value="paid">Pago</option>
          <option value="pending">Pendente</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card animate-in">
          <EmptyState icon={<Filter size={28} />} title="Nenhum lançamento encontrado" description="Ajuste os filtros ou adicione um novo lançamento."
            action={<button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Adicionar</button>}
          />
        </div>
      ) : (
        <div className="transaction-list">
          {filtered.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            const overdue = isTransactionOverdue(tx.dueDate ?? '', tx.isPaid);
            const color = ownerColor(tx.owner);
            return (
              <div key={tx.id} className="transaction-item animate-in">
                <div className="transaction-icon" style={{ background: cat?.color ? cat.color + '22' : 'var(--bg-elevated)', color: cat?.color ?? 'var(--text-muted)' }}>
                  {tx.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                </div>
                <div className="transaction-info">
                  <div className="transaction-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {tx.title}
                    <span title={ownerLabel(tx.owner)} style={{ fontSize: '0.875rem' }}>{ownerEmoji(tx.owner)}</span>
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-date">{formatDate(tx.date)}</span>
                    {cat && <Badge variant="neutral">{cat.name}</Badge>}
                    {tx.isPaid ? <Badge variant="success"><CheckCircle2 size={10} /> Pago</Badge>
                      : overdue ? <Badge variant="danger"><AlertTriangle size={10} /> Vencido</Badge>
                      : <Badge variant="warning"><Clock size={10} /> Pendente</Badge>}
                    {tx.isRecurring && <Badge variant="info">Recorrente</Badge>}
                    {tx.installments && <Badge variant="neutral">{tx.currentInstallment}/{tx.installments}x</Badge>}
                  </div>
                </div>
                <span className={`transaction-amount ${tx.type}`}>
                  {tx.type === 'expense' ? '−' : '+'}{formatCurrency(tx.amount)}
                </span>
                <div className="transaction-actions">
                  <button className={`btn btn-icon btn-sm ${tx.isPaid ? 'btn-ghost' : 'btn-success'}`} onClick={() => toggleTransactionPaid(tx.id)} title={tx.isPaid ? 'Marcar pendente' : 'Marcar pago'} id={`tx-toggle-${tx.id}`}>
                    <CheckCircle2 size={16} />
                  </button>
                  <button className="btn btn-icon btn-sm btn-ghost" onClick={() => handleEdit(tx)} title="Editar" id={`tx-edit-${tx.id}`}>
                    <Pencil size={16} />
                  </button>
                  <button className="btn btn-icon btn-sm btn-danger" onClick={() => setDeleteTxId(tx.id)} title="Excluir" id={`tx-delete-${tx.id}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="btn-fab" onClick={() => setShowForm(true)} aria-label="Novo lançamento" id="transactions-fab">+</button>
      <TransactionForm isOpen={showForm} onClose={handleCloseForm} editTransaction={editTx} />
      <ConfirmDialog isOpen={!!deleteTxId} onClose={() => setDeleteTxId(null)}
        onConfirm={() => { if (deleteTxId) deleteTransaction(deleteTxId); setDeleteTxId(null); }}
        title="Excluir lançamento" message="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita." confirmLabel="Excluir" variant="danger"
      />
    </AppLayout>
  );
}
