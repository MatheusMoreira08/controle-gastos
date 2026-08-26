import { useState, useMemo } from 'react';
import { Plus, Target, Pencil, Trash2, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { GoalForm } from '../components/Forms/GoalForm';
import { ProgressBar } from '../components/UI/ProgressBar';
import { Badge } from '../components/UI/Badge';
import { EmptyState } from '../components/UI/EmptyState';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { Modal } from '../components/UI/Modal';
import { useGoals, ownerEmoji, ownerLabel, ownerColor } from '../hooks/useFirestore';
import { Goal, Owner } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getGoalProgress, isGoalOverdue } from '../utils/calculations';

function GoalStatusBadge({ goal }: { goal: Goal }) {
  const overdue = isGoalOverdue(goal.deadline, goal.currentAmount, goal.targetAmount);
  if (goal.status === 'completed') return <Badge variant="success"><CheckCircle2 size={10} /> Concluída</Badge>;
  if (overdue) return <Badge variant="danger"><AlertTriangle size={10} /> Atrasada</Badge>;
  return <Badge variant="info">Em andamento</Badge>;
}

function ContributeModal({ goal, isOpen, onClose }: { goal: Goal; isOpen: boolean; onClose: () => void }) {
  const { contributeToGoal } = useGoals();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContribute = async () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      setLoading(true);
      await contributeToGoal(goal.id, val);
      setLoading(false);
      setAmount('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Aportar — ${goal.name}`} size="sm"
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleContribute} disabled={loading}>{loading ? 'Salvando...' : 'Adicionar'}</button>
      </>}
    >
      <div className="form-group">
        <label className="form-label" htmlFor="contribute-amount">Valor do aporte (R$)</label>
        <input id="contribute-amount" type="number" step="0.01" min="0" className="form-input" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 12 }}>
        Atual: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
      </p>
    </Modal>
  );
}

export function Goals() {
  const { goals, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | undefined>();
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<Owner | 'all'>('all');

  const sortedGoals = useMemo(() => {
    let list = [...goals];
    if (ownerFilter !== 'all') list = list.filter(g => g.owner === ownerFilter || g.owner === 'ambos');
    return list.sort((a, b) => ({ active: 0, overdue: 1, completed: 2 }[a.status] ?? 0) - ({ active: 0, overdue: 1, completed: 2 }[b.status] ?? 0));
  }, [goals, ownerFilter]);

  const totalGoaled = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completedCount = goals.filter(g => g.status === 'completed').length;

  return (
    <AppLayout
      title="Metas Financeiras"
      subtitle={`${goals.length} meta${goals.length !== 1 ? 's' : ''}`}
      actions={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)} id="goals-add-btn"><Plus size={16} /> Nova meta</button>}
    >
      {/* Owner filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {([['all', '💑 Todas'], ['matheus', '👨 Matheus'], ['vitoria', '👩 Vitória'], ['ambos', '🤝 Casal']] as [Owner | 'all', string][]).map(([val, lbl]) => (
          <button key={val} className={`period-btn ${ownerFilter === val ? 'active' : ''}`} onClick={() => setOwnerFilter(val)}
            style={ownerFilter === val && val !== 'all' ? { background: ownerColor(val as Owner) + '22', borderColor: ownerColor(val as Owner) + '66', color: ownerColor(val as Owner) } : undefined}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Stats */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total das metas', value: formatCurrency(totalGoaled), color: 'var(--accent-primary-light)' },
            { label: 'Total acumulado', value: formatCurrency(totalSaved), color: 'var(--color-success-light)' },
            { label: 'Concluídas', value: `${completedCount} / ${goals.length}`, color: 'var(--color-success-light)' },
          ].map((s, i) => (
            <div key={i} className="card animate-in" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {sortedGoals.length === 0 ? (
        <div className="card animate-in">
          <EmptyState icon={<Target size={28} />} title="Nenhuma meta encontrada" description="Crie metas para acompanhar seus objetivos financeiros."
            action={<button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Criar meta</button>}
          />
        </div>
      ) : (
        <div className="goals-grid">
          {sortedGoals.map(goal => {
            const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
            const overdue = isGoalOverdue(goal.deadline, goal.currentAmount, goal.targetAmount);
            const progressVariant = goal.status === 'completed' ? 'success' : overdue ? 'danger' : 'default';
            return (
              <div key={goal.id} className="goal-card animate-in">
                <div className="goal-card-header">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                    <div className="goal-card-icon" style={{ background: goal.color + '22', color: goal.color, fontSize: '1.3rem' }}>🎯</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="goal-card-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {goal.name}
                        <span title={ownerLabel(goal.owner)}>{ownerEmoji(goal.owner)}</span>
                      </div>
                      <div className="goal-card-deadline">Prazo: {formatDate(goal.deadline)}</div>
                    </div>
                  </div>
                  <GoalStatusBadge goal={goal} />
                </div>
                {goal.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 12 }}>{goal.description}</p>}
                <div className="goal-card-amounts">
                  <span className="goal-amount-current">{formatCurrency(goal.currentAmount)}</span>
                  <span className="goal-amount-divider">/</span>
                  <span className="goal-amount-target">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <ProgressBar value={progress} variant={progressVariant} />
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  {goal.status !== 'completed' && (
                    <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => setContributeGoal(goal)} id={`goal-contribute-${goal.id}`}>
                      <TrendingUp size={14} /> Aportar
                    </button>
                  )}
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditGoal(goal); setShowForm(true); }} title="Editar" id={`goal-edit-${goal.id}`}><Pencil size={15} /></button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteGoalId(goal.id)} title="Excluir" id={`goal-delete-${goal.id}`}><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="btn-fab" onClick={() => setShowForm(true)} aria-label="Nova meta" id="goals-fab">+</button>
      <GoalForm isOpen={showForm} onClose={() => { setShowForm(false); setEditGoal(undefined); }} editGoal={editGoal} />
      {contributeGoal && <ContributeModal goal={contributeGoal} isOpen={!!contributeGoal} onClose={() => setContributeGoal(null)} />}
      <ConfirmDialog isOpen={!!deleteGoalId} onClose={() => setDeleteGoalId(null)}
        onConfirm={() => { if (deleteGoalId) deleteGoal(deleteGoalId); setDeleteGoalId(null); }}
        title="Excluir meta" message="Tem certeza que deseja excluir esta meta?" confirmLabel="Excluir" variant="danger"
      />
    </AppLayout>
  );
}
