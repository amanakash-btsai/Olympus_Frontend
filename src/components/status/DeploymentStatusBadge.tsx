import type { DeploymentStatus, SalesRequestStatus } from '@/types/enums';
import { cn } from '@/lib/utils';

const deploymentColorMap: Record<DeploymentStatus, string> = {
  Preparing: 'bg-blue-100 text-blue-800',
  Dispatched: 'bg-indigo-100 text-indigo-800',
  With_Customer: 'bg-indigo-100 text-indigo-800',
  Returned: 'bg-teal-100 text-teal-800',
  In_Inspection: 'bg-amber-100 text-amber-800',
  In_Repair: 'bg-orange-100 text-orange-800',
};

const salesRequestColorMap: Record<SalesRequestStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Waiting_Approval: 'bg-amber-100 text-amber-800',
  Waiting_Reservation: 'bg-amber-100 text-amber-800',
  Preparing: 'bg-blue-100 text-blue-800',
  BOM_Confirmed: 'bg-blue-100 text-blue-800',
  Ready_for_Dispatch: 'bg-indigo-100 text-indigo-800',
  Dispatched: 'bg-indigo-100 text-indigo-800',
  With_Customer: 'bg-green-100 text-green-800',
  Return_Initiated: 'bg-teal-100 text-teal-800',
  Request_Complete: 'bg-teal-100 text-teal-800',
  Cancelled: 'bg-red-100 text-red-800',
};

interface DeploymentStatusBadgeProps {
  status: DeploymentStatus | SalesRequestStatus;
  className?: string;
}

export default function DeploymentStatusBadge({
  status,
  className,
}: DeploymentStatusBadgeProps) {
  const color =
    (deploymentColorMap as Record<string, string>)[status] ??
    (salesRequestColorMap as Record<string, string>)[status] ??
    'bg-gray-100 text-gray-600';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        color,
        className,
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
