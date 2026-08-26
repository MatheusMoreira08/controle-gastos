import { useState } from 'react';
import { Sun, Moon, Trash2, Download, Upload, Plus, Pencil, X } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { Modal } from '../components/UI/Modal';
import { useCategories, useAppSettings, clearAllData, exportData, useTransactions, useGoals } from '../hooks/useFirestore';
import { useTheme } from '../hooks/useTheme';
import { Category } from '../types';

const CATEGORY_COLORS = [
  '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16',
  '#94a3b8', '#d946ef',
];

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { settings } = useAppSettings();
  const { transactions } = useTransactions();
  const { goals } = useGoals();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | undefined>();
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  // Cat form state
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#6366f1');
  const [catType, setCatType] = useState<'income' | 'expense' | 'both'>('expense');

  const openCatForm = (cat?: Category) => {
    setEditCat(cat);
    setCatName(cat?.name ?? '');
    setCatColor(cat?.color ?? '#6366f1');
    setCatType(cat?.type === 'both' ? 'both' : cat?.type ?? 'expense');
    setShowCatForm(true);
  };

  const handleSaveCat = async () => {
    if (!catName.trim()) return;
    if (editCat) { await updateCategory(editCat.id, { name: catName, color: catColor, type: catType }); }
    else { await addCategory({ name: catName, color: catColor, icon: 'MoreHorizontal', type: catType }); }
    setShowCatForm(false);
  };

  const handleExport = async () => {
    const data = await exportData(transactions, categories, goals);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const customCategories = categories.filter(c => !c.isDefault);
  const defaultCategoriesList = categories.filter(c => c.isDefault);

  return (
    <AppLayout title="Configurações">
      {/* Appearance */}
      <div className="settings-section">
        <h2 className="settings-section-title">Aparência</h2>
        <div className="settings-item card">
          <div className="settings-item-info">
            <div className="settings-item-label">Tema</div>
            <div className="settings-item-desc">Alternar entre modo escuro e claro</div>
          </div>
          <button className="btn btn-secondary" onClick={toggleTheme} id="settings-theme-toggle">
            {theme === 'dark' ? <><Sun size={16} /> Modo Claro</> : <><Moon size={16} /> Modo Escuro</>}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="settings-section">
        <h2 className="settings-section-title">Categorias personalizadas</h2>
        {customCategories.length === 0 ? (
          <div className="card" style={{ padding: '20px', marginBottom: 8, color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
            Nenhuma categoria personalizada criada
          </div>
        ) : (
          customCategories.map(cat => (
            <div key={cat.id} className="settings-item card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: cat.color + '22', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>●</div>
                <div>
                  <div className="settings-item-label">{cat.name}</div>
                  <div className="settings-item-desc">{cat.type === 'income' ? 'Receita' : cat.type === 'expense' ? 'Despesa' : 'Ambos'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openCatForm(cat)} id={`settings-edit-cat-${cat.id}`}><Pencil size={15} /></button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteCatId(cat.id)} id={`settings-delete-cat-${cat.id}`}><X size={15} /></button>
              </div>
            </div>
          ))
        )}
        <button className="btn btn-secondary w-full" style={{ marginTop: 8 }} onClick={() => openCatForm()} id="settings-add-cat-btn">
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      {/* Default Categories */}
      <div className="settings-section">
        <h2 className="settings-section-title">Categorias padrão ({defaultCategoriesList.length})</h2>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {defaultCategoriesList.map(cat => (
              <span key={cat.id} style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: cat.color + '22', color: cat.color, fontSize: '0.8rem', fontWeight: 600 }}>
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <h2 className="settings-section-title">Gerenciamento de dados</h2>
        <div className="settings-item card">
          <div className="settings-item-info">
            <div className="settings-item-label">Exportar dados</div>
            <div className="settings-item-desc">Baixe um backup de todos os dados em JSON</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} id="settings-export-btn"><Download size={15} /> Exportar</button>
        </div>
        <div className="settings-item card" style={{ borderColor: 'var(--color-danger-border)' }}>
          <div className="settings-item-info">
            <div className="settings-item-label" style={{ color: 'var(--color-danger-light)' }}>Limpar todos os dados</div>
            <div className="settings-item-desc">Remove todos os lançamentos e metas do banco de dados compartilhado.</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setShowClearConfirm(true)} id="settings-clear-btn"><Trash2 size={15} /> Limpar</button>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <h2 className="settings-section-title">Sobre</h2>
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white', fontSize: '1.5rem', boxShadow: 'var(--shadow-glow)' }}>📈</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 4 }}>FinanceFlow 💑</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gestão financeira do casal — v2.0</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 8 }}>Dados sincronizados em tempo real via Firebase.</p>
        </div>
      </div>

      {/* Category Form Modal */}
      <Modal isOpen={showCatForm} onClose={() => setShowCatForm(false)} title={editCat ? 'Editar categoria' : 'Nova categoria'} size="sm"
        footer={<><button className="btn btn-secondary" onClick={() => setShowCatForm(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSaveCat} id="settings-save-cat-btn">Salvar</button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="form-input" placeholder="Nome da categoria" value={catName} onChange={e => setCatName(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <div className="toggle-group">
              {(['expense', 'income', 'both'] as const).map(t => (
                <button key={t} type="button" className={`toggle-option ${catType === t ? (t === 'income' ? 'active-income' : 'active-expense') : ''}`} onClick={() => setCatType(t)}>
                  {t === 'expense' ? 'Despesa' : t === 'income' ? 'Receita' : 'Ambos'}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cor</label>
            <div className="color-picker-grid">
              {CATEGORY_COLORS.map(color => (
                <button key={color} type="button" className={`color-swatch ${catColor === color ? 'selected' : ''}`} style={{ background: color }} onClick={() => setCatColor(color)} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)}
        onConfirm={async () => { await clearAllData(); setShowClearConfirm(false); }}
        title="Limpar todos os dados" message="Todos os lançamentos e metas serão removidos permanentemente do banco compartilhado." confirmLabel="Limpar tudo" variant="danger"
      />
      <ConfirmDialog isOpen={!!deleteCatId} onClose={() => setDeleteCatId(null)}
        onConfirm={() => { if (deleteCatId) { deleteCategory(deleteCatId); setDeleteCatId(null); } }}
        title="Excluir categoria" message="Tem certeza que deseja excluir esta categoria?" confirmLabel="Excluir" variant="danger"
      />
    </AppLayout>
  );
}
