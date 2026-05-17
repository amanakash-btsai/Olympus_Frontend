import { useState, useCallback, useRef } from 'react';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Plus, Eye, EyeOff, ClipboardList, Clock, CheckCircle, Package, Stethoscope, Search,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { listAssetsWithDeployments } from '@/api/assets.api';
import { listSalesRequests, createSalesRequest } from '@/api/salesRequests.api';
import { listAccounts } from '@/api/accounts.api';
import type { AssetWithDeployments } from '@/types/asset.types';
import type { Account } from '@/types/account.types';
import type { SalesRequestDetail } from '@/types/salesRequest.types';
import '../../styles/sales-field.css';

// ─────────────────────────────────────────────────────────────────────────────
// Toggle: set to true to fall back to all mock data (no API calls)
// ─────────────────────────────────────────────────────────────────────────────
const USE_MOCK_DATA = false;

/* ── Calendar helpers ──────────────────────────────────────────────────────── */
const CALENDAR_YEAR  = 2026;
const CALENDAR_MONTH = 4; // May (0-indexed)
const MONTH_DAYS     = 31;

const ALL_DAYS = Array.from({ length: MONTH_DAYS }, (_, i) => {
  const date = new Date(CALENDAR_YEAR, CALENDAR_MONTH, i + 1);
  const dow  = date.getDay();
  return {
    col:   i,
    day:   i + 1,
    name:  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow],
    isSat: dow === 6,
    isSun: dow === 0,
  };
});

const WEEKS = [
  { label: 'May 1 – 7',   start: 0,  end: 6  },
  { label: 'May 8 – 14',  start: 7,  end: 13 },
  { label: 'May 15 – 21', start: 14, end: 20 },
  { label: 'May 22 – 28', start: 21, end: 27 },
  { label: 'May 29 – 31', start: 28, end: 30 },
];

/* ── Mock asset fleet (used when USE_MOCK_DATA = true) ─────────────────────── */
interface AssetRecord {
  type: string; model: string; name: string; sn: string;
  location: string; status: string; asset_id?: string;
}

