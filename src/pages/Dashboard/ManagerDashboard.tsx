import { useState } from 'react';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, XCircle, PauseCircle,
  Eye, EyeOff, ClipboardList, TrendingUp, Clock,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { listSalesRequests, approveSalesRequest, rejectSalesRequest } from '@/api/salesRequests.api';
import type { SalesRequestDetail } from '@/types/salesRequest.types';

// ─────────────────────────────────────────────────────────────────────────────
// Toggle: set to true to fall back to all mock data (no API calls)
// ─────────────────────────────────────────────────────────────────────────────
const USE_MOCK_DATA = false;

type UIStatus = 'Pending' | 'Approved' | 'Rejected' | 'On Hold';
type ActionType = 'Approved' | 'Rejected' | 'On Hold';

interface SalesRequestRow {
  id: string;
  requestId: string;
  assetName: string;
  hospitalName: string;
  department: string;
  salesRep: string;
  purpose: string;
  purposeType: string;
  dateCreated: string;
  dateApproved: string | null;
  status: UIStatus;
  startDate: string;
  returnDate: string;
  serialNo: string;
  location: string;
  notes: string;
  customerPIC: string;
  prospectName: string;
}

/* ── Map DB status → UI status ───────────────────────────────────────────── */
function dbToUIStatus(dbStatus: string): UIStatus {
  switch (dbStatus) {
    case 'Waiting_Approval': return 'Pending';
    case 'Waiting_Reservation':
    case 'Preparing':
    case 'BOM_Confirmed':
    case 'Ready_for_Dispatch':
    case 'Dispatched':
    case 'With_Customer':
    case 'Return_Initiated':
    case 'Request_Complete': return 'Approved';
    case 'Cancelled':        return 'Rejected';
    default:                 return 'Pending';
  }
}

/* ── Map SalesRequestDetail → display row ─────────────────────────────────── */
function detailToRow(r: SalesRequestDetail): SalesRequestRow {
  const firstDeployment = r.deployments?.[0];
  const firstAsset      = firstDeployment?.asset;
  const purpose2Label: Record<string, string> = {
    Demonstration: 'Demo', Normal_Repair_Loaner: 'Loaner', Q3S_Loaner: 'Loaner',
    GI3_Loaner: 'Loaner', Service_Contract_Loaner: 'Loaner',
    VPP_CPP_Rental: 'Rental', Operating_Lease: 'Lease', Workshop: 'Workshop',
  };
  return {
    id:           r.request_id,
    requestId:    r.request_number,
    assetName:    firstAsset?.asset_name ?? '—',
    hospitalName: r.account?.account_name ?? '—',
    department:   r.department_name ?? r.department_category ?? '—',
    salesRep:     r.sales_person?.name ?? '—',
    purpose:      purpose2Label[r.purpose2] ?? r.purpose2,
    purposeType:  r.purpose2,
    dateCreated:  r.created_at.slice(0, 10),
    dateApproved: r.approved_at ? r.approved_at.slice(0, 10) : null,
    status:       dbToUIStatus(r.status),
    startDate:    r.start_use_date.slice(0, 10),
    returnDate:   r.estimate_return_date.slice(0, 10),
    serialNo:     firstAsset?.serial_number ?? '—',
    location:     firstAsset ? '—' : '—',
    notes:        r.rejection_reason ?? r.prospect_name ?? r.event_name ?? '',
    customerPIC:  '—',
    prospectName: r.prospect_name ?? '—',
  };
}

