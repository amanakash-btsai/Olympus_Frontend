import { useState } from 'react';
import '../../styles/sales-field.css';

/* ── May 2026 calendar data ─────────────────────────────────────────────── */
// May 1, 2026 = Friday (day-of-week index 5)
const MAY_DAYS = Array.from({ length: 31 }, (_, i) => {
  const date = new Date(2026, 4, i + 1); // month 4 = May
  const dow = date.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return { col: i, day: i + 1, name: names[dow], isSat: dow === 6, isSun: dow === 0 };
});

const WEEKS = [
  { label: 'May 1 – 7',   start: 0,  end: 6  },
  { label: 'May 8 – 14',  start: 7,  end: 13 },
  { label: 'May 15 – 21', start: 14, end: 20 },
  { label: 'May 22 – 28', start: 21, end: 27 },
  { label: 'May 29 – 31', start: 28, end: 30 },
];

const MOCK_ASSETS = [
  { type: 'Loaner', model: 'MDF-140',  name: 'MDF-140-001',   sn: '12345670', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'MV1-AO',   name: 'MV1-AO-002',    sn: '23456781', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'ME-411',   name: 'ME-411-003',     sn: '34567892', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'CV-1000',  name: 'CV-1000-004',    sn: '45678903', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'OEV191',   name: 'OEV191-005',     sn: '56789014', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'CLV-190',  name: 'CLV-190-006',    sn: '67890125', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'MAJ-971',  name: 'MAJ-971-007',    sn: '78901236', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'MEF-200',  name: 'MEF-200-008',    sn: '89012347', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'LMD-100',  name: 'LMD-100-009',    sn: '90123458', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'WA4-400',  name: 'WA4-400-010',    sn: '01234569', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'CV-190',   name: 'CV-190-011',     sn: '13579241', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'HX-1',     name: 'HX-1-012',       sn: '24681352', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'CL-160',   name: 'CL-160-013',     sn: '36914703', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'OES-40',   name: 'OES-40-014',     sn: '48025814', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'UHI-10',   name: 'UHI-10-015',     sn: '59136925', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'BFI-301',  name: 'BFI-301-016',    sn: '60247036', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'OTV-10',   name: 'OTV-10-017',     sn: '71358147', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'CF-H200',  name: 'CF-H200-018',    sn: '82469258', location: '1.7.1 Old Base',       status: 'Available' },
  { type: 'Loaner', model: 'ITF-130',  name: 'ITF-130-019',    sn: '93570369', location: '27/10/05 Old Base',    status: 'Available' },
  { type: 'Loaner', model: 'EF-W3',    name: 'EF-W3-020',      sn: '04681470', location: '1.7.1 Old Base',       status: 'Available' },
];

const SUB_TABS = [
  'New Demo/Loaner Request',
  'Equipment Contracts',
  'Service Requests',
  'Quotations',
  'Sales Orders',
  'Deliveries',
  'Invoices',
  'Reports',
  'Admin',
];

const TODAY = '2026/05/12';

