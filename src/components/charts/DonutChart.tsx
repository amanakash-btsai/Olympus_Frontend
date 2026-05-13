import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DonutData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
}

export default function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          dataKey="value"
          nameKey="label"
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-900 text-2xl font-bold"
          style={{ fontSize: '1.5rem', fontWeight: 700, fill: '#111827' }}
        >
          {total}
        </text>
        <Tooltip
          formatter={(value: number, name: string) => [value, name]}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => value} />
      </PieChart>
    </ResponsiveContainer>
  );
}
