# Data Model & Schema Reference

**Source:** `EQC_Objects_and_Attributes.xlsx` v2.0 — OTH Equipment Co. | Olympus Thailand Medical Division | May 2026

All TypeScript interfaces in `src/types/` are derived directly from this source. When the backend schema changes, update this doc and the corresponding type files — TypeScript will surface every usage that needs updating.

---

## 4.1 Object Summary — 17 Objects

| # | Object Name | SQL Table | Source | Purpose | Fields |
|---|-------------|-----------|--------|---------|--------|
| 1 | Asset (Equipment) | `assets` | SFDC Asset (migrated) | Physical equipment unit — master record for all lifecycle operations | 32 |
| 2 | Sales Request | `sales_requests` | SFDC Demo_Loaner_Request__c (migrated) | Core Demo/Loaner request — system of record replacing Salesforce | 35 |
| 3 | Request Extension | `request_extensions` | NEW | Extension records linked to parent sales_request; maintains extension history | 8 |
| 4 | BOM Set | `bom_sets` | NEW — replaces MS Access | Set definitions A–D with model code and version control | 10 |
| 5 | BOM Line Item | `bom_line_items` | NEW — replaces MS Access | Individual accessory per BOM set with required/optional/consumable flags | 9 |
| 6 | Accessory Master | `accessory_master` | NEW — replaces MS Access | Master catalog of all accessories with codes and device model mapping | 6 |
| 7 | Device Deployment | `device_deployments` | NEW (unified) | Active deployment linking asset to a sales_request with dates and status | 17 |
| 8 | Dispatch Document | `dispatch_documents` | NEW | PDF transport documents with QR code, signature tracking, and printer routing | 14 |
| 9 | Inspection Record | `inspection_records` | NEW | Return inspection result per deployment with BOM item outcomes | 8 |
| 10 | Inspection Line Item | `inspection_line_items` | NEW | Per-item inspection result (Pass/Fail/Missing) linked to BOM line | 7 |
| 11 | Repair Case | `repair_cases` | SFDC Repair__c (migrated) | Repair job record auto-created on inspection fail or damage | 12 |
| 12 | Account (Hospital) | `accounts` | SFDC Account (migrated) | Hospital organization records with location and contact data | 8 |
| 13 | Event Log | `event_log` | NEW | Immutable audit trail for all status transitions across all entities | 12 |
| 14 | Teams Alert Log | `teams_alert_log` | NEW | Record of all Teams adaptive card alerts sent with delivery status | 7 |
| 15 | Users | `users` | SFDC User (migrated) | System users with role, team, and area assignments | 8 |
| 16 | Service Contract | `service_contracts` | SFDC ServiceContract (migrated) | Maintenance/warranty contracts per asset | 6 |
| 17 | AI Prediction Log | `ai_prediction_log` | NEW | Overdue forecast and AI agent output history | 6 |

---

## 4.2 Complete Field Reference

