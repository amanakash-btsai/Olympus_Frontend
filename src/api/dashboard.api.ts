import type {
  SalesDashboardData,
  EQCDashboardData,
  InventoryDashboardData,
  OverdueFeedData,
  ExecutiveDashboardData,
  FinanceDashboardData,
} from '@/types/dashboard.types';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

export async function getSalesDashboard(): Promise<SalesDashboardData> {
  const { data } = await apiClient.get<ApiResponse<SalesDashboardData>>('/api/dashboard/sales');
  return data.data;
}

export async function getEQCDashboard(): Promise<EQCDashboardData> {
  const { data } = await apiClient.get<ApiResponse<EQCDashboardData>>('/api/dashboard/eqc');
  return data.data;
}

export async function getInventoryDashboard(): Promise<InventoryDashboardData> {
  const { data } = await apiClient.get<ApiResponse<InventoryDashboardData>>('/api/dashboard/inventory');
  return data.data;
}

export async function getOverdueFeed(): Promise<OverdueFeedData> {
  const { data } = await apiClient.get<ApiResponse<OverdueFeedData>>('/api/dashboard/overdue');
  return data.data;
}

export async function getExecutiveDashboard(): Promise<ExecutiveDashboardData> {
  const { data } = await apiClient.get<ApiResponse<ExecutiveDashboardData>>('/api/dashboard/executive');
  return data.data;
}

export async function getFinanceDashboard(): Promise<FinanceDashboardData> {
  const { data } = await apiClient.get<ApiResponse<FinanceDashboardData>>('/api/dashboard/finance');
  return data.data;
}
