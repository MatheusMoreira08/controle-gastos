import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  icon?: ReactNode;
}

export function Badge({ variant = 'neutral', children, icon }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {icon}
      {children}
    </span>
  );
}
