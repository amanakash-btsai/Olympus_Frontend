import type { UserRole } from './enums';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sfdc_user_id?: string;
}
