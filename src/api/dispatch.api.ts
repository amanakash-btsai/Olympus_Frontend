import type { DispatchDocument } from '@/types/dispatch.types';
import type { DispatchDocumentType, DispatchDocStatus } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

interface DispatchFilters {
  status?: DispatchDocStatus;
  deployment_id?: string;
  date_range?: { start: string; end: string };
}

export async function generateDispatchDocument(
  request_id: string,
  document_type: DispatchDocumentType,
): Promise<DispatchDocument> {
  const { data } = await apiClient.post<ApiResponse<DispatchDocument>>('/api/dispatch/generate', {
    request_id,
    document_type,
  });
  return data.data;
}

export async function getDispatchDocument(doc_id: string): Promise<DispatchDocument> {
  const { data } = await apiClient.get<ApiResponse<DispatchDocument>>(`/api/dispatch/${doc_id}`);
  return data.data;
}

export async function listDispatchDocuments(filters?: DispatchFilters): Promise<DispatchDocument[]> {
  const { data } = await apiClient.get<ApiResponse<DispatchDocument[]>>('/api/dispatch', { params: filters });
  return data.data;
}

export async function markSentToPrint(doc_id: string): Promise<DispatchDocument> {
  const { data } = await apiClient.post<ApiResponse<DispatchDocument>>(`/api/dispatch/${doc_id}/print`);
  return data.data;
}

export async function uploadSignedCopy(
  doc_id: string,
  file: File,
  signed_by_name: string,
): Promise<DispatchDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signed_by_name', signed_by_name);
  const { data } = await apiClient.post<ApiResponse<DispatchDocument>>(
    `/api/dispatch/${doc_id}/signed-copy`,
    formData,
    // Let the browser set Content-Type with multipart boundary
    { headers: { 'Content-Type': undefined } },
  );
  return data.data;
}
