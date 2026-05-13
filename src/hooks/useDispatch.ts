import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DispatchDocumentType, DispatchDocStatus } from '@/types/enums';
import {
  listDispatchDocuments,
  getDispatchDocument,
  generateDispatchDocument,
  markSentToPrint,
  uploadSignedCopy,
} from '@/api/dispatch.api';

interface DispatchFilters {
  status?: DispatchDocStatus;
  deployment_id?: string;
  date_range?: { start: string; end: string };
}

export function useDispatchDocuments(filters?: DispatchFilters) {
  return useQuery({
    queryKey: ['dispatchDocuments', filters],
    queryFn: () => listDispatchDocuments(filters),
  });
}

export function useDispatchDocument(doc_id: string) {
  return useQuery({
    queryKey: ['dispatchDocument', doc_id],
    queryFn: () => getDispatchDocument(doc_id),
    enabled: !!doc_id,
  });
}

export function useGenerateDispatchDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ request_id, document_type }: { request_id: string; document_type: DispatchDocumentType }) =>
      generateDispatchDocument(request_id, document_type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatchDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['salesRequests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'eqc'] });
    },
  });
}

export function useMarkSentToPrint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc_id: string) => markSentToPrint(doc_id),
    onSuccess: (_, doc_id) => {
      queryClient.invalidateQueries({ queryKey: ['dispatchDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['dispatchDocument', doc_id] });
    },
  });
}

export function useUploadSignedCopy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doc_id, file, signed_by_name }: { doc_id: string; file: File; signed_by_name: string }) =>
      uploadSignedCopy(doc_id, file, signed_by_name),
    onSuccess: (_, { doc_id }) => {
      queryClient.invalidateQueries({ queryKey: ['dispatchDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['dispatchDocument', doc_id] });
    },
  });
}
