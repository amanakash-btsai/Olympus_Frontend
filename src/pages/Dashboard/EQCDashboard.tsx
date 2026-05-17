import { useState } from 'react';
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MapPin, Package, Truck, Wrench, AlertTriangle, CheckCircle2,
  Boxes, Activity, BarChart2, ClipboardCheck, FileText, CheckSquare,
  ChevronRight, ShieldCheck, RefreshCw, Layers,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { listSalesRequests } from '@/api/salesRequests.api';
import type { SalesRequestDetail } from '@/types/salesRequest.types';

// ─────────────────────────────────────────────────────────────────────────────
// Toggle: set to true to fall back to all mock data (no API calls)
// ─────────────────────────────────────────────────────────────────────────────
const USE_MOCK_DATA = false;

// Statuses visible in the EQC "Approved Requests" table
const EQC_ACTIVE_STATUSES = 'Waiting_Reservation,Preparing,BOM_Confirmed,Ready_for_Dispatch';

const WAREHOUSES = ['All Locations', 'Head Office', 'Warehouse A', 'Warehouse B', 'Warehouse C'];

interface InventoryStats {
  available: number; inPreparation: number; inTransit: number; inRepair: number; quarantine: number;
}

const WAREHOUSE_STATS: Record<string, InventoryStats> = {
  'All Locations': { available: 42, inPreparation: 8,  inTransit: 5, inRepair: 7, quarantine: 3 },
  'Head Office':   { available: 18, inPreparation: 3,  inTransit: 2, inRepair: 2, quarantine: 1 },
  'Warehouse A':   { available: 12, inPreparation: 2,  inTransit: 1, inRepair: 3, quarantine: 1 },
  'Warehouse B':   { available: 8,  inPreparation: 2,  inTransit: 1, inRepair: 1, quarantine: 1 },
  'Warehouse C':   { available: 4,  inPreparation: 1,  inTransit: 1, inRepair: 1, quarantine: 0 },
};

type PrepStatus = 'Pending Preparation' | 'In Preparation' | 'Ready for Dispatch';

interface ForwardedRow {
  id: string;
  requestNumber: string;
  assetName: string;
  hospitalName: string;
  salesRep: string;
  startDate: string;
  returnDate: string;
  status: PrepStatus;
}

/* ── Mock data (used when USE_MOCK_DATA = true) ─────────────────────────────*/
const MOCK_FORWARDED: ForwardedRow[] = [
  { id: '1', requestNumber: 'REQ-2026-002', assetName: 'CV-1000-004',  hospitalName: 'Northside Medical Centre',   salesRep: 'Bob Martinez', startDate: '2026-05-18', returnDate: '2026-05-25', status: 'In Preparation'      },
  { id: '2', requestNumber: 'REQ-2026-007', assetName: 'MAJ-971-007',  hospitalName: 'Sunrise Health Center',       salesRep: 'Grace Park',   startDate: '2026-05-17', returnDate: '2026-05-24', status: 'Ready for Dispatch'  },
  { id: '3', requestNumber: 'REQ-2026-008', assetName: 'CLV-190-006',  hospitalName: 'Pioneer General Hospital',    salesRep: 'Frank Nguyen', startDate: '2026-05-19', returnDate: '2026-05-26', status: 'Pending Preparation' },
  { id: '4', requestNumber: 'REQ-2026-009', assetName: 'MEF-200-008',  hospitalName: 'Valley Medical Group',        salesRep: 'Carol Tanaka', startDate: '2026-05-20', returnDate: '2026-05-27', status: 'Pending Preparation' },
  { id: '5', requestNumber: 'REQ-2026-010', assetName: 'LMD-100-009',  hospitalName: 'Metro Specialist Centre',     salesRep: 'David Kim',    startDate: '2026-05-22', returnDate: '2026-05-29', status: 'Pending Preparation' },
];

/* ── Map DB status → EQC prep display status ─────────────────────────────── */
function dbToPrepStatus(dbStatus: string): PrepStatus {
  switch (dbStatus) {
    case 'Waiting_Reservation': return 'Pending Preparation';
    case 'Preparing':           return 'In Preparation';
    case 'BOM_Confirmed':
    case 'Ready_for_Dispatch':  return 'Ready for Dispatch';
    default:                    return 'Pending Preparation';
  }
}

/* ── Map SalesRequestDetail → ForwardedRow ───────────────────────────────── */
function detailToForwardedRow(r: SalesRequestDetail): ForwardedRow {
  const firstAsset = r.deployments?.[0]?.asset;
  return {
    id:           r.request_id,
    requestNumber: r.request_number,
    assetName:    firstAsset?.asset_name ?? '—',
    hospitalName: r.account?.account_name ?? '—',
    salesRep:     r.sales_person?.name ?? '—',
    startDate:    r.start_use_date.slice(0, 10),
    returnDate:   r.estimate_return_date.slice(0, 10),
    status:       dbToPrepStatus(r.status),
  };
}

