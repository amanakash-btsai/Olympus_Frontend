import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RepairCase } from '@/types/repair.types';
import type { RepairCaseStatus, RepairType, AreaCode } from '@/types/enums';
import { listRepairCases, getRepairCase, updateRepairCase } from '@/api/repairCases.api';

interface RepairCaseFilters {
  status?: RepairCaseStatus;
  asset_id?: string;
  account_id?: string;
  area?: AreaCode;
  repair_type?: RepairType;
}

type UpdateRepairCasePayload = Partial<Omit<RepairCase, 'repair_id' | 'rs_number' | 'created_at'>>;

export function useRepairCases(filters?: RepairCaseFilters) {
  return useQuery({
    queryKey: ['repairCases', filters],
    queryFn: () => listRepairCases(filters),
  });
}

export function useRepairCase(repair_id: string) {
  return useQuery({
    queryKey: ['repairCase', repair_id],
    queryFn: () => getRepairCase(repair_id),
    enabled: !!repair_id,
  });
}

export function useUpdateRepairCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repair_id, payload }: { repair_id: string; payload: UpdateRepairCasePayload }) =>
      updateRepairCase(repair_id, payload),
    onSuccess: (_, { repair_id }) => {
      queryClient.invalidateQueries({ queryKey: ['repairCases'] });
      queryClient.invalidateQueries({ queryKey: ['repairCase', repair_id] });
    },
  });
}