/* ── Mock data (used when USE_MOCK_DATA = true) ─────────────────────────────*/
const MOCK_REQUESTS: SalesRequestRow[] = [
  { id: 'm1', requestId: 'REQ-2026-001', assetName: 'MDF-140-001', hospitalName: 'St. Mary General Hospital', department: 'Cardiology', salesRep: 'Alice Chen', purpose: 'Demo', purposeType: 'Loaner', dateCreated: '2026-05-10', dateApproved: null, status: 'Pending', startDate: '2026-05-16', returnDate: '2026-05-23', serialNo: '12345670', location: '1.7.1 Old Base', notes: 'Urgent demo for department head meeting.', customerPIC: 'Dr. James Wong', prospectName: 'St. Mary Hospital' },
  { id: 'm2', requestId: 'REQ-2026-002', assetName: 'CV-1000-004', hospitalName: 'Northside Medical Centre', department: 'Radiology', salesRep: 'Bob Martinez', purpose: 'Trial', purposeType: 'Demo', dateCreated: '2026-05-11', dateApproved: '2026-05-12', status: 'Approved', startDate: '2026-05-18', returnDate: '2026-05-25', serialNo: '45678903', location: '27/10/05 Old Base', notes: 'Trial for new procurement cycle.', customerPIC: 'Dr. Susan Lee', prospectName: 'Northside MC' },
  { id: 'm3', requestId: 'REQ-2026-003', assetName: 'OEV191-005', hospitalName: 'City Health System', department: 'Surgery', salesRep: 'Carol Tanaka', purpose: 'Exhibition', purposeType: 'Demo', dateCreated: '2026-05-12', dateApproved: null, status: 'On Hold', startDate: '2026-05-20', returnDate: '2026-05-27', serialNo: '56789014', location: '1.7.1 Old Base', notes: 'Pending budget confirmation from client.', customerPIC: 'Dr. Raj Patel', prospectName: 'City Health System' },
  { id: 'm4', requestId: 'REQ-2026-004', assetName: 'HX-1-012', hospitalName: 'Eastbrook Clinic', department: 'Neurology', salesRep: 'David Kim', purpose: 'Demo', purposeType: 'Loaner', dateCreated: '2026-05-13', dateApproved: null, status: 'Pending', startDate: '2026-05-19', returnDate: '2026-05-26', serialNo: '24681352', location: '1.7.1 Old Base', notes: 'First contact demo for new prospect.', customerPIC: 'Dr. Emily Ross', prospectName: 'Eastbrook Clinic' },
  { id: 'm5', requestId: 'REQ-2026-005', assetName: 'ME-411-003', hospitalName: 'Westgate Medical', department: 'Oncology', salesRep: 'Alice Chen', purpose: 'Loaner', purposeType: 'Loaner', dateCreated: '2026-05-13', dateApproved: null, status: 'Rejected', startDate: '2026-05-17', returnDate: '2026-05-24', serialNo: '34567892', location: '27/10/05 Old Base', notes: 'Asset unavailable during requested period.', customerPIC: 'Dr. Oliver Black', prospectName: 'Westgate Medical' },
  { id: 'm6', requestId: 'REQ-2026-006', assetName: 'WA4-400-010', hospitalName: 'Riverside Hospital', department: 'Cardiology', salesRep: 'Frank Nguyen', purpose: 'Demo', purposeType: 'Demo', dateCreated: '2026-05-14', dateApproved: null, status: 'Pending', startDate: '2026-05-21', returnDate: '2026-05-28', serialNo: '01234569', location: '1.7.1 Old Base', notes: 'Follow-up from last quarter visit.', customerPIC: 'Dr. Maria Santos', prospectName: 'Riverside Hospital' },
  { id: 'm7', requestId: 'REQ-2026-007', assetName: 'MAJ-971-007', hospitalName: 'Sunrise Health Center', department: 'Gastroenterology', salesRep: 'Grace Park', purpose: 'Demo', purposeType: 'Demo', dateCreated: '2026-05-14', dateApproved: '2026-05-14', status: 'Approved', startDate: '2026-05-17', returnDate: '2026-05-24', serialNo: '78901236', location: '27/10/05 Old Base', notes: 'Key account — expedite preparation.', customerPIC: 'Dr. Helen Moore', prospectName: 'Sunrise Health Center' },
];

const STATUS_CONFIG: Record<UIStatus, { badge: string; dot: string }> = {
  'Pending':  { badge: 'bg-amber-50 text-amber-700 border border-amber-200',       dot: 'bg-amber-400'   },
  'Approved': { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  'Rejected': { badge: 'bg-red-50 text-red-700 border border-red-200',             dot: 'bg-red-500'     },
  'On Hold':  { badge: 'bg-slate-100 text-slate-600 border border-slate-200',      dot: 'bg-slate-400'   },
};

const ACTION_CONFIG: Record<ActionType, {
  shortLabel: string; fullLabel: string; icon: React.ReactNode; dialogIcon: React.ReactNode;
  btnClass: string; confirmClass: string; headerIcon: React.ReactNode; description: string;
}> = {
  'Approved': {
    shortLabel: 'Approve', fullLabel: 'Approve Request',
    icon: <CheckCircle size={13} />, dialogIcon: <CheckCircle size={28} className="text-emerald-500" />,
    btnClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    headerIcon: <CheckCircle size={18} className="text-emerald-600" />,
    description: 'This will approve the request and forward it to EQC Operations for preparation.',
  },
  'Rejected': {
    shortLabel: 'Reject', fullLabel: 'Reject Request',
    icon: <XCircle size={13} />, dialogIcon: <XCircle size={28} className="text-red-500" />,
    btnClass: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    headerIcon: <XCircle size={18} className="text-red-600" />,
    description: 'This will reject the request. The sales representative will be notified.',
  },
  'On Hold': {
    shortLabel: 'Hold', fullLabel: 'Put On Hold',
    icon: <PauseCircle size={13} />, dialogIcon: <PauseCircle size={28} className="text-slate-500" />,
    btnClass: 'bg-slate-500 hover:bg-slate-600 text-white shadow-sm',
    confirmClass: 'bg-slate-600 hover:bg-slate-700 text-white',
    headerIcon: <PauseCircle size={18} className="text-slate-600" />,
    description: 'This will put the request on hold pending further review or clarification.',
  },
};

const DETAIL_FIELDS: [keyof SalesRequestRow, string][] = [
  ['hospitalName', 'Hospital'], ['department', 'Department'], ['salesRep', 'Sales Representative'],
  ['customerPIC', 'Customer PIC'], ['prospectName', 'Prospect Name'], ['purpose', 'Purpose'],
  ['purposeType', 'Asset Type'], ['assetName', 'Asset Name'], ['serialNo', 'Serial Number'],
  ['location', 'Installation Location'], ['startDate', 'Start Date (Requested)'],
  ['returnDate', 'Return Date (Estimated)'],
];

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.12em]">{children}</span>
      <div className="flex-1 h-px bg-slate-200 ml-1" />
    </div>
  );
}

