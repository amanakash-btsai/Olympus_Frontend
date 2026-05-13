export interface BOMSet {
  set_id: string;
  set_name: string;                     // e.g., Set A, Set B, Set C, Set D
  model_code: string;
  version: string;
  effective_date: string;
  expiry_date?: string;
  is_active: boolean;
  description?: string;
  created_by_id: string;
  created_at: string;
}

export interface BOMLineItem {
  line_id: string;
  set_id: string;
  accessory_id: string;
  sequence_no?: number;
  quantity_required: number;
  is_required: boolean;                 // true = dispatch blocked if missing
  is_optional: boolean;
  is_consumable: boolean;
  storage_location?: string;
  accessory?: AccessoryMaster;          // Populated via join
}

export interface AccessoryMaster {
  accessory_id: string;
  accessory_code: string;               // e.g., MAJ-1435
  accessory_name: string;               // e.g., Water Supply Tube
  device_model_code?: string;
  is_active: boolean;
  created_at: string;
}

export interface PackingValidationResult {
  isComplete: boolean;
  missingItems: Array<{
    line_id: string;
    accessory_name: string;
    quantity_required: number;
  }>;
}
