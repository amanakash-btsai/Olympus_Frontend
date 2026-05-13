import type { DispatchDocumentType, DispatchDocStatus } from './enums';

export interface DispatchDocument {
  doc_id: string;
  deployment_id: string;
  document_type: DispatchDocumentType;
  pdf_blob_url?: string;
  qr_code_value?: string;
  qr_code_image_url?: string;
  generated_by_id: string;
  generated_at: string;
  printer_sent_at?: string;
  signed_copy_url?: string;
  signed_by_name?: string;
  signed_at?: string;
  status: DispatchDocStatus;
  sap_gi_triggered: boolean;
  sap_gi_triggered_at?: string;
}
