import { Owner } from '../../types';
import { ownerLabel, ownerEmoji, ownerColor } from '../../hooks/useFirestore';

interface OwnerSelectorProps {
  value: Owner;
  onChange: (owner: Owner) => void;
  label?: string;
}

const OPTIONS: Owner[] = ['matheus', 'vitoria', 'ambos'];

export function OwnerSelector({ value, onChange, label = 'De quem é?' }: OwnerSelectorProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        {OPTIONS.map(opt => {
          const selected = value === opt;
          const color = ownerColor(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${selected ? color : 'var(--border-default)'}`,
                background: selected ? color + '22' : 'var(--bg-elevated)',
                color: selected ? color : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'inherit',
              }}
              title={ownerLabel(opt)}
            >
              <span style={{ fontSize: '1.25rem' }}>{ownerEmoji(opt)}</span>
              <span>{ownerLabel(opt)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
