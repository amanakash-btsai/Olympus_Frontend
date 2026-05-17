import { useState, useEffect } from 'react';
import React from 'react';
import {
  BarChart2, Users, AlertTriangle, Wrench, PackageCheck,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import {
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart as RechartsLine, Line,
} from 'recharts';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import DonutChart from '@/components/charts/DonutChart';

/* ── Mock data ─────────────────────────────────────────────────────────────── */

const DEMO_PROVISION_DATA = [
  { month: "Apr'24", complete: 108, waiting: 18 }, { month: 'May', complete: 123, waiting: 15 },
  { month: 'Jun',    complete: 96,  waiting: 22  }, { month: 'Jul', complete: 115, waiting: 14 },
  { month: 'Aug',    complete: 110, waiting: 19  }, { month: 'Sep', complete: 127, waiting: 11 },
  { month: 'Oct',    complete: 108, waiting: 17  }, { month: 'Nov', complete: 87,  waiting: 24 },
  { month: 'Dec',    complete: 73,  waiting: 28  }, { month: "Jan'25", complete: 76, waiting: 22 },
  { month: 'Feb',    complete: 74,  waiting: 18  }, { month: 'Mar', complete: 75,  waiting: 16 },
  { month: 'Apr',    complete: 104, waiting: 21  }, { month: 'May', complete: 102, waiting: 19 },
  { month: 'Jun',    complete: 79,  waiting: 25  },
];

const LOANER_PROVISION_DATA = [
  { month: 'Jan', complete: 106, waiting: 12 }, { month: 'Feb', complete: 103, waiting: 9  },
  { month: 'Mar', complete: 85,  waiting: 18 }, { month: 'Apr', complete: 91,  waiting: 11 },
  { month: 'May', complete: 94,  waiting: 8  }, { month: 'Jun', complete: 111, waiting: 13 },
  { month: 'Jul', complete: 136, waiting: 17 }, { month: 'Aug', complete: 143, waiting: 14 },
  { month: 'Sep', complete: 88,  waiting: 19 }, { month: 'Oct', complete: 76,  waiting: 22 },
  { month: 'Nov', complete: 86,  waiting: 10 }, { month: 'Dec', complete: 88,  waiting: 11 },
];

const FSE_STATUS_DATA = [
  { name: 'Hathaikan A.', loaned: 12, extension: 3, overdue: 1 },
  { name: 'Thidakan L.',  loaned: 9,  extension: 2, overdue: 0 },
  { name: 'Preeyanan K.', loaned: 7,  extension: 4, overdue: 2 },
  { name: 'Ark Suranon',  loaned: 11, extension: 1, overdue: 0 },
  { name: 'Vit Thamrong', loaned: 6,  extension: 5, overdue: 3 },
  { name: 'Anti Kessle',  loaned: 14, extension: 2, overdue: 1 },
  { name: 'Ronton Josh',  loaned: 8,  extension: 3, overdue: 2 },
  { name: 'Porngak S.',   loaned: 10, extension: 4, overdue: 1 },
];

const AREA_UTILIZATION = [
  { label: 'Central', value: 52, color: '#0070d2' },
  { label: 'North',   value: 28, color: '#04844b' },
  { label: 'East',    value: 11, color: '#ffb75d' },
  { label: 'South',   value: 7,  color: '#c23934' },
  { label: 'Laos',    value: 2,  color: '#9b59b6' },
];

const PROVISION_RATIO = [
  { label: 'Request Complete (78.4%)',    value: 2316, color: '#0070d2' },
  { label: 'Waiting Reservation (21.6%)', value: 639,  color: '#dddbda' },
];

const TREND_DATA = [
  { month: "May'24", requests: 98  }, { month: 'Jun',    requests: 112 },
  { month: 'Jul',    requests: 108 }, { month: 'Aug',    requests: 127 },
  { month: 'Sep',    requests: 115 }, { month: 'Oct',    requests: 103 },
  { month: 'Nov',    requests: 88  }, { month: 'Dec',    requests: 72  },
  { month: "Jan'25", requests: 74  }, { month: 'Feb',    requests: 76  },
  { month: 'Mar',    requests: 91  }, { month: 'Apr',    requests: 108 },
  { month: 'May',    requests: 123 }, { month: 'Jun',    requests: 127 },
  { month: 'Jul',    requests: 135 }, { month: 'Aug',    requests: 143 },
  { month: 'Sep',    requests: 136 }, { month: 'Oct',    requests: 104 },
  { month: 'Nov',    requests: 79  }, { month: 'Dec',    requests: 57  },
  { month: "Jan'26", requests: 106 }, { month: 'Feb',    requests: 103 },
  { month: 'Mar',    requests: 85  }, { month: 'Apr',    requests: 91  },
];

const OVERDUE_CASES = [
  { dr: 'DR-2602-106504', asset: 'CH-S700-XZ-EA', hospital: 'Buddachinarai Hospital', expectedReturn: '2026-03-05', daysOd: 59,  fse: 'Porngak Suriya',  status: 'Overdue',        repairLink: 'RS-202602-099595' },
  { dr: 'DR-2602-106900', asset: 'CLV-180',        hospital: 'Bangkok Hospital Udon',  expectedReturn: '2026-03-20', daysOd: 44,  fse: 'Ronton Josh',     status: 'Overdue',        repairLink: 'RS-202602-099700' },
  { dr: 'DR-2510-090023', asset: 'TJF-Q180V',      hospital: 'King Chulalongkorn',     expectedReturn: '2025-10-15', daysOd: 200, fse: 'Vit Thamrong',    status: 'Extension Used', repairLink: '—'               },
  { dr: 'DR-2602-106202', asset: 'GIF-H290',       hospital: 'London Hospital',         expectedReturn: '2026-03-15', daysOd: 49,  fse: 'Jakkraphan W.',  status: 'Waiting',        repairLink: '—'               },
  { dr: 'DR-2511-092500', asset: 'GIF-Q158',       hospital: 'Ramathibodi Hospital',    expectedReturn: '2025-12-05', daysOd: 28,  fse: 'Ark Suranon',    status: 'In Repair',      repairLink: 'RS-202511-095300' },
];

const TEAMS_ALERTS = [
  { channel: '#loaner-overdue', text: 'GIF-Q158 (SN:2307145) — 8 days overdue, Manon Naval Hospital',                      severity: 'HIGH'     as const },
  { channel: '#asset-defects',  text: 'CF-Q165L moved to Under Repair — inspection fail on return',                          severity: 'CRITICAL' as const },
  { channel: '#demo-alerts',    text: 'TJF-Q180V extended 2nd time — total 91 days, manager review required',               severity: 'WARN'     as const },
  { channel: '#eqc-ops-alerts', text: '3 signed copies missing >3 days — receipt monitoring agent',                          severity: 'WARN'     as const },
];

const SEVERITY_CLS: Record<string, string> = {
  HIGH:     'bg-red-50 text-red-600 border border-red-200',
  CRITICAL: 'bg-red-600 text-white',
  WARN:     'bg-amber-50 text-amber-700 border border-amber-200',
};

const STATUS_CLS: Record<string, string> = {
  'Overdue':        'bg-red-50 text-red-600 border border-red-200',
  'Extension Used': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Waiting':        'bg-amber-50 text-amber-700 border border-amber-200',
  'In Repair':      'bg-blue-50 text-blue-700 border border-blue-200',
};

const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  fontSize: '12px',
};

