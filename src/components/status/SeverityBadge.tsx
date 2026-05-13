import { cn } from '@/lib/utils';

interface SeverityConfig {
  label: string;
  className: string;
}

function getSeverity(days: number): SeverityConfig {
  if (days <= 3) return { label: 'Medium', className: 'bg-amber-100 text-amber-800' };
  if (days <= 7) return { label: 'High', className: 'bg-orange-100 text-orange-800' };
  if (days <= 14) return { label: 'Critical', className: 'bg-red-100 text-red-800' };
  return { label: 'Urgent', className: 'bg-red-900 text-red-100' };
}

interface SeverityBadgeProps {
  daysOutstanding: number;
  className?: string;
}

export default function SeverityBadge({ daysOutstanding, className }: SeverityBadgeProps) {
  const { label, className: colorClass } = getSeverity(daysOutstanding);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
