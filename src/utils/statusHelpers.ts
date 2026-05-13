import type { AssetStatus, SalesRequestStatus, DeploymentStatus } from '@/types/enums';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

export function assetStatusVariant(status: AssetStatus): BadgeVariant {
  switch (status) {
    case 'Available': return 'success';
    case 'Requested':
    case 'Preparing': return 'info';
    case 'Dispatched':
    case 'In_Transit':
    case 'With_Customer': return 'warning';
    case 'Under_Repair':
    case 'Quarantine':
    case 'Overdue': return 'danger';
    case 'Retired': return 'muted';
    default: return 'default';
  }
}

export function salesRequestStatusVariant(status: SalesRequestStatus): BadgeVariant {
  switch (status) {
    case 'Draft': return 'muted';
    case 'Waiting_Approval':
    case 'Waiting_Reservation': return 'warning';
    case 'Preparing':
    case 'BOM_Confirmed':
    case 'Ready_for_Dispatch': return 'info';
    case 'Dispatched':
    case 'With_Customer': return 'warning';
    case 'Request_Complete': return 'success';
    case 'Cancelled': return 'danger';
    default: return 'default';
  }
}

export function deploymentStatusVariant(status: DeploymentStatus): BadgeVariant {
  switch (status) {
    case 'Preparing': return 'info';
    case 'Dispatched':
    case 'With_Customer': return 'warning';
    case 'Returned': return 'success';
    case 'In_Inspection':
    case 'In_Repair': return 'danger';
    default: return 'default';
  }
}
