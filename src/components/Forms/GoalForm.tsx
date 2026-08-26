import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../UI/Modal';
import { OwnerSelector } from '../UI/OwnerSelector';
import { useGoals } from '../../hooks/useFirestore';
import { Goal, GoalFormData, Owner } from '../../types';
import { getTodayISO } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const GOAL_COLORS = [
  '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16',
];

const GOAL_ICON_MAP: Record<string, string> = {
  'Home': '🏠', 'Car': '🚗', 'Plane': '✈️', 'Laptop': '💻',
  'GraduationCap': '🎓', 'Heart': '❤️', 'TrendingUp': '📈',
  'Gift': '🎁', 'ShoppingBag': '🛍️', 'Wallet': '👛',
  'Baby': '👶', 'Palmtree': '🌴', 'Camera': '📷', 'Music': '🎵', 'Dog': '🐕',
};

const GOAL_ICONS = Object.keys(GOAL_ICON_MAP);

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(60),
  description: z.string().optional(),
  targetAmount: z.coerce.number().positive('Valor alvo deve ser maior que zero'),
  currentAmount: z.coerce.number().min(0),
  deadline: z.string().min(1, 'Prazo é obrigatório'),
  icon: z.string().min(1),
  color: z.string().min(1),
  owner: z.enum(['matheus', 'vitoria', 'ambos']),
});

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal?: Goal;
}

export function GoalForm({ isOpen, onClose, editGoal }: GoalFormProps) {
  const { addGoal, updateGoal } = useGoals();
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<GoalFormData>({
    resolver: zodResolver(schema),
    defaultValues: { icon: 'Home', color: '#6366f1', currentAmount: 0, deadline: '', owner: (user?.owner ?? 'ambos') as Owner },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const owner = watch('owner');

  useEffect(() => {
    setSubmitError(null);
    if (editGoal) {
      reset({
        name: editGoal.name, description: editGoal.description || '',
        targetAmount: editGoal.targetAmount, currentAmount: editGoal.currentAmount || 0,
        deadline: editGoal.deadline, icon: editGoal.icon || 'Home',
        color: editGoal.color || '#6366f1', owner: editGoal.owner || 'ambos',
      });
    } else {
      reset({
        name: '', description: '',
        targetAmount: undefined as unknown as number, currentAmount: 0,
        deadline: '', icon: 'Home', color: '#6366f1',
        owner: (user?.owner ?? 'ambos') as Owner,
      });
    }
  }, [editGoal, isOpen, reset, user]);

  const onSubmit = async (data: GoalFormData) => {
    setSubmitError(null);
    try {
      if (editGoal) { await updateGoal(editGoal.id, data); }
      else { await addGoal(data); }
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar meta:', err);
      setSubmitError(err?.message || 'Erro ao salvar meta.');
    }
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={editGoal ? 'Editar meta' : 'Nova meta financeira'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="goal-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : editGoal ? 'Salvar' : 'Criar meta'}
          </button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit(onSubmit)}>
        {submitError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', marginBottom: 16,
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger-light)',
            fontSize: '0.875rem',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {submitError}
          </div>
        )}

        {/* Name */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label" htmlFor="goal-name">Nome da meta *</label>
          <input id="goal-name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Ex: Viagem, Carro novo..." {...register('name')} />
          {errors.name && <span className="form-error">{errors.name.message}</span>}
        </div>

        {/* Owner */}
        <div style={{ marginBottom: 16 }}>
          <OwnerSelector value={owner} onChange={v => setValue('owner', v)} label="Meta de quem?" />
        </div>

        {/* Color picker */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Cor</label>
          <div className="color-picker-grid">
            {GOAL_COLORS.map(color => (
              <button key={color} type="button" className={`color-swatch ${selectedColor === color ? 'selected' : ''}`} style={{ background: color }} onClick={() => setValue('color', color)} />
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Ícone</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GOAL_ICONS.map(icon => (
              <button key={icon} type="button" onClick={() => setValue('icon', icon)} style={{
                width: 38, height: 38, borderRadius: 'var(--radius-md)',
                background: selectedIcon === icon ? selectedColor + '33' : 'var(--bg-elevated)',
                border: `2px solid ${selectedIcon === icon ? selectedColor : 'var(--border-default)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.1rem', transition: 'all var(--transition-fast)',
              }}>
                {GOAL_ICON_MAP[icon]}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="goal-target">Valor alvo (R$) *</label>
            <input id="goal-target" type="number" step="0.01" min="0.01" className={`form-input ${errors.targetAmount ? 'error' : ''}`} placeholder="0,00" {...register('targetAmount')} />
            {errors.targetAmount && <span className="form-error">{errors.targetAmount.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="goal-current">Acumulado (R$)</label>
            <input id="goal-current" type="number" step="0.01" min="0" className="form-input" placeholder="0,00" {...register('currentAmount')} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="goal-deadline">Prazo *</label>
            <input id="goal-deadline" type="date" className={`form-input ${errors.deadline ? 'error' : ''}`} min={getTodayISO()} {...register('deadline')} />
            {errors.deadline && <span className="form-error">{errors.deadline.message}</span>}
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="goal-desc">Descrição (opcional)</label>
            <input id="goal-desc" className="form-input" placeholder="Motivo ou observações..." {...register('description')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
