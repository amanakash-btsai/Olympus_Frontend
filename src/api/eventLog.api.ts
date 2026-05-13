import type { EventLog } from '@/types/eventLog.types';
import type { EventEntityType } from '@/types/enums';
import type { ApiResponse, PaginationMeta } from '@/types/api.types';
import { apiClient } from './axiosInstance';

interface Pagination {
  page?: number;
  limit?: number;
}

export interface PaginatedEventLog {
  items: EventLog[];
  meta: PaginationMeta;
}

export async function getEventLog(
  entity_type: EventEntityType,
  entity_id: string,
  pagination?: Pagination,
): Promise<PaginatedEventLog> {
  const { data } = await apiClient.get<ApiResponse<EventLog[]>>('/api/event-log', {
    params: { entity_type, entity_id, ...pagination },
  });
  return { items: data.data, meta: data.meta! };
}

export async function getEventLogByUser(
  user_id: string,
  pagination?: Pagination,
): Promise<PaginatedEventLog> {
  const { data } = await apiClient.get<ApiResponse<EventLog[]>>(`/api/event-log/user/${user_id}`, {
    params: pagination,
  });
  return { items: data.data, meta: data.meta! };
}
