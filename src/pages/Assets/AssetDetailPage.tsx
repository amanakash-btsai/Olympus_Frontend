import { useState } from 'react';
import '../../styles/asset-detail.css';

interface Asset {
  id: string;
  name: string;
  serial: string;
  hospital: string;
  status: string;
  statusColor: string;
  assetNo: string;
  installDate: string;
  type: string;
  product?: string;
  serialNo?: string;
  installFull?: string;
  contact?: string;
  qty?: string;
}

interface Props {
  asset?: Asset;
  mode?: 'view' | 'create';
}

const QUICK_LINKS = [
  { color: '#2e7d32', icon: 'fas fa-history',          label: 'Demo History',             count: '0' },
  { color: '#c0392b', icon: 'fas fa-tools',             label: 'Repair',                   count: '1' },
  { color: '#e67e22', icon: 'fas fa-procedures',        label: 'CIC',                      count: '0' },
  { color: '#27ae60', icon: 'fas fa-exclamation-circle',label: 'Product Problem',           count: '0' },
  { color: '#2980b9', icon: 'fas fa-certificate',       label: 'QIS',                      count: '0' },
  { color: '#8e44ad', icon: 'fas fa-clipboard-check',   label: 'PM Record',                count: '0' },
  { color: '#16a085', icon: 'fas fa-box',               label: 'PM Product (Asset_input)', count: ''  },
  { color: '#e67e22', icon: 'fas fa-calendar-check',    label: 'Annual Inspection',        count: '0' },
  { color: '#2e7d32', icon: 'fas fa-layer-group',       label: 'AssetHistory',             count: '2' },
  { color: '#27ae60', icon: 'fas fa-paperclip',         label: 'Notes & Attachments',      count: '0' },
  { color: '#2980b9', icon: 'fas fa-history',           label: 'Asset History',            count: ''  },
  { color: '#8e44ad', icon: 'fas fa-star',              label: 'QIS (Customer Asset)',     count: ''  },
];

type SectionKey = 'basic' | 'tjf' | 'product' | 'category' | 'commissioning';

function SectionBlock({
  title,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="section-hdr" onClick={onToggle}>
        <i className={`fas fa-chevron-down section-chevron${collapsed ? ' collapsed' : ''}`} />
        <span className="section-title">{title}</span>
      </div>
      <div className={`section-body-inner${collapsed ? ' collapsed' : ''}`}>{children}</div>
    </>
  );
}