/* ── Shared sub-components ──────────────────────────────────────────────────── */

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.12em]">{children}</span>
      <div className="flex-1 h-px bg-slate-200 ml-1" />
    </div>
  );
}

interface KPITileProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down';
  trendLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accent: string;
}

function KPITile({ label, value, sub, trend, trendLabel, icon, iconBg, iconColor, accent }: KPITileProps) {
  const trendColor = trend === 'up' ? 'text-emerald-600' : 'text-red-500';
  const TrendIcon  = trend === 'up' ? ChevronUp : ChevronDown;
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 border-t-4 ${accent} px-5 py-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-snug pr-1">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} flex-shrink-0`}>{icon}</div>
      </div>
      <p className="text-5xl font-black text-gray-900">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-gray-400">{sub}</p>}
      {trendLabel && trend && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon size={13} /><span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export default function ExecutiveDashboard() {
  const user = useCurrentUser();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div style={{ backgroundColor: '#1e3a5f' }} className="rounded-2xl shadow-md px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Executive Overview Dashboard</h1>
          <p className="text-sm text-blue-200 mt-0.5">
            Welcome back, <span className="font-semibold text-white">{user?.name ?? '—'}</span> — Fleet overview &amp; management intelligence
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-blue-300">{dateStr}</p>
          </div>
          <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* ── KPI Row (5 tiles) ── */}
      <div>
        <SectionLabel icon={<BarChart2 size={13} />}>Key Performance Indicators</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPITile label="Active Demo Devices" value={42} trend="up"   trendLabel="+6 vs last month"   icon={<PackageCheck size={18} />} iconBg="bg-emerald-100" iconColor="text-emerald-600" accent="border-emerald-500" />
          <KPITile label="Active Loaners"      value={97} trend="up"   trendLabel="+11 vs last month"  icon={<PackageCheck size={18} />} iconBg="bg-blue-100"    iconColor="text-blue-600"    accent="border-blue-500"    />
          <KPITile label="Overdue (any day)"   value={23} sub="8 critical (>30 days)"                  icon={<AlertTriangle size={18} />} iconBg="bg-red-100"    iconColor="text-red-600"     accent="border-red-500"     />
          <KPITile label="In Repair"           value={18} sub="Avg. repair age: 14d"                   icon={<Wrench size={18} />}        iconBg="bg-amber-100"  iconColor="text-amber-600"   accent="border-amber-500"   />
          <KPITile label="Available Fleet"     value={59} sub="of 239 total assets"                    icon={<PackageCheck size={18} />} iconBg="bg-slate-100"   iconColor="text-slate-600"   accent="border-slate-400"   />
        </div>
      </div>

      {/* ── Provision Ratio Charts (3 columns) ── */}
      <div>
        <SectionLabel icon={<BarChart2 size={13} />}>Provision Ratios — This FY</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Overall donut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Demo/Loaner Provision Ratio</p>
              <p className="text-xs text-gray-400 mt-0.5">2,955 total requests this FY</p>
            </div>
            <div className="px-2 py-2">
              <DonutChart data={PROVISION_RATIO} />
            </div>
          </div>

          {/* Demo provision stacked bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Demo Provision % by Use Date</p>
              <div className="flex gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#0070d2' }} />Complete
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#b0cce8' }} />Waiting
                </span>
              </div>
            </div>
            <div className="px-3 pt-3 pb-2" style={{ minHeight: 220 }}>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBar data={DEMO_PROVISION_DATA} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="complete" name="Complete" stackId="s" fill="#0070d2" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="waiting"  name="Waiting"  stackId="s" fill="#b0cce8" radius={[4, 4, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loaner provision grouped bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Loaner Provision % by Submit Date</p>
              <div className="flex gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#04844b' }} />Complete
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#b8ddd0' }} />Waiting
                </span>
              </div>
            </div>
            <div className="px-3 pt-3 pb-2" style={{ minHeight: 220 }}>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBar data={LOANER_PROVISION_DATA} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="complete" name="Complete" fill="#04844b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="waiting"  name="Waiting"  fill="#b8ddd0" radius={[2, 2, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── FSE Horizontal Bar + Area Donut (2-1) ── */}
      <div>
        <SectionLabel icon={<Users size={13} />}>Loan Status by FSE &amp; Utilization by Area</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Horizontal stacked bar — FSE PIC */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Loan Status by FSE PIC — Horizontal View</p>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#0070d2' }} />Active/Loaned</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#ffb75d' }} />Extension Used</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#c23934' }} />Overdue</span>
              </div>
            </div>
            <div className="px-3 pt-3 pb-2" style={{ minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={240}>
                <RechartsBar data={FSE_STATUS_DATA} layout="vertical" margin={{ top: 0, right: 16, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="loaned"    name="Loaned"    stackId="s" fill="#0070d2" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="extension" name="Extension" stackId="s" fill="#ffb75d" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="overdue"   name="Overdue"   stackId="s" fill="#c23934" radius={[4, 4, 4, 4]} />
                </RechartsBar>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area utilization donut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Utilization by Area</p>
              <p className="text-xs text-gray-400 mt-0.5">Equipment distribution across regions</p>
            </div>
            <div className="px-2 py-2">
              <DonutChart data={AREA_UTILIZATION} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 24-month Trend + Teams Alerts (2 columns) ── */}
      <div>
        <SectionLabel icon={<BarChart2 size={13} />}>Period Trend &amp; AI / Teams Alerts</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Line chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Period-over-Period Request Trend (24 months)</p>
            </div>
            <div className="px-3 pt-3 pb-2" style={{ minHeight: 200 }}>
              <ResponsiveContainer width="100%" height={180}>
                <RechartsLine data={TREND_DATA} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="requests" name="Requests" stroke="#0070d2" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </RechartsLine>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI/Teams Alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">AI / Teams Alerts — Last 24 Hours</p>
            </div>
            <div className="p-4 space-y-3">
              {TEAMS_ALERTS.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div
                    className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: '#5b5fc7' }}
                  >
                    T
                  </div>
                  <p className="flex-1 text-xs text-gray-700 min-w-0">
                    <strong>{alert.channel}:</strong> {alert.text}
                  </p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${SEVERITY_CLS[alert.severity] ?? ''}`}>
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Overdue Exception Table ── */}
      <div>
        <SectionLabel icon={<AlertTriangle size={13} />}>Open Overdue &amp; Exception Report — Top Cases</SectionLabel>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#1e3a5f' }} className="text-white text-xs">
                  <th className="px-4 py-3.5 text-left font-semibold">DR Number</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Asset</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Hospital</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Expected Return</th>
                  <th className="px-4 py-3.5 text-center font-semibold">Days OD</th>
                  <th className="px-4 py-3.5 text-left font-semibold">FSE PIC</th>
                  <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Repair Link</th>
                </tr>
              </thead>
              <tbody>
                {OVERDUE_CASES.map((row, idx) => (
                  <tr key={row.dr} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} hover:bg-blue-50/30`}>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{row.dr}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 text-sm">{row.asset}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{row.hospital}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 tabular-nums">{row.expectedReturn}</td>
                    <td className="px-4 py-3.5 text-center">
                      <strong className="text-red-600">{row.daysOd}</strong>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{row.fse}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLS[row.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{row.repairLink}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {OVERDUE_CASES.length} exception cases</p>
          </div>
        </div>
      </div>

    </div>
  );
}