const MOCK_ASSETS: AssetRecord[] = [
  { type: 'Loaner', model: 'MDF-140',  name: 'MDF-140-001',  sn: '12345670', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Loaner', model: 'MV1-AO',   name: 'MV1-AO-002',   sn: '23456781', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Loaner', model: 'ME-411',   name: 'ME-411-003',    sn: '34567892', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Loaner', model: 'CV-1000',  name: 'CV-1000-004',   sn: '45678903', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Loaner', model: 'OEV191',   name: 'OEV191-005',    sn: '56789014', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Loaner', model: 'CLV-190',  name: 'CLV-190-006',   sn: '67890125', location: '1.7.1 Old Base',    status: 'Under Repair'},
  { type: 'Loaner', model: 'MAJ-971',  name: 'MAJ-971-007',   sn: '78901236', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Loaner', model: 'MEF-200',  name: 'MEF-200-008',   sn: '89012347', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Loaner', model: 'LMD-100',  name: 'LMD-100-009',   sn: '90123458', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Loaner', model: 'WA4-400',  name: 'WA4-400-010',   sn: '01234569', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Demo',   model: 'CV-190',   name: 'CV-190-011',    sn: '13579241', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Demo',   model: 'HX-1',     name: 'HX-1-012',      sn: '24681352', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Demo',   model: 'CL-160',   name: 'CL-160-013',    sn: '36914703', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Demo',   model: 'OES-40',   name: 'OES-40-014',    sn: '48025814', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Demo',   model: 'UHI-10',   name: 'UHI-10-015',    sn: '59136925', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Demo',   model: 'BFI-301',  name: 'BFI-301-016',   sn: '60247036', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Demo',   model: 'OTV-10',   name: 'OTV-10-017',    sn: '71358147', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Demo',   model: 'CF-H200',  name: 'CF-H200-018',   sn: '82469258', location: '1.7.1 Old Base',    status: 'Available'   },
  { type: 'Demo',   model: 'ITF-130',  name: 'ITF-130-019',   sn: '93570369', location: '27/10/05 Old Base', status: 'Available'   },
  { type: 'Demo',   model: 'EF-W3',    name: 'EF-W3-020',     sn: '04681470', location: '1.7.1 Old Base',    status: 'Available'   },
];

// [assetIndex, startCol, endCol, type]
const MOCK_DEPLOYMENTS: [number, number, number, string][] = [
  [0,  7,  11, 'other'], [1,  8,  13, 'self'],  [2,  0,   6, 'prep'],
  [3,  14, 20, 'other'], [5,  9,  15, 'repair'], [6,  21, 27, 'ext'],
  [7,  7,  13, 'self'],  [9,  0,   4, 'other'],  [10, 14, 20, 'done'],
  [11, 17, 24, 'other'], [13, 11, 17, 'self'],   [14, 4,   9, 'prep'],
];

function getMockCellClass(assetIdx: number, col: number): string {
  for (const [ai, s, e, type] of MOCK_DEPLOYMENTS) {
    if (ai === assetIdx && col >= s && col <= e) return `cal-${type}`;
  }
  return 'cal-avail';
}

/* ── Real deployment calendar cell class ──────────────────────────────────── */
function getDeploymentCellClass(
  asset: AssetWithDeployments,
  col: number,
  currentUserId: string | undefined,
): string {
  const deployments = asset.deployments ?? [];
  const cellDate = new Date(CALENDAR_YEAR, CALENDAR_MONTH, col + 1);

  for (const dep of deployments) {
    const start = new Date(dep.start_date);
    const end   = new Date(dep.expected_return_date);
    if (cellDate < start || cellDate > end) continue;

    const reqStatus = dep.sales_request?.status ?? '';
    const depStatus = dep.status;

    if (depStatus === 'In_Repair') return 'cal-repair';
    if (reqStatus === 'Request_Complete') return 'cal-done';
    if (reqStatus === 'Extension_Used' || asset.status === 'Extension_Used') return 'cal-ext';
    if (depStatus === 'Preparing' || asset.status === 'Preparing') return 'cal-prep';
    if (dep.sales_request?.sales_person_id === currentUserId) return 'cal-self';
    return 'cal-other';
  }
  return 'cal-avail';
}

/* ── Map DB asset to display record ──────────────────────────────────────────*/
function assetToRecord(a: AssetWithDeployments): AssetRecord {
  const typeMap: Record<string, string> = {
    Demo_Asset: 'Demo', Loaner_Asset: 'Loaner', MBA_Asset: 'MBA',
    Rental: 'Rental', Operating_Lease: 'Lease', Workshop: 'Workshop',
    Service_Center: 'SC', MKTS: 'MKTS', Comprehensive_Contract: 'CC',
  };
  return {
    asset_id: a.asset_id,
    type:     typeMap[a.demo_loaner_type] ?? a.demo_loaner_type,
    model:    a.model_code,
    name:     a.asset_name,
    sn:       a.serial_number,
    location: a.installation_location ?? '—',
    status:   a.status,
  };
}

/* ── Mock Sales Orders (used when USE_MOCK_DATA = true) ────────────────────── */
interface SalesOrderRow {
  id: string; assetName: string; hospital: string; department: string;
  salesRep: string; purpose: string; startDate: string; returnDate: string;
  createdAt: string; status: string; serialNo: string; notes: string;
}

const MOCK_SALES_ORDERS: SalesOrderRow[] = [
  { id: 'REQ-2026-001', assetName: 'MDF-140-001', hospital: 'St. Mary General Hospital', department: 'Cardiology',
    salesRep: 'Alice Chen', purpose: 'Demo', startDate: '2026-05-16', returnDate: '2026-05-23',
    createdAt: '2026-05-10', status: 'Waiting Approval', serialNo: '12345670', notes: 'Urgent demo for department head meeting.' },
  { id: 'REQ-2026-002', assetName: 'CV-1000-004', hospital: 'Northside Medical Centre', department: 'Radiology',
    salesRep: 'Alice Chen', purpose: 'Loaner', startDate: '2026-05-18', returnDate: '2026-05-25',
    createdAt: '2026-05-11', status: 'Preparing', serialNo: '45678903', notes: 'Trial for new procurement cycle.' },
  { id: 'REQ-2026-003', assetName: 'OEV191-005', hospital: 'City Health System', department: 'Surgery',
    salesRep: 'Alice Chen', purpose: 'Demo', startDate: '2026-05-20', returnDate: '2026-05-27',
    createdAt: '2026-05-12', status: 'Draft', serialNo: '56789014', notes: 'Pending budget confirmation from client.' },
  { id: 'REQ-2026-004', assetName: 'HX-1-012', hospital: 'Eastbrook Clinic', department: 'Neurology',
    salesRep: 'Alice Chen', purpose: 'Demo', startDate: '2026-05-19', returnDate: '2026-05-26',
    createdAt: '2026-05-13', status: 'With Customer', serialNo: '24681352', notes: 'First contact demo for new prospect.' },
  { id: 'REQ-2026-005', assetName: 'ME-411-003', hospital: 'Westgate Medical', department: 'Oncology',
    salesRep: 'Alice Chen', purpose: 'Loaner', startDate: '2026-05-17', returnDate: '2026-05-24',
    createdAt: '2026-05-13', status: 'Request Complete', serialNo: '34567892', notes: 'Completed successfully.' },
];

/* ── Map DB SalesRequestDetail to SalesOrderRow ─────────────────────────────*/
function detailToOrderRow(r: SalesRequestDetail): SalesOrderRow {
  const purpose2Map: Record<string, string> = {
    Demonstration: 'Demo', Normal_Repair_Loaner: 'Loaner', Q3S_Loaner: 'Loaner',
    GI3_Loaner: 'Loaner', Service_Contract_Loaner: 'Loaner',
    VPP_CPP_Rental: 'Rental', Operating_Lease: 'Lease', Workshop: 'Workshop',
  };
  const statusDisplayMap: Record<string, string> = {
    Draft: 'Draft', Waiting_Approval: 'Waiting Approval', Waiting_Reservation: 'Approved',
    Preparing: 'Preparing', BOM_Confirmed: 'BOM Confirmed', Ready_for_Dispatch: 'Ready for Dispatch',
    Dispatched: 'Dispatched', With_Customer: 'With Customer', Return_Initiated: 'Return Initiated',
    Request_Complete: 'Request Complete', Cancelled: 'Cancelled',
  };
  const firstAsset = r.deployments?.[0]?.asset;
  return {
    id:         r.request_number,
    assetName:  firstAsset?.asset_name ?? '—',
    hospital:   r.account?.account_name ?? '—',
    department: r.department_name ?? r.department_category ?? '—',
    salesRep:   r.sales_person?.name ?? '—',
    purpose:    purpose2Map[r.purpose2] ?? r.purpose2,
    startDate:  r.start_use_date.slice(0, 10),
    returnDate: r.estimate_return_date.slice(0, 10),
    createdAt:  r.created_at.slice(0, 10),
    status:     statusDisplayMap[r.status] ?? r.status,
    serialNo:   firstAsset?.serial_number ?? '—',
    notes:      r.prospect_name ?? r.event_name ?? '',
  };
}

const SO_STATUS: Record<string, { badge: string; dot: string }> = {
  'Draft':               { badge: 'bg-slate-100 text-slate-600 border border-slate-200',      dot: 'bg-slate-400'   },
  'Waiting Approval':    { badge: 'bg-amber-50 text-amber-700 border border-amber-200',        dot: 'bg-amber-400'   },
  'Approved':            { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',  dot: 'bg-emerald-500' },
  'Preparing':           { badge: 'bg-blue-50 text-blue-700 border border-blue-200',           dot: 'bg-blue-500'    },
  'BOM Confirmed':       { badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',     dot: 'bg-indigo-500'  },
  'Ready for Dispatch':  { badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200',           dot: 'bg-cyan-500'    },
  'Dispatched':          { badge: 'bg-violet-50 text-violet-700 border border-violet-200',     dot: 'bg-violet-500'  },
  'With Customer':       { badge: 'bg-violet-50 text-violet-700 border border-violet-200',     dot: 'bg-violet-500'  },
  'Return Initiated':    { badge: 'bg-orange-50 text-orange-700 border border-orange-200',     dot: 'bg-orange-500'  },
  'Request Complete':    { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',  dot: 'bg-emerald-500' },
  'Cancelled':           { badge: 'bg-red-50 text-red-700 border border-red-200',              dot: 'bg-red-500'     },
};

const SO_DETAIL_FIELDS: [keyof SalesOrderRow, string][] = [
  ['assetName', 'Asset Name'], ['serialNo', 'Serial Number'], ['hospital', 'Hospital'],
  ['department', 'Department'], ['salesRep', 'Sales Representative'], ['purpose', 'Purpose'],
  ['startDate', 'Start Date'], ['returnDate', 'Return Date (Estimated)'], ['createdAt', 'Date Created'],
];

/* ── Sales Orders sub-view ─────────────────────────────────────────────────── */
function SalesOrdersView({ userId }: { userId?: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Real data query — filtered to the current user's requests
  const { data: apiOrders, isLoading } = useQuery({
    queryKey: ['salesRequests', 'mine', userId],
    queryFn:  () => listSalesRequests(userId ? { sales_person_id: userId } : {}),
    enabled:  !USE_MOCK_DATA,
  });

  const orders: SalesOrderRow[] = USE_MOCK_DATA
    ? MOCK_SALES_ORDERS
    : (apiOrders ?? []).map(detailToOrderRow);

  const counts = {
    demo:     orders.filter(r => r.purpose === 'Demo').length,
    loaner:   orders.filter(r => r.purpose === 'Loaner').length,
    pending:  orders.filter(r => ['Waiting Approval', 'Draft'].includes(r.status)).length,
    approved: orders.filter(r =>
      ['Approved', 'Preparing', 'BOM Confirmed', 'Ready for Dispatch', 'Dispatched', 'With Customer', 'Request Complete'].includes(r.status),
    ).length,
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Sales Orders</h2>
          <p className="text-sm text-gray-400 mt-0.5">Track and view your submitted demo / loaner requests</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">Total requests</p>
          <p className="text-2xl font-black text-gray-800">{orders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Demo Requests',     value: counts.demo,     accent: 'border-blue-400',    iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',    numColor: 'text-blue-700',    icon: <Stethoscope size={20} /> },
          { label: 'Loaner Requests',   value: counts.loaner,   accent: 'border-violet-400',  iconBg: 'bg-violet-100',  iconColor: 'text-violet-600',  numColor: 'text-violet-700',  icon: <Package size={20} />     },
          { label: 'Pending Approval',  value: counts.pending,  accent: 'border-amber-400',   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',   numColor: 'text-amber-600',   icon: <Clock size={20} />       },
          { label: 'Approved / Active', value: counts.approved, accent: 'border-emerald-400', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', numColor: 'text-emerald-600', icon: <CheckCircle size={20} /> },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${card.accent} px-6 py-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-snug">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>{card.icon}</div>
            </div>
            <p className={`mt-3 text-5xl font-black ${card.numColor}`}>{card.value}</p>
            <p className="mt-1.5 text-xs text-gray-400">{card.value === 1 ? '1 request' : `${card.value} requests`}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-slate-400"><ClipboardList size={13} /></span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.12em]">Request History</span>
          <div className="flex-1 h-px bg-slate-200 ml-1" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <ClipboardList size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Sales Requests</p>
                <p className="text-xs text-gray-400">{orders.length} total · {counts.pending} awaiting approval</p>
              </div>
            </div>
            {counts.pending > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full">
                <Clock size={11} />{counts.pending} Pending
              </span>
            )}
          </div>

          {isLoading && !USE_MOCK_DATA && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">Loading requests…</div>
          )}

          {(!isLoading || USE_MOCK_DATA) && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
                    <th className="px-4 py-3.5 text-center font-semibold w-10 opacity-70">#</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Request ID</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Asset Name</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Purpose</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Start Date</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Return Date</th>
                    <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                    <th className="px-4 py-3.5 text-center font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((req, idx) => {
                    const isExpanded = expandedId === req.id;
                    const statusCfg  = SO_STATUS[req.status] ?? SO_STATUS['Draft'];
                    return (
                      <React.Fragment key={req.id}>
                        <tr className={`border-b border-gray-100 transition-colors ${isExpanded ? 'bg-blue-50/50' : idx % 2 === 1 ? 'bg-slate-50/60 hover:bg-blue-50/30' : 'bg-white hover:bg-blue-50/30'}`}>
                          <td className="px-4 py-4 text-center text-xs font-medium text-gray-300">{idx + 1}</td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{req.id}</span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{req.assetName}</td>
                          <td className="px-4 py-4 text-xs text-gray-600">{req.hospital}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${req.purpose === 'Demo' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                              {req.purpose}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{req.startDate}</td>
                          <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{req.returnDate}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => setExpandedId(prev => prev === req.id ? null : req.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm'}`}
                            >
                              {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="p-0">
                              <div className="border-b border-blue-100 bg-gradient-to-b from-blue-50/60 to-slate-50/40 px-8 py-5">
                                <div className="rounded-xl border border-blue-100 bg-white shadow-md overflow-hidden">
                                  <div style={{ backgroundColor: '#1e3a5f' }} className="flex items-center gap-3 px-6 py-3.5">
                                    <Eye size={14} className="text-blue-300" />
                                    <span className="text-sm font-bold text-white">Request Details</span>
                                    <span className="text-blue-400 mx-1">·</span>
                                    <span className="font-mono text-xs text-blue-300">{req.id}</span>
                                    <div className="ml-auto">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                        {req.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                                    {SO_DETAIL_FIELDS.map(([key, label]) => (
                                      <div key={key}>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-gray-800">{String(req[key])}</p>
                                      </div>
                                    ))}
                                  </div>
                                  {req.notes && (
                                    <div className="mx-6 mb-6 flex gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                                      <div className="w-1 rounded-full bg-amber-400 flex-shrink-0" />
                                      <div>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.1em] mb-1">Notes</p>
                                        <p className="text-sm text-gray-700 leading-relaxed">{req.notes}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Showing {orders.length} of {orders.length} requests</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />{counts.demo} Demo</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" />{counts.loaner} Loaner</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />{counts.pending} Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Coming Soon placeholder ───────────────────────────────────────────────── */
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <ClipboardList size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-600">{label}</h3>
      <p className="text-sm text-slate-400 mt-1">This section is coming soon.</p>
    </div>
  );
}

/* ── Sub-tabs ──────────────────────────────────────────────────────────────── */
const SUB_TABS = [
  'New Demo/Loaner Request', 'Equipment Contracts', 'Service Requests',
  'Quotations', 'Sales Orders', 'Deliveries', 'Invoices',
];

/* ── Purpose mappings for DB enum values ─────────────────────────────────── */
const PURPOSE1_OPTIONS = [
  { label: '--None--', value: '' },
  { label: 'Sales',     value: 'Sales'     },
  { label: 'Repair',    value: 'Repair'    },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'QARA',      value: 'QARA'      },
  { label: 'Others',    value: 'Others'    },
];

const PURPOSE2_OPTIONS = [
  { label: '--None--',            value: '' },
  { label: 'Demo',                value: 'Demonstration'         },
  { label: 'Loaner',              value: 'Normal_Repair_Loaner'  },
  { label: 'Q3S Loaner',          value: 'Q3S_Loaner'            },
  { label: 'GI3 Loaner',          value: 'GI3_Loaner'            },
  { label: 'SC Loaner',           value: 'Service_Contract_Loaner'},
  { label: 'VPP/CPP Rental',      value: 'VPP_CPP_Rental'        },
  { label: 'Operating Lease',     value: 'Operating_Lease'       },
  { label: 'Workshop',            value: 'Workshop'              },
];

/* ── Shared badge helper ───────────────────────────────────────────────────── */
function StatusBadge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    green:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber:  'bg-amber-50 text-amber-700 border border-amber-200',
    red:    'bg-red-50 text-red-700 border border-red-200',
    blue:   'bg-blue-50 text-blue-700 border border-blue-200',
    violet: 'bg-violet-50 text-violet-700 border border-violet-200',
    slate:  'bg-slate-100 text-slate-600 border border-slate-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color] ?? map.slate}`}>
      {label}
    </span>
  );
}

/* ── Equipment Contracts view ──────────────────────────────────────────────── */
const MOCK_CONTRACTS = [
  { id: 'EC-2026-001', contract_number: 'EC-2026-001', asset: 'CV-1000-004', hospital: 'Northside Medical Centre', type: 'Comprehensive Contract', start: '2026-01-01', end: '2026-12-31', status: 'Active' },
  { id: 'EC-2026-002', contract_number: 'EC-2026-002', asset: 'MAJ-971-007', hospital: 'Sunrise Health Center',    type: 'Service Contract',        start: '2026-03-01', end: '2027-02-28', status: 'Active' },
  { id: 'EC-2025-003', contract_number: 'EC-2025-003', asset: 'CLV-190-006', hospital: 'Pioneer General Hospital', type: 'Operating Lease',          start: '2025-06-01', end: '2026-05-31', status: 'Expiring Soon' },
  { id: 'EC-2025-004', contract_number: 'EC-2025-004', asset: 'HX-1-012',    hospital: 'St. Mary General Hospital',type: 'Rental',                   start: '2025-01-01', end: '2025-12-31', status: 'Expired' },
  { id: 'EC-2026-005', contract_number: 'EC-2026-005', asset: 'OES-40-014',  hospital: 'Metro Specialist Centre',  type: 'Comprehensive Contract',   start: '2026-02-01', end: '2027-01-31', status: 'Active' },
];
function EquipmentContractsView() {
  const statusColor: Record<string, string> = { 'Active': 'green', 'Expiring Soon': 'amber', 'Expired': 'slate' };
  const counts = { active: MOCK_CONTRACTS.filter(c => c.status === 'Active').length, expiring: MOCK_CONTRACTS.filter(c => c.status === 'Expiring Soon').length, expired: MOCK_CONTRACTS.filter(c => c.status === 'Expired').length };
  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-900">Equipment Contracts</h2><p className="text-sm text-gray-400 mt-0.5">Service contracts, operating leases and rentals for your assets</p></div>
        <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Total contracts</p><p className="text-2xl font-black text-gray-800">{MOCK_CONTRACTS.length}</p></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Active', value: counts.active, accent: 'border-emerald-400', num: 'text-emerald-600' }, { label: 'Expiring Soon', value: counts.expiring, accent: 'border-amber-400', num: 'text-amber-600' }, { label: 'Expired', value: counts.expired, accent: 'border-slate-400', num: 'text-slate-500' }].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${c.accent} px-6 py-5 shadow-sm`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
            <p className={`mt-3 text-4xl font-black ${c.num}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <p className="text-sm font-bold text-gray-800">Contract List</p>
          <p className="text-xs text-gray-400">{MOCK_CONTRACTS.length} contracts · {counts.expiring} expiring within 30 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
              <th className="px-4 py-3.5 text-left font-semibold">Contract #</th>
              <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
              <th className="px-4 py-3.5 text-left font-semibold">Hospital / Customer</th>
              <th className="px-4 py-3.5 text-left font-semibold">Contract Type</th>
              <th className="px-4 py-3.5 text-left font-semibold">Start Date</th>
              <th className="px-4 py-3.5 text-left font-semibold">End Date</th>
              <th className="px-4 py-3.5 text-center font-semibold">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_CONTRACTS.map((c, i) => (
                <tr key={c.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{c.contract_number}</span></td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800 text-sm">{c.asset}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{c.hospital}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{c.type}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 tabular-nums">{c.start}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 tabular-nums">{c.end}</td>
                  <td className="px-4 py-3.5 text-center"><StatusBadge label={c.status} color={statusColor[c.status] ?? 'slate'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100"><p className="text-xs text-gray-400">Showing {MOCK_CONTRACTS.length} contracts</p></div>
      </div>
    </div>
  );
}

/* ── Service Requests — Repairs view ───────────────────────────────────────── */
const MOCK_REPAIRS = [
  { id: 'RS-2026-001', rs_number: 'RS-2026-001', asset: 'CLV-190-006', serial: '67890125', hospital: 'Sunrise Health Center',    type: 'Normal Repair',    status: 'Quoted',       area: 'Bangkok',   cost: '15,000' },
  { id: 'RS-2026-002', rs_number: 'RS-2026-002', asset: 'HX-1-012',    serial: '24681352', hospital: 'City Health System',       type: 'Q3S Repair',        status: 'PO Received',  area: 'Chiang Mai', cost: '28,500' },
  { id: 'RS-2026-003', rs_number: 'RS-2026-003', asset: 'OEV191-005',  serial: '56789014', hospital: 'Metro Specialist Centre',  type: 'GI Repair',         status: 'Completed',    area: 'Bangkok',   cost: '42,000' },
  { id: 'RS-2026-004', rs_number: 'RS-2026-004', asset: 'CV-190-011',  serial: '13579241', hospital: 'Pioneer General Hospital', type: 'Service Contract',  status: 'Confirmed',    area: 'Bangkok',   cost: '8,500'  },
  { id: 'RS-2026-005', rs_number: 'RS-2026-005', asset: 'MDF-140-001', serial: '12345670', hospital: 'St. Mary General Hospital',type: 'Normal Repair',    status: 'Parts Arranged',area: 'Phuket',   cost: '19,200' },
];
function ServiceRequestsRepairsView() {
  const repairStatusColor: Record<string, string> = { 'Quoted': 'amber', 'IQ Quoted': 'amber', 'PO Received': 'blue', 'Parts Arranged': 'violet', 'Confirmed': 'blue', 'Completed': 'green' };
  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-900">Service Requests — Repairs</h2><p className="text-sm text-gray-400 mt-0.5">Track repair cases submitted for your assets</p></div>
        <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Total repair cases</p><p className="text-2xl font-black text-gray-800">{MOCK_REPAIRS.length}</p></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open',      value: MOCK_REPAIRS.filter(r => !['Completed'].includes(r.status)).length,     accent: 'border-amber-400',   num: 'text-amber-600'   },
          { label: 'Completed', value: MOCK_REPAIRS.filter(r => r.status === 'Completed').length,               accent: 'border-emerald-400', num: 'text-emerald-600' },
          { label: 'Bangkok',   value: MOCK_REPAIRS.filter(r => r.area === 'Bangkok').length,                   accent: 'border-blue-400',    num: 'text-blue-600'    },
          { label: 'Outstation',value: MOCK_REPAIRS.filter(r => r.area !== 'Bangkok').length,                   accent: 'border-violet-400',  num: 'text-violet-600'  },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${c.accent} px-6 py-5 shadow-sm`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
            <p className={`mt-3 text-4xl font-black ${c.num}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <p className="text-sm font-bold text-gray-800">Repair Cases</p>
          <p className="text-xs text-gray-400">{MOCK_REPAIRS.length} cases</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
              <th className="px-4 py-3.5 text-left font-semibold">RS Number</th>
              <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
              <th className="px-4 py-3.5 text-left font-semibold">Serial #</th>
              <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
              <th className="px-4 py-3.5 text-left font-semibold">Repair Type</th>
              <th className="px-4 py-3.5 text-left font-semibold">Area</th>
              <th className="px-4 py-3.5 text-right font-semibold">Cost (THB)</th>
              <th className="px-4 py-3.5 text-center font-semibold">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_REPAIRS.map((r, i) => (
                <tr key={r.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{r.rs_number}</span></td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800 text-sm">{r.asset}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 tabular-nums">{r.serial}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{r.hospital}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{r.type}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{r.area}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-700 tabular-nums text-right font-semibold">฿ {r.cost}</td>
                  <td className="px-4 py-3.5 text-center"><StatusBadge label={r.status} color={repairStatusColor[r.status] ?? 'slate'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100"><p className="text-xs text-gray-400">Showing {MOCK_REPAIRS.length} repair cases</p></div>
      </div>
    </div>
  );
}

/* ── Quotations view ───────────────────────────────────────────────────────── */
const MOCK_QUOTATIONS = [
  { id: 'QT-2026-001', quote_number: 'QT-2026-001', hospital: 'St. Mary General Hospital', item: 'Endoscope System CV-1000', amount: '850,000', status: 'Pending Review',      date: '2026-05-10' },
  { id: 'QT-2026-002', quote_number: 'QT-2026-002', hospital: 'Northside Medical Centre',  item: 'Cardiac Monitor Set',      amount: '425,000', status: 'Sent to Customer',    date: '2026-05-08' },
  { id: 'QT-2026-003', quote_number: 'QT-2026-003', hospital: 'Pioneer General Hospital',  item: 'Ultrasound Unit HX-1',     amount: '1,200,000',status: 'Negotiating',         date: '2026-05-05' },
  { id: 'QT-2026-004', quote_number: 'QT-2026-004', hospital: 'Eastbrook Clinic',          item: 'BFI-301 Infusion Pump',    amount: '95,000',  status: 'Won',                  date: '2026-04-28' },
  { id: 'QT-2026-005', quote_number: 'QT-2026-005', hospital: 'Valley Medical Group',      item: 'LMD-100 Surgical Light',   amount: '380,000', status: 'Lost',                 date: '2026-04-20' },
];
function QuotationsView() {
  const qtStatusColor: Record<string, string> = { 'Pending Review': 'amber', 'Sent to Customer': 'blue', 'Negotiating': 'violet', 'Won': 'green', 'Lost': 'red' };
  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-900">Quotations</h2><p className="text-sm text-gray-400 mt-0.5">Sales quotations submitted to prospective customers</p></div>
        <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Total quotations</p><p className="text-2xl font-black text-gray-800">{MOCK_QUOTATIONS.length}</p></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open',      value: MOCK_QUOTATIONS.filter(q => ['Pending Review','Sent to Customer','Negotiating'].includes(q.status)).length, accent: 'border-blue-400',    num: 'text-blue-600'    },
          { label: 'Won',       value: MOCK_QUOTATIONS.filter(q => q.status === 'Won').length,    accent: 'border-emerald-400', num: 'text-emerald-600' },
          { label: 'Lost',      value: MOCK_QUOTATIONS.filter(q => q.status === 'Lost').length,   accent: 'border-red-400',     num: 'text-red-600'     },
          { label: 'Pending',   value: MOCK_QUOTATIONS.filter(q => q.status === 'Pending Review').length, accent: 'border-amber-400', num: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${c.accent} px-6 py-5 shadow-sm`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
            <p className={`mt-3 text-4xl font-black ${c.num}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <p className="text-sm font-bold text-gray-800">Quotation List</p>
          <p className="text-xs text-gray-400">{MOCK_QUOTATIONS.length} quotations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
              <th className="px-4 py-3.5 text-left font-semibold">Quote #</th>
              <th className="px-4 py-3.5 text-left font-semibold">Hospital / Customer</th>
              <th className="px-4 py-3.5 text-left font-semibold">Item / Description</th>
              <th className="px-4 py-3.5 text-right font-semibold">Amount (THB)</th>
              <th className="px-4 py-3.5 text-left font-semibold">Date</th>
              <th className="px-4 py-3.5 text-center font-semibold">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_QUOTATIONS.map((q, i) => (
                <tr key={q.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{q.quote_number}</span></td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{q.hospital}</td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800 text-sm">{q.item}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-700 tabular-nums text-right font-semibold">฿ {q.amount}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 tabular-nums">{q.date}</td>
                  <td className="px-4 py-3.5 text-center"><StatusBadge label={q.status} color={qtStatusColor[q.status] ?? 'slate'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100"><p className="text-xs text-gray-400">Showing {MOCK_QUOTATIONS.length} quotations</p></div>
      </div>
    </div>
  );
}

/* ── Deliveries view ───────────────────────────────────────────────────────── */
const MOCK_DELIVERIES = [
  { id: 'doc-001', doc_number: 'DOC-2026-001', request_number: 'REQ-2026-002', asset: 'CV-1000-004', hospital: 'Northside Medical Centre',  doc_type: 'First Request',  status: 'Sent to Print', generated: '2026-05-17' },
  { id: 'doc-002', doc_number: 'DOC-2026-002', request_number: 'REQ-2026-007', asset: 'MAJ-971-007', hospital: 'Sunrise Health Center',      doc_type: 'First Request',  status: 'Signed',        generated: '2026-05-16' },
  { id: 'doc-003', doc_number: 'DOC-2026-003', request_number: 'REQ-2026-005', asset: 'ME-411-003',  hospital: 'Westgate Medical',          doc_type: 'Return Receipt', status: 'Archived',      generated: '2026-05-14' },
  { id: 'doc-004', doc_number: 'DOC-2026-004', request_number: 'REQ-2026-009', asset: 'MEF-200-008', hospital: 'Valley Medical Group',       doc_type: 'Extension',      status: 'Generated',     generated: '2026-05-15' },
  { id: 'doc-005', doc_number: 'DOC-2026-005', request_number: 'REQ-2026-010', asset: 'LMD-100-009', hospital: 'Metro Specialist Centre',    doc_type: 'First Request',  status: 'Sent to Print', generated: '2026-05-13' },
];
function DeliveriesView() {
  const deliveryStatusColor: Record<string, string> = { 'Generated': 'blue', 'Sent to Print': 'amber', 'Signed': 'green', 'Uploaded': 'violet', 'Archived': 'slate' };
  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-900">Deliveries</h2><p className="text-sm text-gray-400 mt-0.5">Dispatch documents for your asset deliveries</p></div>
        <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Total documents</p><p className="text-2xl font-black text-gray-800">{MOCK_DELIVERIES.length}</p></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Generated',    value: MOCK_DELIVERIES.filter(d => d.status === 'Generated').length,     accent: 'border-blue-400',    num: 'text-blue-600'    },
          { label: 'Sent to Print',value: MOCK_DELIVERIES.filter(d => d.status === 'Sent to Print').length, accent: 'border-amber-400',   num: 'text-amber-600'   },
          { label: 'Signed',       value: MOCK_DELIVERIES.filter(d => d.status === 'Signed').length,        accent: 'border-emerald-400', num: 'text-emerald-600' },
          { label: 'Archived',     value: MOCK_DELIVERIES.filter(d => d.status === 'Archived').length,      accent: 'border-slate-400',   num: 'text-slate-500'   },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${c.accent} px-6 py-5 shadow-sm`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
            <p className={`mt-3 text-4xl font-black ${c.num}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <p className="text-sm font-bold text-gray-800">Delivery Documents</p>
          <p className="text-xs text-gray-400">{MOCK_DELIVERIES.length} documents</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
              <th className="px-4 py-3.5 text-left font-semibold">Doc #</th>
              <th className="px-4 py-3.5 text-left font-semibold">Request #</th>
              <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
              <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
              <th className="px-4 py-3.5 text-left font-semibold">Type</th>
              <th className="px-4 py-3.5 text-left font-semibold">Generated</th>
              <th className="px-4 py-3.5 text-center font-semibold">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_DELIVERIES.map((d, i) => (
                <tr key={d.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{d.doc_number}</span></td>
                  <td className="px-4 py-3.5"><span className="font-mono text-xs text-gray-500">{d.request_number}</span></td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800 text-sm">{d.asset}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{d.hospital}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{d.doc_type}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 tabular-nums">{d.generated}</td>
                  <td className="px-4 py-3.5 text-center"><StatusBadge label={d.status} color={deliveryStatusColor[d.status] ?? 'slate'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100"><p className="text-xs text-gray-400">Showing {MOCK_DELIVERIES.length} documents</p></div>
      </div>
    </div>
  );
}

/* ── Invoices view ─────────────────────────────────────────────────────────── */
const MOCK_INVOICES = [
  { id: 'INV-2026-001', invoice_number: 'INV-2026-001', hospital: 'Sunrise Health Center',     item: 'Q3S Repair — MAJ-971-007', amount: '28,500', due: '2026-06-01', status: 'Overdue'  },
  { id: 'INV-2026-002', invoice_number: 'INV-2026-002', hospital: 'Northside Medical Centre',  item: 'Demo Rental — CV-1000-004',amount: '12,000', due: '2026-06-15', status: 'Pending'  },
  { id: 'INV-2026-003', invoice_number: 'INV-2026-003', hospital: 'Pioneer General Hospital',  item: 'Normal Repair — CLV-190',   amount: '42,000', due: '2026-05-31', status: 'Paid'     },
  { id: 'INV-2026-004', invoice_number: 'INV-2026-004', hospital: 'St. Mary General Hospital', item: 'Operating Lease — HX-1-012',amount: '95,000', due: '2026-06-30', status: 'Pending'  },
  { id: 'INV-2026-005', invoice_number: 'INV-2026-005', hospital: 'Eastbrook Clinic',          item: 'Service Contract Q1 2026',  amount: '15,000', due: '2026-05-15', status: 'Paid'     },
];
function InvoicesView() {
  const invStatusColor: Record<string, string> = { 'Paid': 'green', 'Pending': 'amber', 'Overdue': 'red' };
  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-gray-900">Invoices</h2><p className="text-sm text-gray-400 mt-0.5">Invoices raised for repairs, rentals and service contracts</p></div>
        <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Total invoices</p><p className="text-2xl font-black text-gray-800">{MOCK_INVOICES.length}</p></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Paid',    value: MOCK_INVOICES.filter(i => i.status === 'Paid').length,    accent: 'border-emerald-400', num: 'text-emerald-600' },
          { label: 'Pending', value: MOCK_INVOICES.filter(i => i.status === 'Pending').length, accent: 'border-amber-400',   num: 'text-amber-600'   },
          { label: 'Overdue', value: MOCK_INVOICES.filter(i => i.status === 'Overdue').length, accent: 'border-red-400',     num: 'text-red-600'     },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${c.accent} px-6 py-5 shadow-sm`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
            <p className={`mt-3 text-4xl font-black ${c.num}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <p className="text-sm font-bold text-gray-800">Invoice List</p>
          <p className="text-xs text-gray-400">{MOCK_INVOICES.length} invoices · {MOCK_INVOICES.filter(i => i.status === 'Overdue').length} overdue</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
              <th className="px-4 py-3.5 text-left font-semibold">Invoice #</th>
              <th className="px-4 py-3.5 text-left font-semibold">Hospital / Customer</th>
              <th className="px-4 py-3.5 text-left font-semibold">Description</th>
              <th className="px-4 py-3.5 text-right font-semibold">Amount (THB)</th>
              <th className="px-4 py-3.5 text-left font-semibold">Due Date</th>
              <th className="px-4 py-3.5 text-center font-semibold">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_INVOICES.map((inv, i) => (
                <tr key={inv.id} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{inv.invoice_number}</span></td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{inv.hospital}</td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800 text-sm">{inv.item}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-700 tabular-nums text-right font-semibold">฿ {inv.amount}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 tabular-nums">{inv.due}</td>
                  <td className="px-4 py-3.5 text-center"><StatusBadge label={inv.status} color={invStatusColor[inv.status] ?? 'slate'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100"><p className="text-xs text-gray-400">Showing {MOCK_INVOICES.length} invoices</p></div>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function SalesDashboard() {
  const user        = useCurrentUser();
  const queryClient = useQueryClient();

  // ── Tab state
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [weekIdx, setWeekIdx]           = useState(1);
  const [formOpen, setFormOpen]         = useState(true);

  // ── Selected assets for new request
  const [selectedAssets, setSelectedAssets] = useState<AssetRecord[]>([]);

  // ── Search filter inputs (uncontrolled until Search is clicked)
  const searchAssetNameRef    = useRef<HTMLInputElement>(null);
  const searchSerialRef       = useRef<HTMLInputElement>(null);
  const searchStatusRef       = useRef<HTMLSelectElement>(null);
  const searchTypeRef         = useRef<HTMLSelectElement>(null);
  const searchLocationRef     = useRef<HTMLSelectElement>(null);
  const searchSapRef          = useRef<HTMLInputElement>(null);

  // ── Active search params — updated only when Search button is clicked
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});

  // ── New Request form state
  const [hospitalSearch, setHospitalSearch]       = useState('');
  const [selectedAccount, setSelectedAccount]     = useState<Account | null>(null);
  const [showAccountDrop, setShowAccountDrop]     = useState(false);
  const [purpose1, setPurpose1]                   = useState('');
  const [purpose2, setPurpose2]                   = useState('');
  const [receiveDate, setReceiveDate]             = useState('');
  const [startDate, setStartDate]                 = useState('');
  const [returnDate, setReturnDate]               = useState('');
  const [prospectName, setProspectName]           = useState('');
  const [deptCategory, setDeptCategory]           = useState('');
  const [deptName, setDeptName]                   = useState('');
  const [placeError, setPlaceError]               = useState<string | null>(null);
  const [placeSuccess, setPlaceSuccess]           = useState(false);

  const week        = WEEKS[weekIdx];
  const visibleDays = ALL_DAYS.filter(d => d.col >= week.start && d.col <= week.end);

  // ── Asset fleet query (real data)
  const { data: apiAssets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', 'fleet', searchParams],
    queryFn:  () => listAssetsWithDeployments({
      ...(searchParams.status        ? { status: searchParams.status as never }         : {}),
      ...(searchParams.asset_name    ? { asset_name: searchParams.asset_name }           : {}),
      ...(searchParams.serial_number ? { serial_number: searchParams.serial_number }     : {}),
      ...(searchParams.sap           ? { sap_asset_number: searchParams.sap }            : {}),
      ...(searchParams.location !== 'All Locations' && searchParams.location
        ? { installation_location: searchParams.location } : {}),
      ...(searchParams.type && searchParams.type !== 'Both'
        ? { demo_loaner_type: searchParams.type === 'Demo Asset' ? 'Demo_Asset' : 'Loaner_Asset' } : {}),
    }),
    enabled: !USE_MOCK_DATA,
  });

  // ── Account search dropdown query
  const { data: accountResults = [] } = useQuery({
    queryKey: ['accounts', 'search', hospitalSearch],
    queryFn:  () => listAccounts({ search: hospitalSearch }),
    enabled:  !USE_MOCK_DATA && hospitalSearch.trim().length >= 2,
    staleTime: 10_000,
  });

  // ── Create sales request mutation
  const createMutation = useMutation({
    mutationFn: createSalesRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesRequests'] });
      // Reset form
      setSelectedAssets([]);
      setSelectedAccount(null);
      setHospitalSearch('');
      setPurpose1('');
      setPurpose2('');
      setReceiveDate('');
      setStartDate('');
      setReturnDate('');
      setProspectName('');
      setDeptCategory('');
      setDeptName('');
      setPlaceError(null);
      setPlaceSuccess(true);
      setTimeout(() => setPlaceSuccess(false), 4000);
    },
    onError: (err: Error) => {
      setPlaceError(err.message ?? 'Failed to create request');
    },
  });

  // ── Display assets: mock or real
  const displayAssets: AssetRecord[] = USE_MOCK_DATA
    ? MOCK_ASSETS
    : apiAssets.map(assetToRecord);

  const addAsset    = (asset: AssetRecord) => {
    if (!selectedAssets.find(a => a.sn === asset.sn)) {
      setSelectedAssets(prev => [...prev, asset]);
    }
  };
  const removeAsset = (sn: string) => setSelectedAssets(prev => prev.filter(a => a.sn !== sn));
  const isAdded     = (sn: string) => selectedAssets.some(a => a.sn === sn);

  const handleSearch = useCallback(() => {
    setSearchParams({
      asset_name:    searchAssetNameRef.current?.value ?? '',
      serial_number: searchSerialRef.current?.value    ?? '',
      status:        searchStatusRef.current?.value    ?? '',
      type:          searchTypeRef.current?.value      ?? '',
      location:      searchLocationRef.current?.value  ?? '',
      sap:           searchSapRef.current?.value       ?? '',
    });
  }, []);

  const handlePlaceRequest = () => {
    setPlaceError(null);
    if (!selectedAccount && !USE_MOCK_DATA) { setPlaceError('Please select a hospital.'); return; }
    if (!purpose1 || !purpose2)              { setPlaceError('Please select Purpose 1 and Purpose 2.'); return; }
    if (!startDate || !returnDate)           { setPlaceError('Please fill in start and return dates.'); return; }
    if (selectedAssets.length === 0)         { setPlaceError('Please add at least one asset.'); return; }

    if (!USE_MOCK_DATA) {
      createMutation.mutate({
        record_type:          'First_Request',
        purpose1:             purpose1 as never,
        purpose2:             purpose2 as never,
        account_id:           selectedAccount!.account_id,
        sales_person_id:      user?.id ?? '',
        request_date:         receiveDate || startDate,
        start_use_date:       startDate,
        estimate_return_date: returnDate,
        department_category:  deptCategory,
        department_name:      deptName,
        prospect_name:        prospectName,
        asset_ids:            selectedAssets.map(a => a.asset_id).filter(Boolean) as string[],
      });
    } else {
      // Mock mode: just show success
      setSelectedAssets([]);
      setPlaceSuccess(true);
      setTimeout(() => setPlaceSuccess(false), 4000);
    }
  };

  return (
    <div className="sf-view">

      {/* ── Sub-tabs ── */}
      <div className="sf-sub-tabs">
        {SUB_TABS.map((label, idx) => (
          <span
            key={label}
            className={`sf-tab-item${activeSubTab === idx ? ' sf-tab-active' : ''}`}
            onClick={() => setActiveSubTab(idx)}
          >
            {label}
          </span>
        ))}
      </div>

      {/* ── New Demo/Loaner Request ── */}
      {activeSubTab === 0 && (
        <div className="sf-content-area">

          {/* Success banner */}
          {placeSuccess && (
            <div className="mb-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle size={16} /> Request submitted successfully!
            </div>
          )}
          {placeError && (
            <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {placeError}
            </div>
          )}

          {/* Form card */}
          <div className="sf-section-card">
            <div className="sf-section-bar" onClick={() => setFormOpen(o => !o)}>
              <span>{formOpen ? '▼' : '▶'}</span>
              <span>New Demo / Loaner Request</span>
            </div>

            {formOpen && (
              <div className="sf-section-body">
                <div className="sf-info-box">
                  <span className="sf-info-icon">i</span>
                  <span>Total Assets: {USE_MOCK_DATA ? MOCK_ASSETS.length + 39 : apiAssets.length}</span>
                </div>

                {/* Row 1 — Hospital, Department Category, Department Name */}
                <div className="sf-form-row">
                  <div className="sf-form-cell" style={{ position: 'relative' }}>
                    <span className="sf-form-label">Hospital Name:</span>
                    <span className="sf-req-bar" />
                    <input
                      type="text"
                      className="sf-input sf-input-wide"
                      placeholder="Type to search…"
                      value={hospitalSearch}
                      onChange={e => { setHospitalSearch(e.target.value); setShowAccountDrop(true); setSelectedAccount(null); }}
                      onFocus={() => setShowAccountDrop(true)}
                      onBlur={() => setTimeout(() => setShowAccountDrop(false), 200)}
                    />
                    {selectedAccount && (
                      <span className="ml-1 text-xs text-emerald-600 font-semibold truncate max-w-[120px]">{selectedAccount.account_name}</span>
                    )}
                    {showAccountDrop && accountResults.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 220, maxHeight: 180, overflowY: 'auto' }}>
                        {accountResults.map(acc => (
                          <div
                            key={acc.account_id}
                            style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12 }}
                            onMouseDown={() => { setSelectedAccount(acc); setHospitalSearch(acc.account_name); setShowAccountDrop(false); }}
                            className="hover:bg-blue-50"
                          >
                            <span className="font-semibold text-gray-800">{acc.account_name}</span>
                            {acc.area && <span className="ml-2 text-gray-400">{acc.area}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Department Category:</span>
                    <span className="sf-req-bar" />
                    <input type="text" className="sf-input sf-input-wide" value={deptCategory} onChange={e => setDeptCategory(e.target.value)} />
                  </div>
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Department Name:</span>
                    <span className="sf-req-bar" />
                    <input type="text" className="sf-input sf-input-wide" value={deptName} onChange={e => setDeptName(e.target.value)} />
                  </div>
                </div>

                {/* Row 2 — Sales Person (auto-filled), Purpose1, Purpose2 */}
                <div className="sf-form-row">
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Sales Person in Charge:</span>
                    <span className="sf-req-bar" />
                    <input
                      type="text"
                      className="sf-input sf-input-wide"
                      value={user?.name ?? ''}
                      readOnly
                      style={{ background: '#f8fafc', color: '#475569' }}
                    />
                  </div>
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Purpose1:</span>
                    <span className="sf-req-bar" />
                    <select className="sf-select" value={purpose1} onChange={e => setPurpose1(e.target.value)}>
                      {PURPOSE1_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Purpose2:</span>
                    <span className="sf-req-bar" />
                    <select className="sf-select" value={purpose2} onChange={e => setPurpose2(e.target.value)}>
                      {PURPOSE2_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 3 — Date pickers */}
                <div className="sf-form-row">
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Request to receive goods:</span>
                    <span className="sf-req-bar" />
                    <input type="date" className="sf-input sf-date-input" value={receiveDate} onChange={e => setReceiveDate(e.target.value)} />
                  </div>
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Start to use Date (Request):</span>
                    <span className="sf-req-bar" />
                    <input type="date" className="sf-input sf-date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Estimate Return Date (Request):</span>
                    <span className="sf-req-bar" />
                    <input type="date" className="sf-input sf-date-input" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                  </div>
                </div>

                {/* Row 4 — Prospect Name, Customer PIC */}
                <div className="sf-form-row">
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Prospect Name:</span>
                    <span className="sf-req-bar" />
                    <input type="text" className="sf-input sf-input-wide" value={prospectName} onChange={e => setProspectName(e.target.value)} />
                  </div>
                  <div className="sf-form-cell">
                    <span className="sf-form-label">Customer PIC:</span>
                    <span className="sf-req-bar" />
                    <input type="text" className="sf-input sf-input-wide" placeholder="Name of contact" />
                  </div>
                </div>

                {/* Selected assets */}
                {selectedAssets.length > 0 && (
                  <div className="sf-selected-section">
                    <div className="sf-selected-header">
                      <CheckCircle size={14} />
                      <span>Selected Assets ({selectedAssets.length})</span>
                    </div>
                    <div className="sf-selected-chips">
                      {selectedAssets.map(asset => (
                        <div key={asset.sn} className="sf-asset-chip">
                          <span className="sf-chip-name">{asset.name}</span>
                          <span className="sf-chip-sep">·</span>
                          <span className="sf-chip-sn">SN: {asset.sn}</span>
                          <button className="sf-chip-remove" onClick={() => removeAsset(asset.sn)} title={`Remove ${asset.name}`}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sf-search-divider" />

          {/* Search area */}
          <div className="sf-search-area">
            <div className="sf-search-row">
              <div className="sf-search-field">
                <span className="sf-form-label">Asset Name</span>
                <input ref={searchAssetNameRef} type="text" className="sf-input" style={{ minWidth: 110 }} />
              </div>
              <div className="sf-search-field">
                <span className="sf-form-label">Serial Number</span>
                <input ref={searchSerialRef} type="text" className="sf-input" style={{ minWidth: 110 }} />
              </div>
              <div className="sf-search-field">
                <span className="sf-form-label">Asset Status</span>
                <select ref={searchStatusRef} className="sf-select" defaultValue="">
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Preparing">Under Preparation for Delivery</option>
                  <option value="Under_Repair">Under Repair</option>
                  <option value="Request_Complete">Request Complete</option>
                  <option value="Extension_Used">Extension Used</option>
                </select>
              </div>
              <div className="sf-search-field">
                <span className="sf-form-label">Demo / Loaner</span>
                <select ref={searchTypeRef} className="sf-select" defaultValue="Both">
                  <option value="Both">Both</option>
                  <option value="Demo Asset">Demo Asset</option>
                  <option value="Loaner Asset">Loaner Asset</option>
                </select>
              </div>
              <div className="sf-search-field">
                <span className="sf-form-label">Installation Location</span>
                <select ref={searchLocationRef} className="sf-select" defaultValue="All Locations">
                  <option value="All Locations">All Locations</option>
                  <option value="1.7.1 Old Base">1.7.1 Old Base</option>
                  <option value="27/10/05 Old Base">27/10/05 Old Base</option>
                  <option value="Head Office">Head Office</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </div>
              <div className="sf-search-field">
                <span className="sf-form-label">Asset No (SAP)</span>
                <input ref={searchSapRef} type="text" className="sf-input" style={{ minWidth: 100 }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="sf-btn" onClick={handleSearch}>
                <Search size={12} style={{ display: 'inline', marginRight: 4 }} />
                Search
              </button>
              <button className="sf-btn" onClick={handleSearch}>Search Kit Set</button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <button
                  className="sf-btn sf-btn-place"
                  disabled={selectedAssets.length === 0 || createMutation.isPending}
                  onClick={handlePlaceRequest}
                  title={selectedAssets.length === 0 ? 'Select at least one asset from the table below' : ''}
                >
                  <Plus size={14} style={{ display: 'inline', marginRight: 6 }} />
                  {createMutation.isPending
                    ? 'Submitting…'
                    : <>Place Request{selectedAssets.length > 0 && ` (${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''})`}</>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Count bar */}
          <div className="sf-count-bar">
            <div>
              {assetsLoading && !USE_MOCK_DATA
                ? 'Loading assets…'
                : <>Showing <strong>1–{displayAssets.length}</strong> of <strong>{displayAssets.length}</strong> assets &nbsp;|&nbsp; May {CALENDAR_YEAR}</>
              }
            </div>
            <div className="sf-count-bar-nav">
              <button className="sf-pg-btn">◀◀</button>
              <button className="sf-pg-btn">◀</button>
              <span className="sf-pg-current">1</span>
              <button className="sf-pg-btn">▶</button>
              <button className="sf-pg-btn">▶▶</button>
            </div>
          </div>

          {/* Color legend */}
          <div className="sf-legend-row" style={{ marginTop: 8 }}>
            <span className="sf-legend-title">Color Explanation :</span>
            {[
              { bg: '#fef9c3', label: 'Available' },
              { bg: '#fde68a', label: 'Under Preparation for Delivery' },
              { bg: '#bbf7d0', label: 'Reserved myself' },
              { bg: '#e2e8f0', label: 'Under Repair' },
              { bg: '#475569', label: 'Request Complete' },
              { bg: '#fecaca', label: 'Extension Used' },
              { bg: '#bfdbfe', label: 'Reserved by Others' },
            ].map(({ bg, label }) => (
              <span key={label} className="sf-legend-swatch">
                <span className="sf-swatch" style={{ background: bg }} />
                {label}
              </span>
            ))}
          </div>

          {/* Week navigation */}
          <div className="sf-week-nav">
            <button className="sf-week-nav-btn" disabled={weekIdx === 0} onClick={() => setWeekIdx(w => w - 1)}>&#9664;</button>
            <span className="sf-week-label">{week.label}</span>
            <button className="sf-week-nav-btn" disabled={weekIdx === WEEKS.length - 1} onClick={() => setWeekIdx(w => w + 1)}>&#9654;</button>
          </div>

          {/* Asset availability table */}
          <div className="sf-table-wrap">
            <table className="sf-asset-tbl">
              <thead>
                <tr>
                  <th colSpan={7} style={{ background: '#f1f5f9', textAlign: 'left', padding: '3px 10px', fontSize: 10, color: 'var(--c-text-2)', fontWeight: 500 }} />
                  <th colSpan={visibleDays.length} style={{ background: '#d1fae5', textAlign: 'center', fontWeight: 700, color: '#065f46' }}>May</th>
                </tr>
                <tr>
                  <th style={{ minWidth: 60 }}>Add</th>
                  <th style={{ minWidth: 80 }}>Demo/Loaner</th>
                  <th style={{ minWidth: 80 }}>Model Name</th>
                  <th style={{ minWidth: 90 }}>Asset Name</th>
                  <th style={{ minWidth: 70 }}>SN</th>
                  <th style={{ minWidth: 120 }}>Installation Location</th>
                  <th style={{ minWidth: 65 }}>Status</th>
                  {visibleDays.map(d => (
                    <th key={d.col} className={`th-date${d.isSat ? ' th-sat' : d.isSun ? ' th-sun' : ''}`}>
                      {d.name}<br />{d.day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayAssets.map((asset, ri) => {
                  const added   = isAdded(asset.sn);
                  const rawAsset = USE_MOCK_DATA ? null : apiAssets[ri];
                  return (
                    <tr key={ri}>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`sf-add-btn${added ? ' sf-add-btn-added' : ''}`}
                          onClick={() => !added && addAsset(asset)}
                          disabled={added}
                          title={added ? 'Already added to request' : 'Add asset to request'}
                        >
                          {added ? '✓ Added' : <><Plus size={11} /> Add</>}
                        </button>
                      </td>
                      <td>{asset.type}</td>
                      <td>{asset.model}</td>
                      <td>{asset.name}</td>
                      <td>{asset.sn}</td>
                      <td>{asset.location}</td>
                      <td>{asset.status}</td>
                      {visibleDays.map(d => (
                        <td
                          key={d.col}
                          className={
                            USE_MOCK_DATA
                              ? getMockCellClass(ri, d.col)
                              : rawAsset
                                ? getDeploymentCellClass(rawAsset, d.col, user?.id)
                                : 'cal-avail'
                          }
                        />
                      ))}
                    </tr>
                  );
                })}
                {!USE_MOCK_DATA && assetsLoading && (
                  <tr><td colSpan={7 + visibleDays.length} className="text-center text-xs text-gray-400 py-6">Loading assets…</td></tr>
                )}
                {!USE_MOCK_DATA && !assetsLoading && displayAssets.length === 0 && (
                  <tr><td colSpan={7 + visibleDays.length} className="text-center text-xs text-gray-400 py-6">No assets found. Adjust search filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ── Equipment Contracts ── */}
      {activeSubTab === 1 && <EquipmentContractsView />}

      {/* ── Service Requests — Repairs ── */}
      {activeSubTab === 2 && <ServiceRequestsRepairsView />}

      {/* ── Quotations ── */}
      {activeSubTab === 3 && <QuotationsView />}

      {/* ── Sales Orders ── */}
      {activeSubTab === 4 && <SalesOrdersView userId={user?.id} />}

      {/* ── Deliveries ── */}
      {activeSubTab === 5 && <DeliveriesView />}

      {/* ── Invoices ── */}
      {activeSubTab === 6 && <InvoicesView />}

    </div>
  );
}