export default function ManagerDashboard() {
  const user        = useCurrentUser();
  const queryClient = useQueryClient();

  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: ActionType } | null>(null);
  const [rejectReason,  setRejectReason]  = useState('');
  // On Hold is local-only (no DB state) — map of request_id → true
  const [heldIds, setHeldIds] = useState<Set<string>>(new Set());

  // ── Real data query
  const { data: apiData = [], isLoading } = useQuery({
    queryKey: ['salesRequests', 'all'],
    queryFn:  () => listSalesRequests(),
    enabled:  !USE_MOCK_DATA,
  });

  // ── Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => approveSalesRequest(id),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['salesRequests'] }); setConfirmAction(null); },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectSalesRequest(id, reason),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['salesRequests'] }); setConfirmAction(null); setRejectReason(''); },
  });

  // ── Build row list
  const rows: SalesRequestRow[] = USE_MOCK_DATA
    ? MOCK_REQUESTS
    : apiData.map(detailToRow).map(r => ({
        ...r,
        // Overlay local On Hold status if manager marked it so
        status: heldIds.has(r.id) ? 'On Hold' : r.status,
      }));

  const counts = {
    pending:  rows.filter(r => r.status === 'Pending').length,
    approved: rows.filter(r => r.status === 'Approved').length,
    onHold:   rows.filter(r => r.status === 'On Hold').length,
    rejected: rows.filter(r => r.status === 'Rejected').length,
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { id, action } = confirmAction;

    if (USE_MOCK_DATA) {
      if (action === 'On Hold') {
        setHeldIds(prev => new Set([...prev, id]));
      }
      // In mock mode, just close dialog
      setConfirmAction(null);
      setRejectReason('');
      return;
    }

    if (action === 'Approved') {
      approveMutation.mutate(id);
    } else if (action === 'Rejected') {
      rejectMutation.mutate({ id, reason: rejectReason || 'No reason provided' });
    } else if (action === 'On Hold') {
      // Hold is local-only
      setHeldIds(prev => new Set([...prev, id]));
      setConfirmAction(null);
    }
  };

  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  const pendingReq = confirmAction ? rows.find(r => r.id === confirmAction.id) : null;
  const actionCfg  = confirmAction ? ACTION_CONFIG[confirmAction.action] : null;

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sales Manager Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Welcome back, <span className="font-semibold text-gray-600">{user?.name ?? '—'}</span> — Approval queue &amp; request management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Total requests</p>
            <p className="text-2xl font-black text-gray-800">{rows.length}</p>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div>
        <SectionLabel icon={<TrendingUp size={13} />}>Approval Summary</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pending Approval', value: counts.pending,  accent: 'border-amber-400',   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',   numColor: 'text-amber-600',   icon: <Clock size={20} />        },
            { label: 'Approved',         value: counts.approved, accent: 'border-emerald-400', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', numColor: 'text-emerald-600', icon: <CheckCircle size={20} /> },
            { label: 'On Hold',          value: counts.onHold,   accent: 'border-slate-400',   iconBg: 'bg-slate-100',   iconColor: 'text-slate-500',   numColor: 'text-slate-600',   icon: <PauseCircle size={20} /> },
            { label: 'Rejected',         value: counts.rejected, accent: 'border-red-400',     iconBg: 'bg-red-100',     iconColor: 'text-red-600',     numColor: 'text-red-600',     icon: <XCircle size={20} />     },
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
      </div>

      {/* ── Requests Table ── */}
      <div>
        <SectionLabel icon={<ClipboardList size={13} />}>Approval Queue</SectionLabel>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <ClipboardList size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Sales Requests</p>
                <p className="text-xs text-gray-400">{rows.length} total · {counts.pending} awaiting review</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full">
                <Clock size={11} />{counts.pending} Pending
              </span>
            </div>
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
                    <th className="px-4 py-3.5 text-left font-semibold">Sales Rep</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Date Created</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Date Approved</th>
                    <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                    <th className="px-4 py-3.5 text-center font-semibold">Actions</th>
                    <th className="px-4 py-3.5 text-center font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((req, idx) => {
                    const allDisabled = req.status === 'Approved' || req.status === 'Rejected';
                    const isExpanded  = expandedId === req.id;
                    return (
                      <React.Fragment key={req.id}>
                        <tr className={`border-b border-gray-100 transition-colors ${isExpanded ? 'bg-blue-50/50' : idx % 2 === 1 ? 'bg-slate-50/60 hover:bg-blue-50/30' : 'bg-white hover:bg-blue-50/30'}`}>
                          <td className="px-4 py-4 text-center text-xs font-medium text-gray-300">{idx + 1}</td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{req.requestId}</span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{req.assetName}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                                {req.salesRep.charAt(0)}
                              </div>
                              <span className="text-xs text-gray-600 font-medium">{req.salesRep}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500 tabular-nums">{req.dateCreated}</td>
                          <td className="px-4 py-4 text-xs tabular-nums">
                            {req.dateApproved
                              ? <span className="text-emerald-600 font-semibold">{req.dateApproved}</span>
                              : <span className="text-gray-300">—</span>
                            }
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[req.status].badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[req.status].dot}`} />
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {(['Approved', 'Rejected', 'On Hold'] as ActionType[]).map(action => {
                                const cfg        = ACTION_CONFIG[action];
                                const isDisabled = allDisabled || (action === 'On Hold' && req.status === 'On Hold') || isMutating;
                                return (
                                  <button
                                    key={action}
                                    onClick={() => { setRejectReason(''); setConfirmAction({ id: req.id, action }); }}
                                    disabled={isDisabled}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${cfg.btnClass} disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none`}
                                  >
                                    {cfg.icon}{cfg.shortLabel}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleExpand(req.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isExpanded
                                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
                              }`}
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
                                    <span className="font-mono text-xs text-blue-300">{req.requestId}</span>
                                    <div className="ml-auto">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CONFIG[req.status].badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[req.status].dot}`} />
                                        {req.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                                    {DETAIL_FIELDS.map(([key, label]) => (
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
            <p className="text-xs text-gray-400">Showing {rows.length} of {rows.length} requests</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />{counts.pending} Pending</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{counts.approved} Approved</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{counts.rejected} Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Dialog ── */}
      <Dialog open={!!confirmAction} onOpenChange={open => { if (!open) { setConfirmAction(null); setRejectReason(''); } }}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {actionCfg && pendingReq && (
            <>
              <div className="px-6 pt-6 pb-4">
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {actionCfg.dialogIcon}
                    </div>
                    <div>
                      <DialogTitle className="text-base font-bold text-gray-900">{actionCfg.fullLabel}</DialogTitle>
                      <DialogDescription className="text-xs text-gray-500 mt-1 leading-relaxed">{actionCfg.description}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                  {[
                    ['Request ID', <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded">{pendingReq.requestId}</span>],
                    ['Asset',      <span className="font-semibold text-gray-800 text-sm">{pendingReq.assetName}</span>],
                    ['Hospital',   <span className="text-gray-600 text-xs text-right ml-3">{pendingReq.hospitalName}</span>],
                    ['Sales Rep',  <span className="text-gray-600 text-xs">{pendingReq.salesRep}</span>],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs font-medium text-gray-400">{label}</span>
                      {val}
                    </div>
                  ))}
                </div>

                {/* Rejection reason input */}
                {confirmAction?.action === 'Rejected' && (
                  <div className="mt-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Rejection Reason</label>
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                      rows={2}
                      placeholder="Provide a reason for rejection…"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                  </div>
                )}

                {(approveMutation.isError || rejectMutation.isError) && (
                  <p className="mt-2 text-xs text-red-600">Action failed. Please try again.</p>
                )}
              </div>

              <div className="px-6 pb-6 flex gap-2 justify-end">
                <button
                  onClick={() => { setConfirmAction(null); setRejectReason(''); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={isMutating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isMutating}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${actionCfg.confirmClass} disabled:opacity-50`}
                >
                  {isMutating ? 'Processing…' : `Confirm ${actionCfg.shortLabel}`}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
