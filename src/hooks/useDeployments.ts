import { useQuery } from '@tanstack/react-query';
import type { DeploymentStatus } from '@/types/enums';
import { listDeployments, getDeployment } from '@/api/deployments.api';

interface DeploymentFilters {
  status?: DeploymentStatus;
  request_id?: string;
  asset_id?: string;
}

export function useDeployments(filters?: DeploymentFilters) {
  return useQuery({
    queryKey: ['deployments', filters],
    queryFn: () => listDeployments(filters),
  });
}

export function useDeployment(deployment_id: string) {
  return useQuery({
    queryKey: ['deployment', deployment_id],
    queryFn: () => getDeployment(deployment_id),
    enabled: !!deployment_id,
  });
}