### Asset (Equipment) — `assets`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `asset_id` | UUID | PK | System-generated UUID | YES |
| `asset_name` | VARCHAR(100) | | Human-readable asset name (e.g., CH-S700-XZ-EA) | YES |
| `serial_number` | VARCHAR(50) | UNIQUE | Physical serial number | YES |
| `model_code` | VARCHAR(50) | | Equipment model code (e.g., GIF-Q158, OTV-S200) | YES |
| `model_name` | VARCHAR(200) | | Full model description | NO |
| `sap_asset_number` | VARCHAR(30) | | SAP ERP asset number for master data sync | NO |
| `sfdc_asset_id` | VARCHAR(20) | | Salesforce Asset record ID (18-char) | NO |
| `status` | ENUM | | See ENUM table below | YES |
| `demo_loaner_type` | ENUM | | Asset category classification | YES |
| `warehouse_code` | VARCHAR(50) | | Current warehouse/storage location | NO |
| `installation_location` | VARCHAR(200) | | Specific installation location at hospital | NO |
| `account_id` | UUID | FK → accounts | Current owning or hosting hospital account | NO |
| `fse_owner_id` | UUID | FK → users | Assigned Field Service Engineer | NO |
| `business_unit` | VARCHAR(30) | | e.g., SE (Surgical Endoscopy), GI (Gastrointestinal) | NO |
| `oth_tier1` | VARCHAR(100) | | Product hierarchy level 1 | NO |
| `oth_tier2` | VARCHAR(100) | | Product hierarchy level 2 | NO |
| `oth_tier3` | VARCHAR(100) | | Product hierarchy level 3 | NO |
| `install_date` | DATE | | Commissioning date | NO |
| `warranty_start` | DATE | | Warranty start date | NO |
| `warranty_end` | DATE | | Warranty end date | NO |
| `invoice_date` | DATE | | Invoice/purchase date | NO |
| `asset_age_group` | ENUM | | Young \| Mature \| Old | NO |
| `fda_status` | ENUM | | Not_Enrolled \| Enrolled \| Approved | NO |
| `fda_approved_no` | VARCHAR(50) | | Thailand FDA approval number | NO |
| `service_contract_id` | UUID | FK → service_contracts | Linked service contract | NO |
| `total_repair_count` | INT | | Cumulative number of repair jobs | NO |
| `total_repair_amount_thb` | DECIMAL(12,2) | | Total FOB repair cost in Thai Baht | NO |
| `last_pm_date` | DATE | | Last preventive maintenance date | NO |
| `annual_inspection_status` | ENUM | | 1_Target \| 2_Scheduled \| 3_Completed \| 4_Not_Target | NO |
| `condition_grade` | ENUM | | New \| Good \| Needs_Service \| Defective | NO |
| `is_active` | BOOLEAN | | Soft delete flag | YES |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |
| `updated_at` | TIMESTAMP | | Last update timestamp | YES |

### Sales Request — `sales_requests`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `request_id` | UUID | PK | System-generated UUID | YES |
| `request_number` | VARCHAR(20) | UNIQUE | Auto-number: DR-YYYY-NNNNNN (e.g., DR-2602-106504) | YES |
| `sfdc_request_id` | VARCHAR(20) | | Salesforce Demo_Loaner_Request__c record ID | NO |
| `record_type` | ENUM | | First_Request \| Extension_Request | YES |
| `status` | ENUM | | See ENUM table below | YES |
| `purpose1` | ENUM | | Repair \| Sales \| Marketing \| QARA \| Others | YES |
| `purpose2` | ENUM | | Normal_Repair_Loaner \| Q3S_Loaner \| GI3_Loaner \| Service_Contract_Loaner \| Demonstration \| VPP_CPP_Rental \| Operating_Lease \| Workshop | YES |
| `account_id` | UUID | FK → accounts | Requesting hospital account | YES |
| `department_category` | VARCHAR(200) | | Hospital department category | NO |
| `department_name` | VARCHAR(200) | | Specific department | NO |
| `customer_address` | TEXT | | Full delivery address | NO |
| `customer_pic_id` | UUID | FK → users | Customer person in charge | NO |
| `sales_person_id` | UUID | FK → users | Assigned Sales / FSE user | YES |
| `request_date` | DATE | | Date request was submitted | YES |
| `start_use_date` | DATE | | Requested start date for equipment use | YES |
| `estimate_return_date` | DATE | | Requested return date | YES |
| `actual_return_date` | DATE | | Actual return date (set on return) | NO |
| `repair_case_id` | UUID | FK → repair_cases | Linked repair case (repair-triggered loaners) | NO |
| `parent_request_id` | UUID | FK → sales_requests | For extension requests: links to original | NO |
| `internal_so_number` | VARCHAR(50) | | SAP sales order reference | NO |
| `pr_number` | VARCHAR(50) | | Purchase request number | NO |
| `event_name` | VARCHAR(200) | | Associated medical event or conference | NO |
| `prospect_name` | VARCHAR(200) | | Prospect account name | NO |
| `pcl_number` | VARCHAR(50) | | Product Code List reference | NO |
| `total_loan_period_days` | INT | COMPUTED | actual_return_date - start_use_date | NO |
| `extension_count` | INT DEFAULT 0 | | Number of approved extensions | NO |
| `approved_by_id` | UUID | FK → users | User who approved the request | NO |
| `approved_at` | TIMESTAMP | | Approval timestamp | NO |
| `rejection_reason` | TEXT | | Reason if rejected | NO |
| `bom_set_id` | UUID | FK → bom_sets | BOM set used for picking (Demo only) | NO |
| `dispatch_doc_id` | UUID | FK → dispatch_documents | Associated transport document | NO |
| `inspection_record_id` | UUID | FK → inspection_records | Return inspection record | NO |
| `created_by_id` | UUID | FK → users | User who created the request | YES |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |
| `updated_at` | TIMESTAMP | | Last update timestamp | YES |

