import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateExtensionPayload } from '@/types/extension.types';
import {
  listExtensions,
  createExtension,
  approveExtension,
  rejectExtension,
} from '@/api/extensions.api';

export function useExtensions(parent_request_id: string) {
  return useQuery({
    queryKey: ['extensions', parent_request_id],
    queryFn: () => listExtensions(parent_request_id),
    enabled: !!parent_request_id,
  });
}

export function useCreateExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExtensionPayload) => createExtension(payload),
    onSuccess: (_, { parent_request_id }) => {
      queryClient.invalidateQueries({ queryKey: ['extensions', parent_request_id] });
      queryClient.invalidateQueries({ queryKey: ['salesRequest', parent_request_id] });
    },
  });
}

export function useApproveExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ extension_id }: { extension_id: string; parent_request_id: string }) =>
      approveExtension(extension_id),
    onSuccess: (_, { parent_request_id }) => {
      queryClient.invalidateQueries({ queryKey: ['extensions', parent_request_id] });
      queryClient.invalidateQueries({ queryKey: ['salesRequest', parent_request_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'sales'] });
    },
  });
}

export function useRejectExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ extension_id }: { extension_id: string; parent_request_id: string }) =>
      rejectExtension(extension_id),
    onSuccess: (_, { parent_request_id }) => {
      queryClient.invalidateQueries({ queryKey: ['extensions', parent_request_id] });
      queryClient.invalidateQueries({ queryKey: ['salesRequest', parent_request_id] });
    },
  });
}
