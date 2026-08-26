import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Target, Settings, TrendingUp, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ownerEmoji } from '../../hooks/useFirestore';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Lançamentos' },
  { to: '/goals', icon: Target, label: 'Metas' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div className="mobile-overlay animate-fade" onClick={onMobileClose} />
      )}

      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <TrendingUp size={20} />
          </div>
          {!collapsed && <span className="sidebar-brand">FinanceFlow</span>}
        </div>

        {/* User badge */}
        {user && !collapsed && (
          <div style={{
            margin: '8px 12px',
            padding: '10px 12px',
            background: 'var(--accent-primary-bg)',
            border: '1px solid var(--accent-primary-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: '1.25rem' }}>{ownerEmoji(user.owner)}</span>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                {user.displayName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {!collapsed && <span className="sidebar-section-label">Menu</span>}
          {navItems.map(item => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={onMobileClose} title={collapsed ? item.label : undefined}>
                <item.icon className="sidebar-link-icon" size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-collapse-btn"
            onClick={logout}
            title="Sair"
            style={{ color: 'var(--color-danger-light)' }}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sair</span>}
          </button>
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expandir' : 'Recolher'}>
            {collapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span>Recolher</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
