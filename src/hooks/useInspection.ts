import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InspectionResult, OverallCondition } from '@/types/enums';
import {
  getInspection,
  createInspection,
  recordLineItemResult,
  completeInspection,
} from '@/api/inspection.api';

export function useInspection(inspection_id: string) {
  return useQuery({
    queryKey: ['inspection', inspection_id],
    queryFn: () => getInspection(inspection_id),
    enabled: !!inspection_id,
  });
}

export function useCreateInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deployment_id: string) => createInspection(deployment_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useRecordLineItemResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inspection_id,
      line_id,
      result,
      quantity_actual,
      notes,
    }: {
      inspection_id: string;
      line_id: string;
      result: InspectionResult;
      quantity_actual?: number;
      notes?: string;
    }) => recordLineItemResult(inspection_id, line_id, result, quantity_actual, notes),
    onSuccess: (_, { inspection_id }) => {
      queryClient.invalidateQueries({ queryKey: ['inspection', inspection_id] });
    },
  });
}

export function useCompleteInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inspection_id,
      overall_condition,
      notes,
    }: {
      inspection_id: string;
      overall_condition: OverallCondition;
      notes?: string;
    }) => completeInspection(inspection_id, overall_condition, notes),
    onSuccess: (_, { inspection_id }) => {
      queryClient.invalidateQueries({ queryKey: ['inspection', inspection_id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['repairCases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'eqc'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'inventory'] });
    },
  });
}
