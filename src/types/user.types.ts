import type { UserRole, AreaCode } from './enums';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  area?: AreaCode;
  sfdc_user_id?: string;
  is_active: boolean;
}
