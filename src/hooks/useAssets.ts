import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateAssetPayload, CreateAssetPayload } from '@/types/asset.types';
import type { AssetStatus, AssetDemoLoanerType } from '@/types/enums';
import {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  transitionAssetStatus,
} from '@/api/assets.api';

interface AssetFilters {
  status?: AssetStatus;
  model_code?: string;
  warehouse_code?: string;
  demo_loaner_type?: AssetDemoLoanerType;
  business_unit?: string;
  area?: string;
  is_active?: boolean;
}

export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => listAssets(filters),
  });
}

export function useAsset(asset_id: string) {
  return useQuery({
    queryKey: ['asset', asset_id],
    queryFn: () => getAsset(asset_id),
    enabled: !!asset_id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssetPayload) => createAsset(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'inventory'] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ asset_id, payload }: { asset_id: string; payload: UpdateAssetPayload }) =>
      updateAsset(asset_id, payload),
    onSuccess: (_, { asset_id }) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', asset_id] });
    },
  });
}

export function useTransitionAssetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ asset_id, status }: { asset_id: string; status: AssetStatus }) =>
      transitionAssetStatus(asset_id, status),
    onSuccess: (_, { asset_id }) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', asset_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'eqc'] });
    },
  });
}