### Request Extension — `request_extensions`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `extension_id` | UUID | PK | Primary key | YES |
| `parent_request_id` | UUID | FK → sales_requests | Parent sales request | YES |
| `new_return_date` | DATE | | Requested new return date | YES |
| `reason_code` | VARCHAR(50) | | Extension reason code | YES |
| `reason_text` | TEXT | | Detailed reason for extension | NO |
| `status` | ENUM | | Waiting_Approval \| Approved \| Rejected | YES |
| `approved_by_id` | UUID | FK → users | Manager who approved/rejected | NO |
| `created_at` | TIMESTAMP | | Creation timestamp | YES |

### BOM Set — `bom_sets`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `set_id` | UUID | PK | Primary key | YES |
| `set_name` | VARCHAR(50) | UNIQUE | e.g., Set A, Set B, Set C, Set D | YES |
| `model_code` | VARCHAR(50) | | Applicable device model code | YES |
| `version` | VARCHAR(10) | | Version string (e.g., v1.2) | YES |
| `effective_date` | DATE | | Date this version became active | YES |
| `expiry_date` | DATE | | Date this version expires (NULL = current) | NO |
| `is_active` | BOOLEAN | | Active set flag | YES |
| `description` | TEXT | | Set description and usage notes | NO |
| `created_by_id` | UUID | FK → users | User who created/modified the set | YES |
| `created_at` | TIMESTAMP | | Creation timestamp | YES |

### BOM Line Item — `bom_line_items`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `line_id` | UUID | PK | Primary key | YES |
| `set_id` | UUID | FK → bom_sets | Parent BOM set | YES |
| `accessory_id` | UUID | FK → accessory_master | Accessory master record | YES |
| `sequence_no` | INT | | Display order within the set | NO |
| `quantity_required` | INT | | Expected quantity of this accessory | YES |
| `is_required` | BOOLEAN | | **True = dispatch blocked if missing** | YES |
| `is_optional` | BOOLEAN | | Optional item — warning only if missing | YES |
| `is_consumable` | BOOLEAN | | Single-use — no return expected | YES |
| `storage_location` | VARCHAR(100) | | Warehouse location for picking | NO |

### Accessory Master — `accessory_master`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `accessory_id` | UUID | PK | Primary key | YES |
| `accessory_code` | VARCHAR(50) | UNIQUE | e.g., MAJ-1435 | YES |
| `accessory_name` | VARCHAR(200) | | e.g., Water Supply Tube | YES |
| `device_model_code` | VARCHAR(50) | | Compatible device model code | NO |
| `is_active` | BOOLEAN | | Active in catalog flag | YES |
| `created_at` | TIMESTAMP | | Creation timestamp | YES |

