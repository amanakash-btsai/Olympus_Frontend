import type {
  DeploymentType,
  DeploymentStatus,
  ConditionOnDispatch,
  ConditionOnReturn,
  BillingCycle,
} from './enums';

export interface DeviceDeployment {
  deployment_id: string;
  request_id: string;
  asset_id: string;
  deployment_type: DeploymentType;
  status: DeploymentStatus;
  start_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  days_outstanding?: number;            // Computed: TODAY - expected_return_date
  condition_on_dispatch?: ConditionOnDispatch;
  condition_on_return?: ConditionOnReturn;
  is_billable?: boolean;
  rental_rate_thb?: number;
  billing_cycle?: BillingCycle;
  responsible_eqc_id?: string;
  created_at: string;
  updated_at: string;
}
