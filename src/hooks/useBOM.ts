import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BOMSet, BOMLineItem } from '@/types/bom.types';
import {
  listBOMSets,
  getBOMSet,
  createBOMSet,
  updateBOMSet,
  getBOMLineItems,
  createBOMLineItem,
  updateBOMLineItem,
  listAccessoryMaster,
  validatePacking,
} from '@/api/bom.api';

interface CreateBOMSetPayload extends Omit<BOMSet, 'set_id' | 'created_at' | 'created_by_id'> {}
interface UpdateBOMSetPayload extends Partial<CreateBOMSetPayload> {}
interface CreateBOMLineItemPayload extends Omit<BOMLineItem, 'line_id' | 'set_id' | 'accessory'> {}
interface UpdateBOMLineItemPayload extends Partial<CreateBOMLineItemPayload> {}

interface AccessoryFilters {
  device_model_code?: string;
  is_active?: boolean;
}

export function useBOMSets(model_code?: string) {
  return useQuery({
    queryKey: ['bomSets', model_code],
    queryFn: () => listBOMSets(model_code),
  });
}

export function useBOMSet(set_id: string) {
  return useQuery({
    queryKey: ['bomSet', set_id],
    queryFn: () => getBOMSet(set_id),
    enabled: !!set_id,
  });
}

export function useBOMLineItems(set_id: string) {
  return useQuery({
    queryKey: ['bomLineItems', set_id],
    queryFn: () => getBOMLineItems(set_id),
    enabled: !!set_id,
  });
}

export function useAccessoryMaster(filters?: AccessoryFilters) {
  return useQuery({
    queryKey: ['accessories', filters],
    queryFn: () => listAccessoryMaster(filters),
  });
}

export function useCreateBOMSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBOMSetPayload) => createBOMSet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bomSets'] });
    },
  });
}

export function useUpdateBOMSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ set_id, payload }: { set_id: string; payload: UpdateBOMSetPayload }) =>
      updateBOMSet(set_id, payload),
    onSuccess: (_, { set_id }) => {
      queryClient.invalidateQueries({ queryKey: ['bomSets'] });
      queryClient.invalidateQueries({ queryKey: ['bomSet', set_id] });
    },
  });
}

export function useCreateBOMLineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ set_id, payload }: { set_id: string; payload: CreateBOMLineItemPayload }) =>
      createBOMLineItem(set_id, payload),
    onSuccess: (_, { set_id }) => {
      queryClient.invalidateQueries({ queryKey: ['bomLineItems', set_id] });
    },
  });
}

export function useUpdateBOMLineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ line_id, payload }: { line_id: string; set_id: string; payload: UpdateBOMLineItemPayload }) =>
      updateBOMLineItem(line_id, payload),
    onSuccess: (_, { set_id }) => {
      queryClient.invalidateQueries({ queryKey: ['bomLineItems', set_id] });
    },
  });
}

export function useValidatePacking() {
  return useMutation({
    mutationFn: ({ bom_set_id, packed_line_ids }: { bom_set_id: string; packed_line_ids: string[] }) =>
      validatePacking(bom_set_id, packed_line_ids),
  });
}