### Device Deployment — `device_deployments`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `deployment_id` | UUID | PK | Primary key | YES |
| `request_id` | UUID | FK → sales_requests | Linked sales request | YES |
| `asset_id` | UUID | FK → assets | Deployed equipment asset | YES |
| `deployment_type` | ENUM | | Demo \| Loaner \| Rental \| Operating_Lease | YES |
| `status` | ENUM | | Preparing \| Dispatched \| With_Customer \| Returned \| In_Inspection \| In_Repair | YES |
| `start_date` | DATE | | Actual dispatch date | YES |
| `expected_return_date` | DATE | | Expected return date (updated on extension) | YES |
| `actual_return_date` | DATE | | Actual return date | NO |
| `days_outstanding` | INT | COMPUTED | TODAY - expected_return_date (overdue calc) | NO |
| `condition_on_dispatch` | ENUM | | New \| Good \| Needs_Service | NO |
| `condition_on_return` | ENUM | | Good \| Needs_Cleaning \| Defective \| Missing | NO |
| `is_billable` | BOOLEAN | | Whether rental billing applies | NO |
| `rental_rate_thb` | DECIMAL(10,2) | | Daily rental rate if billable | NO |
| `billing_cycle` | ENUM | | Daily \| Weekly \| Monthly | NO |
| `responsible_eqc_id` | UUID | FK → users | EQC operator responsible | NO |
| `created_at` | TIMESTAMP | | Creation timestamp | YES |
| `updated_at` | TIMESTAMP | | Last update timestamp | YES |

### Dispatch Document — `dispatch_documents`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `doc_id` | UUID | PK | Primary key | YES |
| `deployment_id` | UUID | FK → device_deployments | Associated deployment | YES |
| `document_type` | ENUM | | First_Request \| Extension \| Item_List \| Return_Receipt | YES |
| `pdf_blob_url` | VARCHAR(500) | | Azure Blob Storage URL for the PDF | NO |
| `qr_code_value` | VARCHAR(200) | | QR code data (links to deployment in WebApp) | NO |
| `qr_code_image_url` | VARCHAR(500) | | Blob URL for QR code image | NO |
| `generated_by_id` | UUID | FK → users | EQC user who triggered generation | YES |
| `generated_at` | TIMESTAMP | | PDF generation timestamp | YES |
| `printer_sent_at` | TIMESTAMP | | Time sent to warehouse printer | NO |
| `signed_copy_url` | VARCHAR(500) | | Blob URL for uploaded signed copy | NO |
| `signed_by_name` | VARCHAR(100) | | Warehouse staff who signed (free text) | NO |
| `signed_at` | TIMESTAMP | | Signature timestamp | NO |
| `status` | ENUM | | Generated \| Sent_to_Print \| Signed \| Uploaded \| Archived | YES |
| `sap_gi_triggered` | BOOLEAN DEFAULT false | | SAP Goods Issue triggered on upload | NO |
| `sap_gi_triggered_at` | TIMESTAMP | | SAP GI trigger timestamp | NO |

### Inspection Record — `inspection_records`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `inspection_id` | UUID | PK | Primary key | YES |
| `deployment_id` | UUID | FK → device_deployments | Associated deployment | YES |
| `overall_condition` | ENUM | | Good \| Needs_Cleaning \| Defective \| Missing | NO |
| `notes` | TEXT | | Inspector notes | NO |
| `inspected_by_id` | UUID | FK → users | EQC operator who performed inspection | YES |
| `inspected_at` | TIMESTAMP | | Inspection completion timestamp | YES |
| `repair_case_id` | UUID | FK → repair_cases | Auto-created repair case if defect found | NO |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |

### Inspection Line Item — `inspection_line_items`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `item_id` | UUID | PK | Primary key | YES |
| `inspection_id` | UUID | FK → inspection_records | Parent inspection record | YES |
| `bom_line_id` | UUID | FK → bom_line_items | BOM line item being inspected | YES |
| `result` | ENUM | | **Pass \| Fail \| Missing** | YES |
| `quantity_actual` | INT | | Actual quantity returned | NO |
| `notes` | TEXT | | Notes on this specific item | NO |
| `inspection_type` | ENUM | | DISPATCH \| RETURN | YES |

