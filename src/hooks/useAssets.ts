// ─────────────────────────────────────────────────────────────────────────────
// FILE: hooks/useAssets.ts
// React Query hooks for all asset-related data fetching and mutations.
//
// "hooks" are the bridge between React components and the API layer. Instead
// of components calling fetch() directly, they call these hooks which:
//   - Cache the results (so /api/assets isn't called 5 times for 5 components)
//   - Track loading/error state automatically
//   - Invalidate the cache when data changes (so the UI auto-updates after mutations)
//
// useQuery   = for reading data (GET requests)
// useMutation = for changing data (POST/PATCH requests)
// queryKey   = a unique identifier for the cached data — same key = same cache entry
// ─────────────────────────────────────────────────────────────────────────────

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

// useAssets: fetch a list of assets, optionally filtered.
// ['assets', filters] means the cache is per-filter-combination.
export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => listAssets(filters),
  });
}

// useAsset: fetch one asset's full detail.
// `enabled: !!asset_id` prevents the query from running if asset_id is empty/undefined.
export function useAsset(asset_id: string) {
  return useQuery({
    queryKey: ['asset', asset_id],
    queryFn: () => getAsset(asset_id),
    enabled: !!asset_id,
  });
}

// useCreateAsset: mutation for creating a new asset.
// onSuccess: tell React Query to throw away the cached assets list
// so it re-fetches from the server (showing the new asset).
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

// useUpdateAsset: update one asset's fields (PATCH).
// Invalidates both the list cache and the individual asset's cache.
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

// useTransitionAssetStatus: move an asset through its lifecycle
// (e.g. Available → Requested → Dispatched).
// Invalidates more caches because status changes affect dashboard counts too.
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
