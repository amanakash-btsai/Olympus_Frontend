import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateSalesRequestPayload } from '@/types/salesRequest.types';
import type { SalesRequestStatus, SalesRequestRecordType, SalesRequestPurpose1, SalesRequestPurpose2 } from '@/types/enums';
import {
  listSalesRequests,
  getSalesRequest,
  createSalesRequest,
  approveSalesRequest,
  rejectSalesRequest,
  markReturned,
  cancelSalesRequest,
} from '@/api/salesRequests.api';

interface SalesRequestFilters {
  status?: SalesRequestStatus;
  record_type?: SalesRequestRecordType;
  purpose1?: SalesRequestPurpose1;
  purpose2?: SalesRequestPurpose2;
  account_id?: string;
  sales_person_id?: string;
  date_range?: { start: string; end: string };
}

export function useSalesRequests(filters?: SalesRequestFilters) {
  return useQuery({
    queryKey: ['salesRequests', filters],
    queryFn: () => listSalesRequests(filters),
  });
}

export function useSalesRequest(request_id: string) {
  return useQuery({
    queryKey: ['salesRequest', request_id],
    queryFn: () => getSalesRequest(request_id),
    enabled: !!request_id,
  });
}

export function useCreateSalesRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalesRequestPayload) => createSalesRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesRequests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'sales'] });
    },
  });
}

export function useApproveSalesRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request_id: string) => approveSalesRequest(request_id),
    onSuccess: (_, request_id) => {
      queryClient.invalidateQueries({ queryKey: ['salesRequests'] });
      queryClient.invalidateQueries({ queryKey: ['salesRequest', request_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'eqc'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'manager'] });
    },
  });
}

export function useRejectSalesRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ request_id, rejection_reason }: { request_id: string; rejection_reason: string }) =>
      rejectSalesRequest(request_id, rejection_reason),
    onSuccess: (_, { request_id }) => {
      queryClient.invalidateQueries({ queryKey: ['salesRequests'] });
      queryClient.invalidateQueries({ queryKey: ['salesRequest', request_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'sales'] });
    },
  });
}

export function useMarkReturned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request_id: string) => markReturned(request_id),
    onSuccess: (_, request_id) => {
      queryClient.invalidateQueries({ queryKey: ['salesRequests'] });
      queryClient.invalidateQueries({ queryKey: ['salesRequest', request_id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'eqc'] });
    },
  });
}

export function useCancelSalesRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request_id: string) => cancelSalesRequest(request_id),
    onSuccess: (_, request_id) => {
      queryClient.invalidateQueries({ queryKey: ['salesRequests'] });
      queryClient.invalidateQueries({ queryKey: ['salesRequest', request_id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'sales'] });
    },
  });
}