export default function AssetDetailPage({ asset: a, mode = 'view' }: Props) {
  const isCreate = mode === 'create';
  const [leftTab, setLeftTab] = useState<'details' | 'related'>('details');
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    basic: false, tjf: false, product: false, category: false, commissioning: false,
  });

  const toggle = (k: SectionKey) =>
    setCollapsed((prev) => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="ad-view">
      {/* ── DETAIL HEADER ── */}
      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-title-row">
            <div className="detail-icon">
              <i
                className="fas fa-file-medical-alt"
                style={{ color: 'rgba(255,255,255,.9)', fontSize: '14px' }}
              />
            </div>
            <div>
              <div className="detail-breadcrumb">Asset</div>
              <div className="detail-name">
                {isCreate ? 'New Asset' : a?.name ?? 'Asset Details'}
              </div>
            </div>
          </div>
          <div className="detail-actions">
            {isCreate ? (
              <>
                <button className="det-btn">Cancel</button>
                <button className="det-btn primary">Save</button>
              </>
            ) : (
              <>
                <button className="det-btn">
                  <i className="fas fa-plus" style={{ fontSize: '10px', marginRight: '4px' }} />
                  Follow
                </button>
                <button className="det-btn primary">Edit</button>
                <button className="det-btn">Clone</button>
              </>
            )}
          </div>
        </div>

        {!isCreate && (
          <div className="detail-summary">
            <div className="summary-field">
              <span className="summary-label">Asset Status</span>
              <span className="summary-val">{a?.status ?? '—'}</span>
            </div>
            <div className="summary-field">
              <span className="summary-label">Hospital</span>
              <span className="summary-val">
                <a href="#">{a?.hospital ?? '—'}</a>
              </span>
            </div>
            <div className="summary-field">
              <span className="summary-label">Install Date (Commission Date)</span>
              <span className="summary-val">{a?.installFull ?? a?.installDate ?? '—'}</span>
            </div>
            <div className="summary-field">
              <span className="summary-label">Contact</span>
              <span className="summary-val">{a?.contact || '—'}</span>
            </div>
            <div className="summary-field">
              <span className="summary-label">Quantity</span>
              <span className="summary-val">{a?.qty ?? '1.00'}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── QUICK LINKS ── */}
      {!isCreate && (
        <div className="quick-links-bar">
          <div className="quick-links-label">
            Related List Quick Links&nbsp;
            <i className="fas fa-info-circle field-info" />
          </div>
          <div className="quick-links-grid">
            {QUICK_LINKS.map((ql) => (
              <button key={ql.label} className="quick-link">
                <div className="ql-icon" style={{ background: ql.color }}>
                  <i className={ql.icon} style={{ fontSize: '8px' }} />
                </div>
                <span className="ql-label">{ql.label}</span>
                {ql.count !== '' && <span className="ql-count">({ql.count})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TWO-PANE BODY ── */}
      <div className="detail-body">
        {/* LEFT */}
        <div className="detail-left">
          {!isCreate && (
            <div className="ad-sub-tabs">
              <button
                className={`ad-sub-tab${leftTab === 'details' ? ' active' : ''}`}
                onClick={() => setLeftTab('details')}
              >
                Details
              </button>
              <button
                className={`ad-sub-tab${leftTab === 'related' ? ' active' : ''}`}
                onClick={() => setLeftTab('related')}
              >
                Related
              </button>
            </div>
          )}

          {(leftTab === 'details' || isCreate) && (
            <>
              {/* Top fields */}
              <div className="detail-fields">
                <div className="field-row">
                  <div className="field-cell">
                    <div className="field-label">Description</div>
                    <div className="field-val" style={{ color: '#aaa', fontStyle: 'italic' }} />
                    {!isCreate && (
                      <button className="field-edit">
                        <i className="fas fa-pencil-alt" />
                      </button>
                    )}
                  </div>
                  <div className="field-cell" />
                </div>
                <div className="field-row">
                  <div className="field-cell">
                    <div className="field-label">Asset Name</div>
                    <div className="field-val">{a?.name}</div>
                    {!isCreate && (
                      <button className="field-edit">
                        <i className="fas fa-pencil-alt" />
                      </button>
                    )}
                  </div>
                  <div className="field-cell" />
                </div>
                <div className="field-row">
                  <div className="field-cell">
                    <div className="field-label">Nature</div>
                    <div className="field-val">Equipment</div>
                  </div>
                  <div className="field-cell">
                    <div className="field-label">PCL Lost/Cancel Report</div>
                    <div className="field-val" />
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <SectionBlock
                title="Basic Information"
                collapsed={collapsed.basic}
                onToggle={() => toggle('basic')}
              >
                <div className="detail-fields">
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Status</div>
                      <div className="field-val">{isCreate ? '' : (a?.status ?? 'In Use')}</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">ESAS MODEL + Serial</div>
                      <div className="field-val">{a?.serialNo ?? a?.serial ?? ''}</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Asset Status</div>
                      <div className="field-val">{a?.status}</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">■ PM Report Number</div>
                      <div className="field-val" />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Installation Location</div>
                      <div className="field-val">Operation Room</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Strategic Department</div>
                      <div className="field-val">GS</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Asset Category</div>
                      <div className="field-val">Capital</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">FSE Owner</div>
                      <div className="field-val">Pongsak Suriya</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Competitor Asset</div>
                      <div className="field-val">
                        <span className="cb-icon" />
                      </div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Valid / inValid(Dept)</div>
                      <div className="field-val">Valid</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Checked Location</div>
                      <div className="field-val">
                        <span className="cb-icon checked">
                          <i className="fas fa-check" style={{ fontSize: '9px' }} />
                        </span>
                      </div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Order No</div>
                      <div className="field-val">{a?.assetNo || '20049378'}</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Total Repair Amount (Parts FOB w/o VAT)</div>
                      <div className="field-val">THB 0.00</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Hospital Province</div>
                      <div className="field-val">PHITSANULOK</div>
                    </div>
                  </div>
                </div>
              </SectionBlock>

              {/* TJF Annual Inspection */}
              <SectionBlock
                title="TJF Annual Inspection"
                collapsed={collapsed.tjf}
                onToggle={() => toggle('tjf')}
              >
                <div className="detail-fields">
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label"># of Annual Inspection</div>
                      <div className="field-val">0</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Annual Inspection Status</div>
                      <div className="field-val">4.Not Target</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Latest Annual Inspect Date</div>
                      <div className="field-val" />
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Annual Inspection Plan Date</div>
                      <div className="field-val" />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Next Annual Inspection Deadline</div>
                      <div className="field-val" />
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Annual Inspection Comment</div>
                      <div className="field-val" />
                    </div>
                  </div>
                </div>
              </SectionBlock>

              {/* Product Information */}
              <SectionBlock
                title="Product Information"
                collapsed={collapsed.product}
                onToggle={() => toggle('product')}
              >
                <div className="detail-fields">
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Product</div>
                      <div className="field-val">
                        <a href="#">{a?.product ?? a?.name}</a>
                      </div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Serial Number</div>
                      <div className="field-val">{a?.serialNo ?? a?.serial}</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Asset No (SAP)</div>
                      <div className="field-val">{a?.assetNo}</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Asset Owner</div>
                      <div className="field-val">HP Asset</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Demo / Loaner</div>
                      <div className="field-val">{a?.type || 'Demo / Loaner'}</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Asset Source</div>
                      <div className="field-val">Manual Input</div>
                    </div>
                  </div>
                </div>
              </SectionBlock>

              {/* Product Category */}
              <SectionBlock
                title="Product Category"
                collapsed={collapsed.category}
                onToggle={() => toggle('category')}
              >
                <div className="detail-fields">
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">OTH Tier1</div>
                      <div className="field-val">SE</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Business Unit</div>
                      <div className="field-val" />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">OTH Tier2</div>
                      <div className="field-val">Camera Head Systems</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Competitor Product</div>
                      <div className="field-val">
                        <span className="cb-icon" />
                      </div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">OTH Tier3</div>
                      <div className="field-val">Camera Heads and Accessories</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Competitor Name</div>
                      <div className="field-val" />
                    </div>
                  </div>
                </div>
              </SectionBlock>

              {/* Commissioning Information */}
              <SectionBlock
                title="Commissioning Information"
                collapsed={collapsed.commissioning}
                onToggle={() => toggle('commissioning')}
              >
                <div className="detail-fields">
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Invoiced Date</div>
                      <div className="field-val">{a?.installFull ?? a?.installDate}</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Warranty Start Day</div>
                      <div className="field-val">{a?.installFull ?? a?.installDate}</div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-cell">
                      <div className="field-label">Install Date (Commission Date)</div>
                      <div className="field-val">{a?.installFull ?? a?.installDate}</div>
                    </div>
                    <div className="field-cell">
                      <div className="field-label">Warranty Period End Date</div>
                      <div className="field-val">2025/08/28</div>
                    </div>
                  </div>
                </div>
              </SectionBlock>

              <div style={{ height: '40px' }} />
            </>
          )}

          {leftTab === 'related' && !isCreate && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#706e6b', fontSize: '13px' }}>
              <i
                className="fas fa-link"
                style={{ fontSize: '24px', marginBottom: '10px', display: 'block', color: '#c0cfe0' }}
              />
              Related records will appear here.
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="detail-right">
          <div className="ad-right-panel">
            <div className="ad-right-sub-tabs">
              <button className="ad-right-sub-tab active">Activity</button>
              <button className="ad-right-sub-tab">Chatter</button>
            </div>
            <div className="ad-activity-top-links">
              <span>
                Filters: <a>All time</a> • <a>All activities</a> • <a>All types</a>
              </span>
              <button className="ad-activity-gear">
                <i className="fas fa-cog" />
              </button>
            </div>
            <div className="ad-activity-expand-row">
              <a>Refresh</a>
              <a>Expand All</a>
              <a>View All</a>
            </div>
            <div className="ad-activity-section">
              <div className="ad-activity-section-hdr">
                <span>
                  <i
                    className="fas fa-chevron-down"
                    style={{ fontSize: '10px', marginRight: '6px', color: '#888' }}
                  />
                  Upcoming &amp; Overdue
                </span>
              </div>
              <div className="ad-activity-empty">No activities to show.</div>
            </div>
            <div className="ad-activity-section" style={{ marginTop: '8px' }}>
              <div className="ad-activity-section-hdr">
                <span>Past Activity</span>
              </div>
              <div className="ad-activity-empty">
                Get started by sending an email, scheduling a task, and more.
                <br />
                <br />
                <span style={{ fontSize: '11px', color: '#aaa' }}>
                  No past activity. Past meetings and tasks marked as done show up here.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
