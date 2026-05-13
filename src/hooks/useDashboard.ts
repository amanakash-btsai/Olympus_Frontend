import { useQuery } from '@tanstack/react-query';
import {
  getSalesDashboard,
  getEQCDashboard,
  getInventoryDashboard,
  getOverdueFeed,
  getExecutiveDashboard,
  getFinanceDashboard,
} from '@/api/dashboard.api';

const DASHBOARD_OPTIONS = {
  staleTime: 5 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
} as const;

export function useSalesDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'sales'],
    queryFn: getSalesDashboard,
    ...DASHBOARD_OPTIONS,
  });
}

export function useEQCDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'eqc'],
    queryFn: getEQCDashboard,
    ...DASHBOARD_OPTIONS,
  });
}

export function useInventoryDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'inventory'],
    queryFn: getInventoryDashboard,
    ...DASHBOARD_OPTIONS,
  });
}

export function useOverdueFeed() {
  return useQuery({
    queryKey: ['dashboard', 'overdue'],
    queryFn: getOverdueFeed,
    ...DASHBOARD_OPTIONS,
  });
}

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'executive'],
    queryFn: getExecutiveDashboard,
    ...DASHBOARD_OPTIONS,
  });
}

export function useFinanceDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'finance'],
    queryFn: getFinanceDashboard,
    ...DASHBOARD_OPTIONS,
  });
}
