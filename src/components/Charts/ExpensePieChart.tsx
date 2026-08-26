import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CategoryBreakdown } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ExpensePieChartProps {
  data: CategoryBreakdown[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: CategoryBreakdown }[] }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="custom-tooltip-label">{item.categoryName}</p>
        <p className="custom-tooltip-item" style={{ color: item.color }}>
          {formatCurrency(item.total)} ({item.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderLegend = (props: any) => {
  const payload: { value: string; color?: string }[] = props?.payload ?? [];
  return (
    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: 12 }}>
      {payload.map((entry, index) => (
        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color ?? '#ccc', display: 'inline-block', flexShrink: 0 }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 32 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Nenhuma despesa no período selecionado
        </p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="total"
            nameKey="categoryName"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
