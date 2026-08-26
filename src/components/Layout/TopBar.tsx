import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '../UI/ThemeToggle';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: ReactNode;
}

export function TopBar({ title, subtitle, onMenuClick, actions }: TopBarProps) {
  return (
    <header className="topbar">
      <button
        className="btn btn-ghost btn-icon topbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        id="topbar-menu-btn"
      >
        <Menu size={20} />
      </button>

      <div className="topbar-title">
        {title}
        {subtitle && (
          <div style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