### Repair Case — `repair_cases`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `repair_id` | UUID | PK | Primary key | YES |
| `rs_number` | VARCHAR(30) | UNIQUE | e.g., RS-202602-099595 | YES |
| `eas_no` | VARCHAR(20) | | EAS system number | NO |
| `asset_id` | UUID | FK → assets | Asset under repair | YES |
| `account_id` | UUID | FK → accounts | Hospital where repair is based | YES |
| `sfdc_repair_id` | VARCHAR(20) | | Salesforce Repair__c record ID | NO |
| `status` | ENUM | | Quoted \| IQ_Quoted \| PO_Received \| Parts_Arranged \| Confirmed \| Completed | YES |
| `repair_type` | ENUM | | Normal_Repair \| Q3S_Repair \| GI_Repair \| Service_Contract | YES |
| `area` | VARCHAR(20) | | CENTRAL \| EAST \| NORTH \| SOUTH \| LAOS | NO |
| `repair_cost_thb` | DECIMAL(12,2) | | Total repair cost in Thai Baht | NO |
| `fse_assigned_id` | UUID | FK → users | Assigned FSE for repair | NO |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |

### Account (Hospital) — `accounts`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `account_id` | UUID | PK | Primary key | YES |
| `account_name` | VARCHAR(200) | | Hospital / organization name | YES |
| `address` | TEXT | | Full address | NO |
| `area` | VARCHAR(20) | | CENTRAL \| EAST \| NORTH \| SOUTH \| LAOS | NO |
| `department` | VARCHAR(200) | | Primary department | NO |
| `segmentation` | VARCHAR(100) | | Hospital segmentation group | NO |
| `group_wave` | VARCHAR(100) | | SFDC group/wave classification | NO |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |

### Event Log — `event_log` (IMMUTABLE)

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `log_id` | UUID | PK | Primary key — immutable | YES |
| `entity_type` | ENUM | | asset \| sales_request \| deployment \| dispatch_doc \| inspection \| repair_case \| bom_set | YES |
| `entity_id` | UUID | | Record ID of the affected entity | YES |
| `event_type` | VARCHAR(100) | | STATUS_CHANGE \| FIELD_UPDATE \| APPROVAL \| EXTENSION \| DISPATCH \| RETURN | YES |
| `old_value` | TEXT | | Previous value (JSON for complex changes) | NO |
| `new_value` | TEXT | | New value (JSON for complex changes) | NO |
| `actor_id` | UUID | FK → users | User who caused the event (NULL = system/AI) | NO |
| `actor_type` | ENUM | | User \| System \| AI_Agent \| Integration | YES |
| `timestamp` | TIMESTAMP | | Event timestamp — UTC | YES |
| `narrative` | TEXT | | Human-readable: "[User] changed status from X → Y on [Date]" | YES |
| `ip_address` | VARCHAR(50) | | Client IP for security audit | NO |
| `session_id` | VARCHAR(100) | | User session identifier | NO |

