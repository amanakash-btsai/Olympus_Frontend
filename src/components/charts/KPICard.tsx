import { cn } from '@/lib/utils';
import TrendBadge from './TrendBadge';

interface KPICardProps {
  label: string;
  value: string | number;
  trend: 'positive' | 'negative' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function KPICard({
  label,
  value,
  trend,
  trendValue,
  icon,
  onClick,
}: KPICardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm',
        onClick &&
          'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 font-bold text-gray-900" style={{ fontSize: '3rem', lineHeight: 1 }}>
        {value}
      </p>
      {trendValue && (
        <div className="mt-3">
          <TrendBadge trend={trend} value={trendValue} />
        </div>
      )}
    </div>
  );
}