const PREP_STATUS_CONFIG: Record<PrepStatus, { badge: string; dot: string; label: string }> = {
  'Pending Preparation': { badge: 'bg-amber-50 text-amber-700 border border-amber-200',       dot: 'bg-amber-400',   label: 'Pending'    },
  'In Preparation':      { badge: 'bg-blue-50 text-blue-700 border border-blue-200',           dot: 'bg-blue-500',    label: 'In Prep'    },
  'Ready for Dispatch':  { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', label: 'Ready'      },
};

interface UtilizationRow { setType: string; total: number; inUse: number; }

const UTILIZATION: UtilizationRow[] = [
  { setType: 'Endoscope Set',       total: 15, inUse: 10 },
  { setType: 'Cardiac Monitor Set', total: 12, inUse: 9  },
  { setType: 'Ultrasound Unit',     total: 10, inUse: 6  },
  { setType: 'Surgical Kit',        total: 8,  inUse: 4  },
  { setType: 'Infusion Pump',       total: 7,  inUse: 5  },
  { setType: 'Ventilator Pack',     total: 6,  inUse: 2  },
  { setType: 'Defibrillator Kit',   total: 7,  inUse: 7  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Operational KPI cards for the Overview tab (mock)
// ─────────────────────────────────────────────────────────────────────────────
const OPS_KPIS = [
  { label: 'Pending BOM Pick',      value: 7, sub: 'Awaiting EQC action',   accent: 'border-amber-400',   numColor: 'text-amber-600'   },
  { label: 'Ready for Dispatch',    value: 4, sub: 'PDF not yet generated', accent: 'border-blue-400',    numColor: 'text-blue-600'    },
  { label: 'Returns Due Today',     value: 3, sub: 'Inspection pending',    accent: 'border-emerald-400', numColor: 'text-emerald-600' },
  { label: 'Missing Signed Copies', value: 2, sub: '>3 days unsigned',      accent: 'border-red-400',     numColor: 'text-red-600'     },
];

// ─────────────────────────────────────────────────────────────────────────────
// Kanban workflow columns (mock)
// ─────────────────────────────────────────────────────────────────────────────
const KANBAN_COLS = [
  {
    key: 'new', title: 'New Request', count: 5,
    headerCls: 'bg-blue-50 text-blue-700', cardBorder: 'border-l-blue-500',
    cards: [
      { dr: 'DR-2603-107350', hospital: 'Khon Kaen Hospital', model: 'BF-1T150 · QARA'   },
      { dr: 'DR-2603-107100', hospital: 'Saraburi Hospital',  model: 'GIF-H290 · Demo'    },
      { dr: 'DR-2603-107420', hospital: 'Siriraj Hospital',   model: 'CF-Q165L · Repair'  },
    ],
  },
  {
    key: 'pick', title: 'BOM Picking', count: 7,
    headerCls: 'bg-amber-50 text-amber-700', cardBorder: 'border-l-amber-500',
    cards: [
      { dr: 'DR-2603-107210', hospital: 'Chiang Mai Ram',  model: 'GIF-XQ290 · Repair' },
      { dr: 'DR-2602-106050', hospital: 'Siriraj Hospital', model: 'CF-Q165L · Q3S'    },
      { dr: 'DR-2603-107180', hospital: 'Ramathibodi',     model: 'GIF-Q158 · Repair'  },
    ],
  },
  {
    key: 'ready', title: 'BOM Done', count: 4,
    headerCls: 'bg-emerald-50 text-emerald-700', cardBorder: 'border-l-emerald-500',
    cards: [
      { dr: 'DR-2603-107120', hospital: 'Bumrungrad', model: 'OTV-S200 · Demo' },
      { dr: 'DR-2603-107090', hospital: 'KCMH',       model: 'GIF-H190 · Demo' },
    ],
  },
  {
    key: 'disp', title: 'Dispatched', count: 12,
    headerCls: 'bg-violet-50 text-violet-700', cardBorder: 'border-l-violet-500',
    cards: [
      { dr: 'DR-2602-106900', hospital: 'Bangkok Udon',  model: 'CLV-180 · Repair'    },
      { dr: 'DR-2602-107000', hospital: 'Mahidol Univ.', model: 'TJF-Q180V · GI3'     },
      { dr: 'DR-2603-107001', hospital: 'Chularat 3',    model: 'GIF-V2 · Repair'     },
    ],
  },
  {
    key: 'ret', title: 'Return/Inspect', count: 3,
    headerCls: 'bg-sky-50 text-sky-700', cardBorder: 'border-l-sky-500',
    cards: [
      { dr: 'DR-2511-092500', hospital: 'Ramathibodi', model: 'GIF-Q158 · Return' },
      { dr: 'DR-2509-088601', hospital: 'Bumrungrad',  model: 'HYF-XP · Return'   },
    ],
  },
  {
    key: 'done', title: 'Complete', count: 31,
    headerCls: 'bg-gray-100 text-gray-600', cardBorder: 'border-l-gray-400',
    cards: [
      { dr: 'DR-2602-106504', hospital: 'Buddachinarai', model: 'CH-S700 · Complete' },
      { dr: 'DR-2602-106300', hospital: 'Thammasat',     model: 'OEV-191H · Done'   },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Returns & Inspection queue (mock)
// ─────────────────────────────────────────────────────────────────────────────
const RETURNS_QUEUE = [
  { dr: 'DR-2511-092500', asset: 'GIF-Q158',  hospital: 'Ramathibodi Hospital', expectedReturn: '2025-12-05', daysOD: 149, type: 'Normal Repair Loaner', status: 'Overdue'       },
  { dr: 'DR-2509-088601', asset: 'HYF-XP',    hospital: 'Bumrungrad',            expectedReturn: '2025-10-10', daysOD: 205, type: 'VPP/CPP/Rental',       status: 'Overdue'       },
  { dr: 'DR-2603-107000', asset: 'TJF-Q180V', hospital: 'Mahidol University',    expectedReturn: '2026-05-05', daysOD: -2,  type: 'GI3 Loaner',           status: 'With Customer' },
  { dr: 'DR-2603-107100', asset: 'GIF-H290',  hospital: 'Saraburi Hospital',     expectedReturn: '2026-05-08', daysOD: -5,  type: 'Demo',                  status: 'Dispatched'    },
];

// ─────────────────────────────────────────────────────────────────────────────
// EQC Sub-tab definitions
// ─────────────────────────────────────────────────────────────────────────────
const EQC_TABS = ['Overview', 'Deployments', 'BOM & Packing', 'Dispatch', 'Inspections', 'Repair Cases'];

// ─────────────────────────────────────────────────────────────────────────────
// Shared EQC badge helper
// ─────────────────────────────────────────────────────────────────────────────
function EqcBadge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    green:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber:  'bg-amber-50 text-amber-700 border border-amber-200',
    blue:   'bg-blue-50 text-blue-700 border border-blue-200',
    violet: 'bg-violet-50 text-violet-700 border border-violet-200',
    red:    'bg-red-50 text-red-700 border border-red-200',
    slate:  'bg-slate-100 text-slate-600 border border-slate-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color] ?? map.slate}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Deployments — EQC Manager approval queue
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_PENDING_DEPLOYMENTS = [
  { id: 'dep-004', request_number: 'REQ-2026-011', asset: 'LMD-100-009', hospital: 'Eastbrook Clinic',  sales_rep: 'Alice Chen', start: '2026-05-19', end: '2026-05-26', status: 'Pending EQC Approval' },
  { id: 'dep-005', request_number: 'REQ-2026-012', asset: 'WA4-400-010', hospital: 'Valley Medical Group', sales_rep: 'Bob Martinez', start: '2026-05-20', end: '2026-05-27', status: 'Pending EQC Approval' },
  { id: 'dep-001', request_number: 'REQ-2026-002', asset: 'CV-1000-004', hospital: 'Northside Medical', sales_rep: 'Grace Park', start: '2026-05-18', end: '2026-05-25', status: 'In Preparation' },
  { id: 'dep-002', request_number: 'REQ-2026-007', asset: 'MAJ-971-007', hospital: 'Sunrise Health',    sales_rep: 'Frank Nguyen', start: '2026-05-17', end: '2026-05-24', status: 'Dispatched' },
  { id: 'dep-003', request_number: 'REQ-2026-008', asset: 'CLV-190-006', hospital: 'Pioneer General',   sales_rep: 'Carol Tanaka', start: '2026-05-10', end: '2026-05-17', status: 'Returned' },
];

function DeploymentTab({ userRole }: { userRole?: string }) {
  const [approved, setApproved]   = useState<string[]>([]);
  const [approving, setApproving] = useState<string | null>(null);

  const canApprove = userRole === 'EQC_Manager' || userRole === 'System_Admin';

  const handleApprove = async (id: string) => {
    setApproving(id);
    await new Promise(r => setTimeout(r, 900));
    setApproved(prev => [...prev, id]);
    setApproving(null);
  };

  const depStatusColor: Record<string, string> = {
    'Pending EQC Approval': 'amber',
    'In Preparation': 'blue',
    'Dispatched': 'violet',
    'Returned': 'slate',
    'In Inspection': 'orange',
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Deployments</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {canApprove ? 'Approve pending deployments and track all active device dispatches' : 'Track all active device deployment statuses'}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">Pending approval</p>
          <p className="text-2xl font-black text-amber-600">
            {MOCK_PENDING_DEPLOYMENTS.filter(d => d.status === 'Pending EQC Approval' && !approved.includes(d.id)).length}
          </p>
        </div>
      </div>

      {!canApprove && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <AlertTriangle size={16} />
          Approval actions require EQC Manager role.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Truck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">All Deployments</p>
            <p className="text-xs text-gray-400">{MOCK_PENDING_DEPLOYMENTS.length} total</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
                <th className="px-4 py-3.5 text-left font-semibold">Request #</th>
                <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
                <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
                <th className="px-4 py-3.5 text-left font-semibold">Sales Rep</th>
                <th className="px-4 py-3.5 text-left font-semibold">Start</th>
                <th className="px-4 py-3.5 text-left font-semibold">Return</th>
                <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                {canApprove && <th className="px-4 py-3.5 text-center font-semibold">Action</th>}
              </tr>
            </thead>
            <tbody>
              {MOCK_PENDING_DEPLOYMENTS.map((dep, idx) => {
                const wasApproved = approved.includes(dep.id);
                const effectiveStatus = wasApproved ? 'In Preparation' : dep.status;
                return (
                  <tr key={dep.id} className={`border-b border-gray-100 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{dep.request_number}</span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{dep.asset}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">{dep.hospital}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">{dep.sales_rep}</td>
                    <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{dep.start}</td>
                    <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{dep.end}</td>
                    <td className="px-4 py-4 text-center">
                      <EqcBadge label={effectiveStatus} color={depStatusColor[effectiveStatus] ?? 'slate'} />
                    </td>
                    {canApprove && (
                      <td className="px-4 py-4 text-center">
                        {dep.status === 'Pending EQC Approval' && !wasApproved ? (
                          <button
                            onClick={() => handleApprove(dep.id)}
                            disabled={approving === dep.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60"
                          >
                            {approving === dep.id ? <RefreshCw size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                            {approving === dep.id ? 'Approving…' : 'Approve'}
                          </button>
                        ) : wasApproved ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {MOCK_PENDING_DEPLOYMENTS.length} deployments</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: BOM & Packing
// ─────────────────────────────────────────────────────────────────────────────
const BOM_COMPONENTS = [
  { id: 'comp-001', name: 'Main Scope Unit',     type: 'REQUIRED',   qty: 1 },
  { id: 'comp-002', name: 'Light Source Cable',  type: 'REQUIRED',   qty: 1 },
  { id: 'comp-003', name: 'Cleaning Brush Kit',  type: 'REQUIRED',   qty: 1 },
  { id: 'comp-004', name: 'Carrying Case',       type: 'OPTIONAL',   qty: 1 },
  { id: 'comp-005', name: 'Biopsy Channel Caps', type: 'CONSUMABLE', qty: 5 },
  { id: 'comp-006', name: 'Water Bottle',        type: 'CONSUMABLE', qty: 1 },
];

function BomPackingTab() {
  const [selectedDep, setSelectedDep] = useState('dep-001');
  const [snapshotCreated, setSnapshotCreated] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [packed, setPacked] = useState<string[]>([]);
  const [validated, setValidated] = useState<{ isComplete: boolean; missingItems: typeof BOM_COMPONENTS } | null>(null);

  const deployments = [
    { id: 'dep-001', label: 'REQ-2026-002 — CV-1000-004 → Northside Medical' },
    { id: 'dep-004', label: 'REQ-2026-011 — LMD-100-009 → Eastbrook Clinic' },
    { id: 'dep-005', label: 'REQ-2026-012 — WA4-400-010 → Valley Medical Group' },
  ];

  const handleCreateSnapshot = async () => {
    setSnapshotLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSnapshotCreated(true);
    setSnapshotLoading(false);
    setPacked([]);
    setValidated(null);
  };

  const togglePacked = (id: string) => {
    setPacked(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    setValidated(null);
  };

  const handleValidate = () => {
    const required = BOM_COMPONENTS.filter(c => c.type === 'REQUIRED');
    const missing  = required.filter(c => !packed.includes(c.id));
    setValidated({ isComplete: missing.length === 0, missingItems: missing });
  };

  const typeColor: Record<string, string> = { REQUIRED: 'red', OPTIONAL: 'blue', CONSUMABLE: 'violet' };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
        <h2 className="text-lg font-bold text-gray-900">BOM & Packing</h2>
        <p className="text-sm text-gray-400 mt-0.5">Freeze a BOM snapshot for a deployment, then validate the packing checklist before dispatch</p>
      </div>

      {/* Step 1 — Select deployment & create snapshot */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black shadow-sm">1</div>
          <p className="text-sm font-bold text-gray-800">Select Deployment &amp; Freeze BOM Snapshot</p>
        </div>
        <div className="p-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deployment</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:border-blue-400"
              value={selectedDep}
              onChange={e => { setSelectedDep(e.target.value); setSnapshotCreated(false); setPacked([]); setValidated(null); }}
            >
              {deployments.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
          <button
            onClick={handleCreateSnapshot}
            disabled={snapshotLoading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-60"
          >
            {snapshotLoading ? <RefreshCw size={14} className="animate-spin" /> : <Package size={14} />}
            {snapshotLoading ? 'Freezing…' : snapshotCreated ? 'Re-freeze Snapshot' : 'Freeze BOM Snapshot'}
          </button>
          {snapshotCreated && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={14} /> Snapshot frozen
            </span>
          )}
        </div>
      </div>

      {/* Step 2 — Packing checklist */}
      {snapshotCreated && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black shadow-sm">2</div>
            <p className="text-sm font-bold text-gray-800">Packing Checklist</p>
            <span className="ml-auto text-xs text-gray-400">{packed.length}/{BOM_COMPONENTS.length} items checked</span>
          </div>
          <div className="p-6 space-y-3">
            {BOM_COMPONENTS.map(comp => (
              <label key={comp.id} className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${packed.includes(comp.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200'}`}>
                <input
                  type="checkbox"
                  checked={packed.includes(comp.id)}
                  onChange={() => togglePacked(comp.id)}
                  className="w-4 h-4 accent-blue-600"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-800">{comp.name}</span>
                  <span className="ml-2 text-xs text-gray-400">× {comp.qty}</span>
                </div>
                <EqcBadge label={comp.type} color={typeColor[comp.type] ?? 'slate'} />
                {packed.includes(comp.id) && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
              </label>
            ))}
          </div>
          <div className="px-6 pb-6 flex items-center gap-4">
            <button
              onClick={handleValidate}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            >
              <ShieldCheck size={14} /> Validate Packing
            </button>
            {validated && (
              <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${validated.isComplete ? 'text-emerald-600' : 'text-red-600'}`}>
                {validated.isComplete
                  ? <><CheckCircle2 size={16} /> All required items packed — ready for dispatch</>
                  : <><AlertTriangle size={16} /> {validated.missingItems.length} required item(s) missing</>
                }
              </span>
            )}
          </div>
          {validated && !validated.isComplete && (
            <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Missing Required Items</p>
              {validated.missingItems.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle size={12} /> {m.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Dispatch
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_DISPATCH_DOCS = [
  { id: 'doc-001', doc_number: 'DOC-2026-001', request: 'REQ-2026-002', asset: 'CV-1000-004', hospital: 'Northside Medical Centre', type: 'First Request',  status: 'Sent to Print', date: '2026-05-17' },
  { id: 'doc-002', doc_number: 'DOC-2026-002', request: 'REQ-2026-007', asset: 'MAJ-971-007', hospital: 'Sunrise Health Center',    type: 'First Request',  status: 'Signed',        date: '2026-05-16' },
  { id: 'doc-003', doc_number: 'DOC-2026-003', request: 'REQ-2026-005', asset: 'ME-411-003',  hospital: 'Westgate Medical',         type: 'Return Receipt', status: 'Archived',      date: '2026-05-14' },
];

function DispatchTab() {
  const [generating, setGenerating]   = useState(false);
  const [generated, setGenerated]     = useState<string | null>(null);
  const [blocked, setBlocked]         = useState<string[] | null>(null);
  const [selectedDep, setSelectedDep] = useState('dep-001');
  const [packAll, setPackAll]         = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerated(null);
    setBlocked(null);
    await new Promise(r => setTimeout(r, 1000));
    if (!packAll) {
      setBlocked(['Main Scope Unit', 'Light Source Cable']);
    } else {
      setGenerated(`DOC-${Date.now()}`);
    }
    setGenerating(false);
  };

  const dispatchStatusColor: Record<string, string> = {
    'Generated': 'blue', 'Sent to Print': 'amber', 'Signed': 'green', 'Archived': 'slate',
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
        <h2 className="text-lg font-bold text-gray-900">Dispatch</h2>
        <p className="text-sm text-gray-400 mt-0.5">Generate dispatch documents and track delivery status. Packing must be complete before dispatch.</p>
      </div>

      {/* Generate new document */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <FileText size={16} className="text-white" />
          </div>
          <p className="text-sm font-bold text-gray-800">Generate Dispatch Document</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deployment</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:border-blue-400"
                value={selectedDep}
                onChange={e => { setSelectedDep(e.target.value); setGenerated(null); setBlocked(null); }}
              >
                <option value="dep-001">REQ-2026-002 — CV-1000-004 → Northside Medical</option>
                <option value="dep-004">REQ-2026-011 — LMD-100-009 → Eastbrook Clinic</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={packAll} onChange={e => { setPackAll(e.target.checked); setGenerated(null); setBlocked(null); }} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm text-gray-700">Confirm all required BOM items are packed</span>
          </label>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-60"
          >
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
            {generating ? 'Generating…' : 'Generate Dispatch Document'}
          </button>

          {blocked && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-bold text-red-700 flex items-center gap-2 mb-2">
                <AlertTriangle size={14} /> DISPATCH BLOCKED — Required items not packed
              </p>
              {blocked.map(b => <p key={b} className="text-xs text-red-600 ml-5">• {b}</p>)}
            </div>
          )}
          {generated && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} /> Dispatch document generated
              </p>
              <p className="text-xs text-emerald-600 ml-5">Document ID: <span className="font-mono font-bold">{generated}</span></p>
              <p className="text-xs text-emerald-600 ml-5 mt-0.5">Deployment transitioned to In_Transit. Email queued for warehouse printer.</p>
            </div>
          )}
        </div>
      </div>

      {/* Document list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm"><FileText size={16} className="text-white" /></div>
            <div><p className="text-sm font-bold text-gray-800">Dispatch Documents</p><p className="text-xs text-gray-400">{MOCK_DISPATCH_DOCS.length} documents</p></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
                <th className="px-4 py-3.5 text-left font-semibold">Doc #</th>
                <th className="px-4 py-3.5 text-left font-semibold">Request #</th>
                <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
                <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
                <th className="px-4 py-3.5 text-left font-semibold">Type</th>
                <th className="px-4 py-3.5 text-left font-semibold">Generated</th>
                <th className="px-4 py-3.5 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DISPATCH_DOCS.map((doc, idx) => (
                <tr key={doc.id} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-4"><span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{doc.doc_number}</span></td>
                  <td className="px-4 py-4"><span className="font-mono text-xs text-gray-500">{doc.request}</span></td>
                  <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{doc.asset}</td>
                  <td className="px-4 py-4 text-xs text-gray-500">{doc.hospital}</td>
                  <td className="px-4 py-4 text-xs text-gray-600">{doc.type}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{doc.date}</td>
                  <td className="px-4 py-4 text-center"><EqcBadge label={doc.status} color={dispatchStatusColor[doc.status] ?? 'slate'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100"><p className="text-xs text-gray-400">Showing {MOCK_DISPATCH_DOCS.length} documents</p></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Inspections
// ─────────────────────────────────────────────────────────────────────────────
const INSPECTION_COMPONENTS = [
  { id: 'comp-001', name: 'Main Scope Unit',     type: 'REQUIRED' },
  { id: 'comp-002', name: 'Light Source Cable',  type: 'REQUIRED' },
  { id: 'comp-003', name: 'Cleaning Brush Kit',  type: 'REQUIRED' },
  { id: 'comp-004', name: 'Carrying Case',       type: 'OPTIONAL' },
  { id: 'comp-005', name: 'Biopsy Channel Caps', type: 'CONSUMABLE' },
];

function InspectionsTab() {
  const [activeInspection, setActiveInspection] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, 'Pass' | 'Fail' | 'Missing' | null>>({});
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted]   = useState(false);

  const MOCK_INSPECTIONS = [
    { id: 'insp-001', request: 'REQ-2026-003', asset: 'CLV-190-006', hospital: 'Pioneer General', status: 'Completed', condition: 'Good', date: '2026-05-12' },
    { id: 'insp-002', request: 'REQ-2026-004', asset: 'HX-1-012',    hospital: 'Eastbrook Clinic', status: 'In Progress', condition: null, date: '2026-05-14' },
    { id: 'insp-003', request: 'REQ-2026-008', asset: 'CLV-190-006', hospital: 'Northside Medical', status: 'Pending', condition: null, date: null },
  ];

  const inspStatusColor: Record<string, string> = { 'Completed': 'green', 'In Progress': 'blue', 'Pending': 'amber' };
  const resultColor: Record<string, string> = { 'Pass': 'green', 'Fail': 'red', 'Missing': 'orange' };

  const allAssessed = INSPECTION_COMPONENTS.every(c => results[c.id] != null);

  const handleComplete = async () => {
    setCompleting(true);
    await new Promise(r => setTimeout(r, 900));
    setCompleted(true);
    setCompleting(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
        <h2 className="text-lg font-bold text-gray-900">Inspections</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage return inspections for deployed assets. Record condition of each BOM component.</p>
      </div>

      {/* Inspection list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm"><ClipboardCheck size={16} className="text-white" /></div>
          <div><p className="text-sm font-bold text-gray-800">Inspection Records</p><p className="text-xs text-gray-400">{MOCK_INSPECTIONS.length} inspections</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
                <th className="px-4 py-3.5 text-left font-semibold">Inspection ID</th>
                <th className="px-4 py-3.5 text-left font-semibold">Request #</th>
                <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
                <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
                <th className="px-4 py-3.5 text-left font-semibold">Date</th>
                <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                <th className="px-4 py-3.5 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INSPECTIONS.map((insp, idx) => (
                <tr key={insp.id} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-4"><span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{insp.id}</span></td>
                  <td className="px-4 py-4"><span className="font-mono text-xs text-gray-500">{insp.request}</span></td>
                  <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{insp.asset}</td>
                  <td className="px-4 py-4 text-xs text-gray-500">{insp.hospital}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{insp.date ?? '—'}</td>
                  <td className="px-4 py-4 text-center"><EqcBadge label={insp.status} color={inspStatusColor[insp.status] ?? 'slate'} /></td>
                  <td className="px-4 py-4 text-center">
                    {insp.status !== 'Completed' && (
                      <button
                        onClick={() => { setActiveInspection(insp.id); setResults({}); setCompleted(false); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm transition-all"
                      >
                        <ClipboardCheck size={11} /> Inspect
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active inspection detail */}
      {activeInspection && !completed && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm"><CheckSquare size={16} className="text-white" /></div>
              <div>
                <p className="text-sm font-bold text-gray-800">Inspection Detail — <span className="font-mono text-blue-600">{activeInspection}</span></p>
                <p className="text-xs text-gray-400">Record result for each component</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {INSPECTION_COMPONENTS.map(comp => (
              <div key={comp.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-800">{comp.name}</span>
                  <EqcBadge label={comp.type} color={comp.type === 'REQUIRED' ? 'red' : comp.type === 'OPTIONAL' ? 'blue' : 'violet'} />
                </div>
                <div className="flex gap-2">
                  {(['Pass', 'Fail', 'Missing'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setResults(prev => ({ ...prev, [comp.id]: r }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                        results[comp.id] === r
                          ? r === 'Pass' ? 'bg-emerald-600 text-white border-emerald-600' : r === 'Fail' ? 'bg-red-600 text-white border-red-600' : 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {results[comp.id] && (
                  <EqcBadge label={results[comp.id]!} color={resultColor[results[comp.id]!] ?? 'slate'} />
                )}
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 flex items-center gap-4">
            <button
              onClick={handleComplete}
              disabled={!allAssessed || completing}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {completing ? 'Completing…' : 'Complete Inspection'}
            </button>
            {!allAssessed && <p className="text-xs text-gray-400">Assess all components to complete the inspection</p>}
          </div>
        </div>
      )}
      {completed && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={14} /> Inspection completed. Asset status updated to Available.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Repair Cases
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_REPAIR_CASES = [
  { id: 'RC-20260512-001', rs: 'RC-20260512-001', asset: 'CLV-190-006', hospital: 'Pioneer General Hospital',  type: 'Normal Repair',   status: 'Quoted',        area: 'Bangkok',   cost: '15,000', raised: '2026-05-12' },
  { id: 'RC-20260514-002', rs: 'RC-20260514-002', asset: 'HX-1-012',    hospital: 'Eastbrook Clinic',          type: 'Q3S Repair',      status: 'PO Received',   area: 'Chiang Mai',cost: '28,500', raised: '2026-05-14' },
  { id: 'RC-20260510-003', rs: 'RC-20260510-003', asset: 'OEV191-005',  hospital: 'City Health System',        type: 'GI Repair',       status: 'Completed',     area: 'Bangkok',   cost: '42,000', raised: '2026-05-10' },
  { id: 'RC-20260508-004', rs: 'RC-20260508-004', asset: 'MV1-AO-002',  hospital: 'Westgate Medical',          type: 'Normal Repair',   status: 'Parts Arranged',area: 'Phuket',   cost: '9,800',  raised: '2026-05-08' },
];

function RepairCasesTab() {
  const rcStatusColor: Record<string, string> = {
    'Quoted': 'amber', 'IQ Quoted': 'amber', 'PO Received': 'blue',
    'Parts Arranged': 'violet', 'Confirmed': 'blue', 'Completed': 'green',
  };
  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-900">Repair Cases</h2><p className="text-sm text-gray-400 mt-0.5">Repair cases raised from failed/missing component inspections</p></div>
        <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Open cases</p><p className="text-2xl font-black text-orange-600">{MOCK_REPAIR_CASES.filter(r => r.status !== 'Completed').length}</p></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open',         value: MOCK_REPAIR_CASES.filter(r => r.status !== 'Completed').length, accent: 'border-amber-400',   num: 'text-amber-600'   },
          { label: 'Completed',    value: MOCK_REPAIR_CASES.filter(r => r.status === 'Completed').length, accent: 'border-emerald-400', num: 'text-emerald-600' },
          { label: 'Bangkok',      value: MOCK_REPAIR_CASES.filter(r => r.area === 'Bangkok').length,     accent: 'border-blue-400',    num: 'text-blue-600'    },
          { label: 'Outstation',   value: MOCK_REPAIR_CASES.filter(r => r.area !== 'Bangkok').length,     accent: 'border-violet-400',  num: 'text-violet-600'  },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${c.accent} px-6 py-5 shadow-sm`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
            <p className={`mt-3 text-4xl font-black ${c.num}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm"><Wrench size={16} className="text-white" /></div>
          <div><p className="text-sm font-bold text-gray-800">Repair Cases</p><p className="text-xs text-gray-400">{MOCK_REPAIR_CASES.length} cases</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
                <th className="px-4 py-3.5 text-left font-semibold">Case ID</th>
                <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
                <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
                <th className="px-4 py-3.5 text-left font-semibold">Repair Type</th>
                <th className="px-4 py-3.5 text-left font-semibold">Area</th>
                <th className="px-4 py-3.5 text-right font-semibold">Cost (THB)</th>
                <th className="px-4 py-3.5 text-left font-semibold">Raised</th>
                <th className="px-4 py-3.5 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REPAIR_CASES.map((rc, idx) => (
                <tr key={rc.id} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-4"><span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">{rc.rs}</span></td>
                  <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{rc.asset}</td>
                  <td className="px-4 py-4 text-xs text-gray-500">{rc.hospital}</td>
                  <td className="px-4 py-4 text-xs text-gray-600">{rc.type}</td>
                  <td className="px-4 py-4 text-xs text-gray-500">{rc.area}</td>
                  <td className="px-4 py-4 text-xs text-gray-700 tabular-nums text-right font-semibold">฿ {rc.cost}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{rc.raised}</td>
                  <td className="px-4 py-4 text-center"><EqcBadge label={rc.status} color={rcStatusColor[rc.status] ?? 'slate'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100"><p className="text-xs text-gray-400">Showing {MOCK_REPAIR_CASES.length} repair cases</p></div>
      </div>
    </div>
  );
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.12em]">{children}</span>
      <div className="flex-1 h-px bg-slate-200 ml-1" />
    </div>
  );
}

export default function EQCDashboard() {
  const user = useCurrentUser();
  const [activeWarehouse, setActiveWarehouse] = useState('All Locations');
  const [activeEqcTab, setActiveEqcTab]       = useState(0);

  // Real data query — fetch requests in EQC-active statuses.
  // staleTime: 0  → always refetch on mount (don't rely on cross-dashboard cache invalidation)
  // refetchInterval → poll every 30 s so the EQC user sees Manager approvals without refreshing
  const { data: apiRequests = [], isLoading } = useQuery({
    queryKey:       ['salesRequests', 'eqc', EQC_ACTIVE_STATUSES],
    queryFn:        () => listSalesRequests({ statuses: EQC_ACTIVE_STATUSES }),
    enabled:        !USE_MOCK_DATA,
    staleTime:      0,
    refetchInterval: 30_000,
  });

  const forwardedRows: ForwardedRow[] = USE_MOCK_DATA
    ? MOCK_FORWARDED
    : apiRequests.map(detailToForwardedRow);

  // KPI stats remain mock-based (would require a dedicated inventory endpoint)
  const stats = WAREHOUSE_STATS[activeWarehouse];
  const total = stats.available + stats.inPreparation + stats.inTransit + stats.inRepair + stats.quarantine;

  const kpiCards = [
    { label: 'Available',      value: stats.available,     icon: <CheckCircle2 size={20} />, accent: 'border-emerald-400', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', numColor: 'text-emerald-600', barColor: 'bg-emerald-500' },
    { label: 'In Preparation', value: stats.inPreparation, icon: <Package size={20} />,      accent: 'border-blue-400',    iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',    numColor: 'text-blue-600',    barColor: 'bg-blue-500'    },
    { label: 'In Transit',     value: stats.inTransit,     icon: <Truck size={20} />,        accent: 'border-violet-400',  iconBg: 'bg-violet-100',  iconColor: 'text-violet-600',  numColor: 'text-violet-600',  barColor: 'bg-violet-500'  },
    { label: 'In Repair',      value: stats.inRepair,      icon: <Wrench size={20} />,       accent: 'border-orange-400',  iconBg: 'bg-orange-100',  iconColor: 'text-orange-600',  numColor: 'text-orange-600',  barColor: 'bg-orange-500'  },
    { label: 'Quarantine',     value: stats.quarantine,    icon: <AlertTriangle size={20} />,accent: 'border-red-400',     iconBg: 'bg-red-100',     iconColor: 'text-red-600',     numColor: 'text-red-600',     barColor: 'bg-red-500'     },
  ];

  return (
    <div className="space-y-0">

      {/* ── EQC Sub-tab Navigation ── */}
      <div className="bg-white border-b border-gray-200 px-6 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {EQC_TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveEqcTab(idx)}
              className={`px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeEqcTab === idx
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeEqcTab === 1 && <DeploymentTab userRole={user?.role} />}
      {activeEqcTab === 2 && <BomPackingTab />}
      {activeEqcTab === 3 && <DispatchTab />}
      {activeEqcTab === 4 && <InspectionsTab />}
      {activeEqcTab === 5 && <RepairCasesTab />}

      {activeEqcTab === 0 && (
      <div className="max-w-screen-xl mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">EQC Operations Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Welcome back, <span className="font-semibold text-gray-600">{user?.name ?? '—'}</span> — Device inventory &amp; operations view
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">Total inventory</p>
          <p className="text-2xl font-black text-gray-800">{total}</p>
        </div>
      </div>

      {/* ── Location Filter ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 shrink-0">
            <MapPin size={13} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          {WAREHOUSES.map(w => (
            <button
              key={w}
              onClick={() => setActiveWarehouse(w)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeWarehouse === w ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div>
        <SectionLabel icon={<BarChart2 size={13} />}>Inventory Overview — {activeWarehouse}</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpiCards.map(card => (
            <div key={card.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${card.accent} px-5 py-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-snug pr-1">{card.label}</p>
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor} flex-shrink-0`}>{card.icon}</div>
              </div>
              <p className={`text-5xl font-black ${card.numColor}`}>{card.value}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${card.barColor}`}
                  style={{ width: total > 0 ? `${Math.round((card.value / total) * 100)}%` : '0%' }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400 font-medium">
                {total > 0 ? Math.round((card.value / total) * 100) : 0}% of total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Approved / Forwarded Requests Table */}
        <div className="lg:col-span-2">
          <SectionLabel icon={<Boxes size={13} />}>Forwarded by Sales Manager</SectionLabel>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                  <Boxes size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Approved Requests</p>
                  <p className="text-xs text-gray-400">Awaiting EQC preparation &amp; dispatch</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {forwardedRows.length} active
              </span>
            </div>

            {isLoading && !USE_MOCK_DATA && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">Loading approved requests…</div>
            )}

            {(!isLoading || USE_MOCK_DATA) && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
                      <th className="px-4 py-3.5 text-left font-semibold">Request ID</th>
                      <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
                      <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
                      <th className="px-4 py-3.5 text-left font-semibold">Start Date</th>
                      <th className="px-4 py-3.5 text-left font-semibold">Return Date</th>
                      <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forwardedRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">No approved requests awaiting preparation.</td>
                      </tr>
                    )}
                    {forwardedRows.map((req, idx) => (
                      <tr key={req.id} className={`border-b border-gray-100 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{req.requestNumber}</span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{req.assetName}</td>
                        <td className="px-4 py-4 text-xs text-gray-500">{req.hospitalName}</td>
                        <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{req.startDate}</td>
                        <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{req.returnDate}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${PREP_STATUS_CONFIG[req.status].badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PREP_STATUS_CONFIG[req.status].dot}`} />
                            {PREP_STATUS_CONFIG[req.status].label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing {forwardedRows.length} active requests</p>
            </div>
          </div>
        </div>

        {/* Utilization Rate */}
        <div>
          <SectionLabel icon={<Activity size={13} />}>Utilization by Set Type</SectionLabel>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
              <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
                <Activity size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Set Utilization</p>
                <p className="text-xs text-gray-400">In use / Total available</p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              {UTILIZATION.map(row => {
                const pct       = Math.round((row.inUse / row.total) * 100);
                const barColor  = pct >= 90 ? 'bg-red-500'   : pct >= 70 ? 'bg-orange-400' : 'bg-blue-500';
                const textColor = pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-orange-500' : 'text-blue-600';
                const bgLight   = pct >= 90 ? 'bg-red-50'    : pct >= 70 ? 'bg-orange-50'  : 'bg-blue-50';
                return (
                  <div key={row.setType}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700 truncate pr-3">{row.setType}</span>
                      <span className={`text-xs font-black flex-shrink-0 px-2 py-0.5 rounded-lg ${bgLight} ${textColor}`}>{pct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums w-10 text-right">{row.inUse}/{row.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Operational KPIs ── */}
      <div>
        <SectionLabel icon={<Layers size={13} />}>Operational Queue — Today</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {OPS_KPIS.map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${kpi.accent} px-5 py-5 shadow-sm`}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
              <p className={`mt-3 text-4xl font-black ${kpi.numColor}`}>{kpi.value}</p>
              <p className="mt-1 text-xs text-gray-400">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kanban Workflow Queue ── */}
      <div>
        <SectionLabel icon={<Boxes size={13} />}>EQC Workflow Queue</SectionLabel>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {KANBAN_COLS.map(col => (
                <div key={col.key} className="bg-gray-50 rounded-xl p-3">
                  <div className={`text-xs font-bold px-2 py-1 rounded-lg mb-3 text-center ${col.headerCls}`}>
                    {col.title} ({col.count})
                  </div>
                  {col.cards.map(card => (
                    <div key={card.dr} className={`bg-white rounded-lg p-2.5 mb-2 border-l-2 ${col.cardBorder} shadow-sm`}>
                      <p className="text-xs font-bold text-blue-600">{card.dr}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{card.hospital}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{card.model}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Returns & Inspection Queue ── */}
      <div>
        <SectionLabel icon={<ChevronRight size={13} />}>Returns &amp; Inspection Queue — Due Today &amp; Next 7 Days</SectionLabel>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
                  <th className="px-4 py-3.5 text-left font-semibold">DR No.</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Asset / Model</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Expected Return</th>
                  <th className="px-4 py-3.5 text-center font-semibold">Days OD</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Deployment Type</th>
                  <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {RETURNS_QUEUE.map((row, idx) => (
                  <tr key={row.dr} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{row.dr}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 text-sm">{row.asset}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{row.hospital}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 tabular-nums">{row.expectedReturn}</td>
                    <td className="px-4 py-3.5 text-center">
                      {row.daysOD > 0
                        ? <strong className="text-red-600">{row.daysOD}</strong>
                        : <span className="text-emerald-600 text-xs font-semibold">{Math.abs(row.daysOD)} days</span>
                      }
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{row.type}</td>
                    <td className="px-4 py-3.5 text-center">
                      <EqcBadge
                        label={row.status}
                        color={row.status === 'Overdue' ? 'red' : row.status === 'With Customer' ? 'blue' : 'slate'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      </div>
      )}
    </div>
  );
}
