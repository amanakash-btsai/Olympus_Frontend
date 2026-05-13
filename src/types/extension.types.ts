import type { ExtensionStatus } from './enums';

export interface RequestExtension {
  extension_id: string;
  parent_request_id: string;
  new_return_date: string;
  reason_code: string;
  reason_text?: string;
  status: ExtensionStatus;
  approved_by_id?: string;
  created_at: string;
}

export interface CreateExtensionPayload {
  parent_request_id: string;
  new_return_date: string;
  reason_code: string;
  reason_text?: string;
}
