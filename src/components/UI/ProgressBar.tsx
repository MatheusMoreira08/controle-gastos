interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  sublabel?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  showPercent?: boolean;
}

export function ProgressBar({
  value,
  label,
  sublabel,
  variant = 'default',
  showPercent = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const fillClass = variant === 'default' ? '' : variant;

  return (
    <div className="progress-bar-wrap">
      {(label || showPercent) && (
        <div className="progress-bar-header">
          {label && <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>}
          {sublabel && <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{sublabel}</span>}
          {showPercent && (
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>
              {clampedValue.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${fillClass}`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
