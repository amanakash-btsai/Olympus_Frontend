import type { RepairCaseStatus } from '@/types/enums';
import { cn } from '@/lib/utils';

const colorMap: Record<RepairCaseStatus, string> = {
  Quoted: 'bg-amber-100 text-amber-800',
  IQ_Quoted: 'bg-amber-100 text-amber-800',
  PO_Received: 'bg-blue-100 text-blue-800',
  Parts_Arranged: 'bg-blue-100 text-blue-800',
  Confirmed: 'bg-indigo-100 text-indigo-800',
  Completed: 'bg-green-100 text-green-800',
};

interface RepairCaseStatusBadgeProps {
  status: RepairCaseStatus;
  className?: string;
}

export default function RepairCaseStatusBadge({ status, className }: RepairCaseStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorMap[status],
        className,
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
