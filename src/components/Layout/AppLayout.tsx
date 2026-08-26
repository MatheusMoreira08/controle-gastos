import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { useTheme } from '../../hooks/useTheme';

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ title, subtitle, actions, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useTheme(); // applies theme to document

  return (
    <div className="app-layout">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="app-main">
        <TopBar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
          actions={actions}
        />
        <div className="page-content">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
