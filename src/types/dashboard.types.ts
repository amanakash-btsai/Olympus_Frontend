export interface SalesDashboardData {
  // Aggregates from sales_requests by status, purpose2, sales_person_id
  // and device_deployments.days_outstanding
  [key: string]: unknown;
}

export interface EQCDashboardData {
  // Aggregates from sales_requests.status, dispatch_documents.status,
  // device_deployments.status, inspection_records
  [key: string]: unknown;
}

export interface InventoryDashboardData {
  // Aggregates from assets.status, warehouse_code, model_code,
  // demo_loaner_type, condition_grade, annual_inspection_status
  [key: string]: unknown;
}

export interface OverdueFeedData {
  // device_deployments where days_outstanding > 0
  // ai_prediction_log.prediction_output, teams_alert_log
  [key: string]: unknown;
}

export interface ExecutiveDashboardData {
  // sales_requests aggregates, device_deployments.rental_rate_thb,
  // repair_cases.repair_cost_thb, ai_prediction_log (OVERDUE_FORECAST),
  // event_log aggregates
  [key: string]: unknown;
}

export interface FinanceDashboardData {
  // device_deployments.rental_rate_thb, billing_cycle, is_billable
  // repair_cases.repair_cost_thb, assets.total_repair_amount_thb
  [key: string]: unknown;
}
