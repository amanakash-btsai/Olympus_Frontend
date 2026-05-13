import type { AreaCode } from './enums';

export interface Account {
  account_id: string;
  account_name: string;
  hospital_name?: string;
  address?: string;
  area?: AreaCode;
  department?: string;
  segmentation?: string;
  group_wave?: string;
  created_at: string;
}
