import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
  onClick?: (item: Record<string, unknown>) => void;
}

export default function BarChart({
  data,
  xKey,
  yKey,
  color = '#3b82f6',
  onClick,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        />
        <Bar
          dataKey={yKey}
          fill={color}
          radius={[4, 4, 0, 0]}
          onClick={onClick ? (entry) => onClick(entry as Record<string, unknown>) : undefined}
          cursor={onClick ? 'pointer' : undefined}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