export default function SalesDashboard() {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [formOpen, setFormOpen] = useState(true);
  const [weekIdx, setWeekIdx] = useState(1); // default to current week (May 8-14)

  const week = WEEKS[weekIdx];
  const visibleDays = MAY_DAYS.filter((d) => d.col >= week.start && d.col <= week.end);

  return (
    <div className="sf-view">
      {/* ── SUB-TABS ── */}
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

      {/* ── CONTENT ── */}
      <div className="sf-content-area">

        {/* New Demo / Loaner Request card */}
        <div className="sf-section-card">
          <div className="sf-section-bar" onClick={() => setFormOpen((o) => !o)}>
            <span>{formOpen ? '▼' : '▶'}</span>
            <span>New Demo / Loaner Request</span>
          </div>

          {formOpen && (
            <div className="sf-section-body">
              <div className="sf-info-box">
                <span className="sf-info-icon">i</span>
                <span>Total Asset {MOCK_ASSETS.length + 39}</span>
              </div>

              {/* Row 1 */}
              <div className="sf-form-row">
                <div className="sf-form-cell">
                  <span className="sf-form-label">Hospital Name:</span>
                  &nbsp;
                  <span className="sf-req-bar" />
                  <input
                    type="text"
                    className="sf-input"
                    style={{ minWidth: '105px' }}
                    placeholder="Click lookup icon..."
                  />
                  <input
                    type="text"
                    className="sf-input"
                    style={{ minWidth: '105px' }}
                    placeholder="Click lookup icon..."
                  />
                  <button className="sf-lookup-btn" title="Lookup">
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '10px' }} />
                  </button>
                </div>
                <div className="sf-form-cell">
                  <span className="sf-form-label">Department Category:</span>
                  <input type="text" className="sf-input sf-input-wide" />
                  <button className="sf-lookup-btn" title="Lookup">
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '10px' }} />
                  </button>
                </div>
                <div className="sf-form-cell">
                  <span className="sf-form-label">Department Name:</span>
                  <input type="text" className="sf-input sf-input-wide" />
                  <button className="sf-lookup-btn" title="Lookup">
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '10px' }} />
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="sf-form-row">
                <div className="sf-form-cell">
                  <span className="sf-form-label">Sales Person in Charge:</span>
                  <input type="text" className="sf-input sf-input-wide" />
                  <button className="sf-lookup-btn" title="Lookup">
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '10px' }} />
                  </button>
                </div>
                <div className="sf-form-cell">
                  <span className="sf-form-label">Purpose1:</span>
                  <select className="sf-select">
                    <option>--None--</option>
                    <option>Demo</option>
                    <option>Loaner</option>
                    <option>Trial</option>
                    <option>Exhibition</option>
                  </select>
                </div>
                <div className="sf-form-cell">
                  <span className="sf-form-label">Purpose2:</span>
                  <select className="sf-select" style={{ minWidth: '110px' }}>
                    <option>--None--</option>
                    <option>Demo</option>
                    <option>Loaner</option>
                    <option>Trial</option>
                  </select>
                </div>
              </div>

              {/* Row 3 – Dates */}
              <div className="sf-form-row">
                <div className="sf-form-cell">
                  <span className="sf-form-label">Request to receive goods:</span>
                  <input type="text" className="sf-input" style={{ minWidth: '70px' }} />
                  <span className="sf-date-hint">[ {TODAY} ]</span>
                </div>
                <div className="sf-form-cell">
                  <span className="sf-form-label">Start to use Date (Request):</span>
                  <input type="text" className="sf-input" style={{ minWidth: '70px' }} />
                  <span className="sf-date-hint">[ {TODAY} ]</span>
                </div>
                <div className="sf-form-cell">
                  <span className="sf-form-label">Estimate Return Date (Request):</span>
                  <input type="text" className="sf-input" style={{ minWidth: '70px' }} />
                  <span className="sf-date-hint">[ {TODAY} ]</span>
                </div>
              </div>

              {/* Row 4 */}
              <div className="sf-form-row">
                <div className="sf-form-cell">
                  <span className="sf-form-label">Purpose(Text):</span>
                  <input type="text" className="sf-input" style={{ minWidth: '160px' }} />
                </div>
                <div className="sf-form-cell">
                  <span className="sf-form-label">Prospect Name:</span>
                  <input type="text" className="sf-input sf-input-wide" />
                  <button className="sf-lookup-btn" title="Lookup">
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '10px' }} />
                  </button>
                </div>
                <div className="sf-form-cell">
                  <span className="sf-form-label">Customer PIC:</span>
                  <input type="text" className="sf-input sf-input-wide" />
                  <button className="sf-lookup-btn" title="Lookup">
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '10px' }} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Search divider ── */}
        <div className="sf-search-divider" />

        {/* ── Search area ── */}
        <div className="sf-search-area">
          <div className="sf-search-row">
            <div className="sf-search-field">
              <span className="sf-form-label">Asset Name</span>
              <input type="text" className="sf-input" style={{ minWidth: '110px' }} />
            </div>
            <div className="sf-search-field">
              <span className="sf-form-label">Serial Number</span>
              <input type="text" className="sf-input" style={{ minWidth: '110px' }} />
            </div>
            <div className="sf-search-field">
              <span className="sf-form-label">Asset Status</span>
              <select className="sf-select">
                <option>Available</option>
                <option>Under Preparation for Delivery</option>
                <option>Under Repair</option>
                <option>Request Complete</option>
                <option>Extension Used</option>
              </select>
            </div>
            <div className="sf-search-field">
              <span className="sf-form-label">Demo / Loaner</span>
              <select className="sf-select">
                <option>Loaner Asset</option>
                <option>Demo Asset</option>
                <option>Both</option>
              </select>
            </div>
            <div className="sf-search-field">
              <span className="sf-form-label">Installation Location</span>
              <select className="sf-select">
                <option>Select One</option>
                <option>Head Office</option>
                <option>Branch A</option>
                <option>Branch B</option>
                <option>Warehouse</option>
              </select>
            </div>
            <div className="sf-search-field">
              <span className="sf-form-label">Asset No (SAP)</span>
              <input type="text" className="sf-input" style={{ minWidth: '100px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="sf-btn">search</button>
            <button className="sf-btn">searchKitSet</button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <button className="sf-btn sf-btn-save">saveRequest</button>
            </div>
          </div>
        </div>

        {/* ── Count bar ── */}
        <div className="sf-count-bar">
          <div>
            Showing <strong>1–20</strong> of <strong>{MOCK_ASSETS.length + 39}</strong> assets
            &nbsp;|&nbsp; May 2026
          </div>
          <div className="sf-count-bar-nav">
            <button className="sf-pg-btn">◀◀</button>
            <button className="sf-pg-btn">◀</button>
            <span className="sf-pg-current">1</span>
            <button className="sf-pg-btn">2</button>
            <button className="sf-pg-btn">3</button>
            <button className="sf-pg-btn">▶</button>
            <button className="sf-pg-btn">▶▶</button>
          </div>
        </div>

        {/* ── Color legend ── */}
        <div className="sf-legend-row" style={{ marginTop: '8px' }}>
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

        {/* ── Week navigation ── */}
        <div className="sf-week-nav">
          <button
            className="sf-week-nav-btn"
            disabled={weekIdx === 0}
            onClick={() => setWeekIdx((w) => w - 1)}
          >
            &#9664;
          </button>
          <span className="sf-week-label">{week.label}</span>
          <button
            className="sf-week-nav-btn"
            disabled={weekIdx === WEEKS.length - 1}
            onClick={() => setWeekIdx((w) => w + 1)}
          >
            &#9654;
          </button>
        </div>

        {/* ── Asset availability table ── */}
        <div className="sf-table-wrap">
          <table className="sf-asset-tbl">
            <thead>
              <tr>
                <th
                  colSpan={6}
                  style={{
                    background: '#f1f5f9',
                    textAlign: 'left',
                    padding: '3px 10px',
                    fontSize: '10px',
                    color: 'var(--c-text-2)',
                    fontWeight: 500,
                  }}
                />
                <th
                  colSpan={visibleDays.length}
                  style={{
                    background: '#d1fae5',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#065f46',
                  }}
                >
                  May
                </th>
              </tr>
              <tr>
                <th style={{ minWidth: '80px' }}>Demo/Loaner</th>
                <th style={{ minWidth: '80px' }}>Model Name</th>
                <th style={{ minWidth: '90px' }}>Asset Name</th>
                <th style={{ minWidth: '70px' }}>SN</th>
                <th style={{ minWidth: '120px' }}>Installation Location</th>
                <th style={{ minWidth: '65px' }}>Status</th>
                {visibleDays.map((d) => (
                  <th
                    key={d.col}
                    className={`th-date${d.isSat ? ' th-sat' : d.isSun ? ' th-sun' : ''}`}
                  >
                    {d.name}
                    <br />
                    {d.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ASSETS.map((asset, ri) => (
                <tr key={ri}>
                  <td>{asset.type}</td>
                  <td>{asset.model}</td>
                  <td>{asset.name}</td>
                  <td>{asset.sn}</td>
                  <td>{asset.location}</td>
                  <td>{asset.status}</td>
                  {visibleDays.map((d) => (
                    <td key={d.col} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
