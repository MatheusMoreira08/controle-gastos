import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================
// FORMATADORES DE MOEDA
// ============================================================

export function formatCurrency(value: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// ============================================================
// FORMATADORES DE DATA
// ============================================================

export function formatDate(dateStr: string, pattern = 'dd/MM/yyyy'): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, pattern, { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, 'dd/MM/yy');
}

export function formatDateLong(dateStr: string): string {
  return formatDate(dateStr, "d 'de' MMMM 'de' yyyy");
}

export function formatMonthYear(dateStr: string): string {
  return formatDate(dateStr, 'MMMM yyyy');
}

export function formatMonthShort(dateStr: string): string {
  return formatDate(dateStr, 'MMM/yy');
}

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getMonthStart(date?: Date): string {
  const d = date ?? new Date();
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
}

export function getMonthEnd(date?: Date): string {
  const d = date ?? new Date();
  return format(new Date(d.getFullYear(), d.getMonth() + 1, 0), 'yyyy-MM-dd');
}

// ============================================================
// FORMATADORES DE PERCENTUAL
// ============================================================

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatPercentSafe(partial: number, total: number): string {
  if (total === 0) return '0%';
  return formatPercent(Math.min((partial / total) * 100, 100));
}

// ============================================================
// FORMATADORES DE NÚMERO
// ============================================================

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
