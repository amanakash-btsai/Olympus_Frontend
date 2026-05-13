import type { RepairCaseStatus, RepairType, AreaCode } from './enums';

export interface RepairCase {
  repair_id: string;
  rs_number: string;                    // e.g., RS-202602-099595
  eas_no?: string;
  asset_id: string;
  account_id: string;
  sfdc_repair_id?: string;
  status: RepairCaseStatus;
  repair_type: RepairType;
  area?: AreaCode;
  repair_cost_thb?: number;
  fse_assigned_id?: string;
  created_at: string;
}
