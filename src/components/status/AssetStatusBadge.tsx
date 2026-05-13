import type { AssetStatus } from '@/types/enums';
import { cn } from '@/lib/utils';

const colorMap: Record<AssetStatus, string> = {
  Available: 'bg-green-100 text-green-800',
  Requested: 'bg-blue-100 text-blue-800',
  Preparing: 'bg-blue-100 text-blue-800',
  BOM_Confirmed: 'bg-blue-100 text-blue-800',
  Dispatched: 'bg-indigo-100 text-indigo-800',
  In_Transit: 'bg-indigo-100 text-indigo-800',
  With_Customer: 'bg-indigo-100 text-indigo-800',
  Return_Initiated: 'bg-amber-100 text-amber-800',
  In_Inspection: 'bg-amber-100 text-amber-800',
  Cleaning: 'bg-amber-100 text-amber-800',
  Under_Repair: 'bg-orange-100 text-orange-800',
  Quarantine: 'bg-orange-100 text-orange-800',
  Extension_Used: 'bg-red-100 text-red-800',
  Overdue: 'bg-red-100 text-red-800',
  Retired: 'bg-gray-100 text-gray-600',
};

interface AssetStatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

export default function AssetStatusBadge({ status, className }: AssetStatusBadgeProps) {
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