### Teams Alert Log — `teams_alert_log`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `alert_id` | UUID | PK | Primary key | YES |
| `alert_type` | VARCHAR(100) | | e.g., OVERDUE, DISPATCH_UNSIGNED, LOW_INVENTORY | YES |
| `channel` | VARCHAR(100) | | Teams channel (e.g., #demo-alerts) | YES |
| `payload` | TEXT | | Adaptive card JSON payload | NO |
| `delivery_status` | ENUM | | Sent \| Delivered \| Failed \| Retry | YES |
| `message_id` | VARCHAR(100) | | Teams message ID | NO |
| `created_at` | TIMESTAMP | | Alert creation timestamp | YES |

### Users — `users`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `user_id` | UUID | PK | Primary key | YES |
| `name` | VARCHAR(200) | | Full name | YES |
| `email` | VARCHAR(200) | UNIQUE | Corporate email address | YES |
| `role` | ENUM | | Sales_Rep \| FSE \| EQC_Operator \| EQC_Manager \| Sales_Manager \| Executive \| System_Admin \| Integration_Service | YES |
| `team` | VARCHAR(100) | | Team assignment | NO |
| `area` | VARCHAR(50) | | CENTRAL \| EAST \| NORTH \| SOUTH \| LAOS | NO |
| `sfdc_user_id` | VARCHAR(20) | | Salesforce user ID (SFDC is master for user data) | NO |
| `is_active` | BOOLEAN | | Active user flag | YES |

### Service Contract — `service_contracts`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `contract_id` | UUID | PK | Primary key | YES |
| `contract_number` | VARCHAR(50) | UNIQUE | Contract reference number | YES |
| `asset_id` | UUID | FK → assets | Asset covered by this contract | YES |
| `contract_type` | VARCHAR(100) | | Maintenance \| Warranty \| Comprehensive | YES |
| `start_date` | DATE | | Contract start date | YES |
| `end_date` | DATE | | Contract end date | YES |

### AI Prediction Log — `ai_prediction_log`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `prediction_id` | UUID | PK | Primary key | YES |
| `prediction_type` | VARCHAR(100) | | OVERDUE_FORECAST \| ANOMALY_DETECTION \| AUDIT_NARRATION | YES |
| `entity_id` | UUID | | Referenced entity ID | YES |
| `entity_type` | VARCHAR(50) | | Entity type (asset/deployment/request) | YES |
| `prediction_output` | TEXT | | AI prediction result / suggested action | YES |
| `confidence_score` | DECIMAL(5,4) | | Confidence score 0.0000–1.0000 | NO |

---

## 4.3 ENUM / Status Value Reference

| Object | Field | Allowed Values |
|--------|-------|----------------|
| Asset | `status` | `Available` \| `Requested` \| `Preparing` \| `BOM_Confirmed` \| `Dispatched` \| `In_Transit` \| `With_Customer` \| `Return_Initiated` \| `In_Inspection` \| `Cleaning` \| `Under_Repair` \| `Quarantine` \| `Extension_Used` \| `Overdue` \| `Retired` |
| Asset | `demo_loaner_type` | `Demo_Asset` \| `Loaner_Asset` \| `MBA_Asset` \| `Service_Center` \| `Rental` \| `Operating_Lease` \| `Workshop` \| `MKTS` \| `Comprehensive_Contract` |
| Asset | `asset_age_group` | `Young` \| `Mature` \| `Old` |
| Asset | `fda_status` | `Not_Enrolled` \| `Enrolled` \| `Approved` |
| Asset | `annual_inspection_status` | `1_Target` \| `2_Scheduled` \| `3_Completed` \| `4_Not_Target` |
| Asset | `condition_grade` | `New` \| `Good` \| `Needs_Service` \| `Defective` |
| Sales Request | `record_type` | `First_Request` \| `Extension_Request` |
| Sales Request | `status` | `Draft` \| `Waiting_Approval` \| `Waiting_Reservation` \| `Preparing` \| `BOM_Confirmed` \| `Ready_for_Dispatch` \| `Dispatched` \| `With_Customer` \| `Return_Initiated` \| `Request_Complete` \| `Cancelled` |
| Sales Request | `purpose1` | `Repair` \| `Sales` \| `Marketing` \| `QARA` \| `Others` |
| Sales Request | `purpose2` | `Normal_Repair_Loaner` \| `Q3S_Loaner` \| `GI3_Loaner` \| `Service_Contract_Loaner` \| `Demonstration` \| `VPP_CPP_Rental` \| `Operating_Lease` \| `Workshop` |
| Request Extension | `status` | `Waiting_Approval` \| `Approved` \| `Rejected` |
| Device Deployment | `deployment_type` | `Demo` \| `Loaner` \| `Rental` \| `Operating_Lease` |
| Device Deployment | `status` | `Preparing` \| `Dispatched` \| `With_Customer` \| `Returned` \| `In_Inspection` \| `In_Repair` |
| Device Deployment | `condition_on_dispatch` | `New` \| `Good` \| `Needs_Service` |
| Device Deployment | `condition_on_return` | `Good` \| `Needs_Cleaning` \| `Defective` \| `Missing` |
| Device Deployment | `billing_cycle` | `Daily` \| `Weekly` \| `Monthly` |
| Dispatch Document | `document_type` | `First_Request` \| `Extension` \| `Item_List` \| `Return_Receipt` |
| Dispatch Document | `status` | `Generated` \| `Sent_to_Print` \| `Signed` \| `Uploaded` \| `Archived` |
| Inspection Line Item | `result` | `Pass` \| `Fail` \| `Missing` |
| Inspection Line Item | `inspection_type` | `DISPATCH` \| `RETURN` |
| Repair Case | `status` | `Quoted` \| `IQ_Quoted` \| `PO_Received` \| `Parts_Arranged` \| `Confirmed` \| `Completed` |
| Repair Case | `repair_type` | `Normal_Repair` \| `Q3S_Repair` \| `GI_Repair` \| `Service_Contract` |
| Event Log | `entity_type` | `asset` \| `sales_request` \| `deployment` \| `dispatch_doc` \| `inspection` \| `repair_case` \| `bom_set` |
| Event Log | `actor_type` | `User` \| `System` \| `AI_Agent` \| `Integration` |
| Teams Alert Log | `delivery_status` | `Sent` \| `Delivered` \| `Failed` \| `Retry` |
| Users | `role` | `Sales_Rep` \| `FSE` \| `EQC_Operator` \| `EQC_Manager` \| `Sales_Manager` \| `Executive` \| `System_Admin` \| `Integration_Service` |
| AI Prediction Log | `prediction_type` | `OVERDUE_FORECAST` \| `ANOMALY_DETECTION` \| `AUDIT_NARRATION` |

---

## 4.4 Object Relationships

| # | From | Cardinality | To | Join Key | Notes |
|---|------|-------------|-----|----------|-------|
| 1 | Sales Request | Many → One | Account (Hospital) | `account_id` | Each request belongs to one hospital |
| 2 | Sales Request | Many → One | Users (Sales Person) | `sales_person_id` | Assigned FSE / Sales rep |
| 3 | Sales Request | Many → One | Repair Case | `repair_case_id` | Repair-triggered loaners link to repair |
| 4 | Sales Request | Many → One (self) | Sales Request (parent) | `parent_request_id` | Extension request hierarchy |
| 5 | Device Deployment | Many → One | Sales Request | `request_id` | One request can deploy multiple assets |
| 6 | Device Deployment | Many → One | Asset (Equipment) | `asset_id` | Each deployment is one physical asset |
| 7 | Asset (Equipment) | Many → One | Account (Hospital) | `account_id` | Asset currently at or owned by hospital |
| 8 | Asset (Equipment) | One → Many | Device Deployment | `asset_id` | Asset has full deployment history |
| 9 | Asset (Equipment) | One → Many | Repair Case | `asset_id` | Asset has multiple repair histories |
| 10 | Repair Case | Many → One | Asset (Equipment) | `asset_id` | Each repair is for one asset |
| 11 | Repair Case | Many → One | Account (Hospital) | `account_id` | Repair at hospital site |
| 12 | BOM Set | One → Many | BOM Line Item | `set_id` | Set contains multiple accessory lines |
| 13 | BOM Line Item | Many → One | Accessory Master | `accessory_id` | Line references master accessory |
| 14 | Sales Request | One → One | Dispatch Document | `dispatch_doc_id` | Request has one transport document |
| 15 | Sales Request | One → One | Inspection Record | `inspection_record_id` | Request has one return inspection |
| 16 | Inspection Record | One → Many | Inspection Line Item | `inspection_id` | Inspection has per-item results |
| 17 | Event Log | Many → One (polymorphic) | Any Entity | `entity_id` + `entity_type` | Audit trail for all entities |
| 18 | Asset (Equipment) | Many → One | Service Contract | `service_contract_id` | Asset covered by service contract |
| 19 | Request Extension | Many → One | Sales Request | `parent_request_id` | Extension links to parent request |
| 20 | Teams Alert Log | Linked to | Any Entity | `alert_type` + entity context | Alert log for Teams notifications |
