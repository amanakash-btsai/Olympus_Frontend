import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendBadgeProps {
  trend: 'positive' | 'negative' | 'neutral';
  value?: string;
  className?: string;
}

export default function TrendBadge({ trend, value, className }: TrendBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        trend === 'positive' && 'text-green-600',
        trend === 'negative' && 'text-red-600',
        trend === 'neutral' && 'text-gray-500',
        className,
      )}
    >
      {trend === 'positive' && <TrendingUp className="h-3 w-3" />}
      {trend === 'negative' && <TrendingDown className="h-3 w-3" />}
      {trend === 'neutral' && <Minus className="h-3 w-3" />}
      {value}
    </span>
  );
}
