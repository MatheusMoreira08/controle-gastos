import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../UI/Modal';
import { OwnerSelector } from '../UI/OwnerSelector';
import { useTransactions, useGoals, useCategories } from '../../hooks/useFirestore';
import { Transaction, TransactionFormData, Owner } from '../../types';
import { getTodayISO } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(80),
  description: z.string().optional(),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  date: z.string().min(1, 'Data é obrigatória'),
  dueDate: z.string().optional(),
  isPaid: z.boolean(),
  isRecurring: z.boolean(),
  recurrenceType: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  installments: z.coerce.number().int().min(1).optional(),
  currentInstallment: z.coerce.number().int().min(1).optional(),
  goalId: z.string().optional(),
  owner: z.enum(['matheus', 'vitoria', 'ambos']),
});

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction;
}

export function TransactionForm({ isOpen, onClose, editTransaction }: TransactionFormProps) {
  const { categories } = useCategories();
  const { goals } = useGoals();
  const { addTransaction, updateTransaction } = useTransactions();
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      isPaid: true,
      isRecurring: false,
      date: getTodayISO(),
      owner: (user?.owner ?? 'ambos') as Owner,
      categoryId: 'cat-food',
    },
  });

  const type = watch('type');
  const isRecurring = watch('isRecurring');
  const owner = watch('owner');

  const filteredCategories = categories.filter(
    c => c.type === type || c.type === 'both'
  );

  useEffect(() => {
    setSubmitError(null);
    if (editTransaction) {
      reset({
        title: editTransaction.title,
        description: editTransaction.description || '',
        amount: editTransaction.amount,
        type: editTransaction.type,
        categoryId: editTransaction.categoryId,
        date: editTransaction.date,
        dueDate: editTransaction.dueDate || '',
        isPaid: editTransaction.isPaid,
        isRecurring: editTransaction.isRecurring,
        recurrenceType: editTransaction.recurrenceType || 'monthly',
        installments: editTransaction.installments,
        currentInstallment: editTransaction.currentInstallment,
        goalId: editTransaction.goalId || '',
        owner: editTransaction.owner,
      });
    } else {
      reset({
        title: '',
        description: '',
        amount: undefined as unknown as number,
        type: 'expense',
        isPaid: true,
        isRecurring: false,
        date: getTodayISO(),
        dueDate: '',
        categoryId: filteredCategories[0]?.id || 'cat-food',
        owner: (user?.owner ?? 'ambos') as Owner,
      });
    }
  }, [editTransaction, isOpen, reset, user]);

  const onSubmit = async (data: TransactionFormData) => {
    setSubmitError(null);
    try {
      if (editTransaction) {
        await updateTransaction(editTransaction.id, data);
      } else {
        await addTransaction(data);
      }
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar transação:', err);
      setSubmitError(err?.message || 'Erro ao salvar no banco de dados.');
    }
  };

  const onInvalid = (formErrors: any) => {
    console.warn('Erros de validação do formulário:', formErrors);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Editar lançamento' : 'Novo lançamento'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            type="submit"
            form="transaction-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : editTransaction ? 'Salvar' : 'Adicionar'}
          </button>
        </>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
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

        {/* Type Toggle */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-option ${type === 'expense' ? 'active-expense' : ''}`}
              onClick={() => {
                setValue('type', 'expense');
                const defaultCat = categories.find(c => c.type === 'expense' || c.type === 'both');
                if (defaultCat) setValue('categoryId', defaultCat.id);
              }}
            >
              💸 Despesa
            </button>
            <button
              type="button"
              className={`toggle-option ${type === 'income' ? 'active-income' : ''}`}
              onClick={() => {
                setValue('type', 'income');
                const defaultCat = categories.find(c => c.type === 'income' || c.type === 'both');
                if (defaultCat) setValue('categoryId', defaultCat.id);
              }}
            >
              💰 Receita
            </button>
          </div>
        </div>

        {/* Owner Selector */}
        <div style={{ marginBottom: 16 }}>
          <OwnerSelector value={owner} onChange={v => setValue('owner', v)} />
        </div>

        <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
          {/* Title */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="tx-title">Título *</label>
            <input id="tx-title" className={`form-input ${errors.title ? 'error' : ''}`} placeholder="Ex: Almoço, Supermercado..." {...register('title')} />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-amount">Valor (R$) *</label>
            <input id="tx-amount" type="number" step="0.01" min="0.01" className={`form-input ${errors.amount ? 'error' : ''}`} placeholder="0,00" {...register('amount')} />
            {errors.amount && <span className="form-error">{errors.amount.message}</span>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-date">Data *</label>
            <input id="tx-date" type="date" className={`form-input ${errors.date ? 'error' : ''}`} {...register('date')} />
            {errors.date && <span className="form-error">{errors.date.message}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-category">Categoria *</label>
            <select id="tx-category" className={`form-select ${errors.categoryId ? 'error' : ''}`} {...register('categoryId')}>
              <option value="">Selecione...</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="form-error">{errors.categoryId.message}</span>}
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-due-date">Vencimento</label>
            <input id="tx-due-date" type="date" className="form-input" {...register('dueDate')} />
          </div>

          {/* isPaid */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="switch-container">
              <div className="switch">
                <input type="checkbox" {...register('isPaid')} />
                <span className="switch-slider" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Marcar como pago</span>
            </label>
          </div>

          {/* isRecurring */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="switch-container">
              <div className="switch">
                <input type="checkbox" {...register('isRecurring')} />
                <span className="switch-slider" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Lançamento recorrente</span>
            </label>
          </div>

          {isRecurring && (
            <div className="form-group">
              <label className="form-label" htmlFor="tx-recurrence">Recorrência</label>
              <select id="tx-recurrence" className="form-select" {...register('recurrenceType')}>
                <option value="monthly">Mensal</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          )}

          {type === 'income' && goals.filter(g => g.status !== 'completed').length > 0 && (
            <div className="form-group">
              <label className="form-label" htmlFor="tx-goal">Vincular a meta</label>
              <select id="tx-goal" className="form-select" {...register('goalId')}>
                <option value="">Nenhuma</option>
                {goals.filter(g => g.status !== 'completed').map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="tx-desc">Descrição (opcional)</label>
            <input id="tx-desc" className="form-input" placeholder="Observações adicionais..." {...register('description')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
