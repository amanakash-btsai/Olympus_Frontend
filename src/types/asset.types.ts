import type {
  AssetStatus,
  AssetDemoLoanerType,
  AssetAgeGroup,
  FDAStatus,
  AnnualInspectionStatus,
  AssetConditionGrade,
} from './enums';

export interface Asset {
  asset_id: string;
  asset_name: string;
  serial_number: string;
  model_code: string;
  model_name?: string;
  sap_asset_number?: string;
  sfdc_asset_id?: string;
  status: AssetStatus;
  demo_loaner_type: AssetDemoLoanerType;
  warehouse_code?: string;
  installation_location?: string;
  account_id?: string;
  fse_owner_id?: string;
  business_unit?: string;
  oth_tier1?: string;
  oth_tier2?: string;
  oth_tier3?: string;
  install_date?: string;
  warranty_start?: string;
  warranty_end?: string;
  invoice_date?: string;
  asset_age_group?: AssetAgeGroup;
  fda_status?: FDAStatus;
  fda_approved_no?: string;
  service_contract_id?: string;
  total_repair_count?: number;
  total_repair_amount_thb?: number;
  last_pm_date?: string;
  annual_inspection_status?: AnnualInspectionStatus;
  condition_grade?: AssetConditionGrade;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetPayload extends Omit<Asset, 'asset_id' | 'created_at' | 'updated_at'> {}
export interface UpdateAssetPayload extends Partial<CreateAssetPayload> {}
