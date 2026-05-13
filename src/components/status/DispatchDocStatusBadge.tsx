import type { DispatchDocStatus } from '@/types/enums';
import { cn } from '@/lib/utils';

const colorMap: Record<DispatchDocStatus, string> = {
  Generated: 'bg-blue-100 text-blue-800',
  Sent_to_Print: 'bg-indigo-100 text-indigo-800',
  Signed: 'bg-green-100 text-green-800',
  Uploaded: 'bg-green-100 text-green-800',
  Archived: 'bg-gray-100 text-gray-600',
};

interface DispatchDocStatusBadgeProps {
  status: DispatchDocStatus;
  className?: string;
}

export default function DispatchDocStatusBadge({ status, className }: DispatchDocStatusBadgeProps) {
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
