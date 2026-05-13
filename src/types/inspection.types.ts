import type { OverallCondition, InspectionResult, InspectionType } from './enums';

export interface InspectionRecord {
  inspection_id: string;
  deployment_id: string;
  overall_condition?: OverallCondition;
  notes?: string;
  inspected_by_id: string;
  inspected_at: string;
  repair_case_id?: string;
  created_at: string;
  line_items?: InspectionLineItem[];
}

export interface InspectionLineItem {
  item_id: string;
  inspection_id: string;
  bom_line_id: string;
  result: InspectionResult;
  quantity_actual?: number;
  notes?: string;
  inspection_type: InspectionType;
}
