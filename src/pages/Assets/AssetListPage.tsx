import { useState } from 'react';
import { useDashboardTabs } from '@/components/dashboard/DashboardTabContext';
import '../../styles/assets-dashboard.css';

const MOCK_ASSETS = [
  { id: 'a1',  pin: true,  name: 'OLYMUS GI-F190 CLT Monitor',                   serial: 'S12345',  hospital: 'Bumrungrad International',  status: 'Available',              statusColor: '#2e7d32', assetNo: '00001234', installDate: '02/15/19', type: 'Demo Asset',    product: 'GI-F190',     serialNo: 'S12345',  installFull: '2019/02/15', contact: 'Dr. Somchai', qty: '1.00' },
  { id: 'a2',  pin: true,  name: 'OLYMPUS Electro Surgical Unit CLT Monitor',     serial: 'E98765',  hospital: 'Bumrungrad International',  status: 'Returned',               statusColor: '#706e6b', assetNo: '',          installDate: '02/15/19', type: '',              product: 'ESU-400',     serialNo: 'E98765',  installFull: '2019/02/15', contact: '',            qty: '1.00' },
  { id: 'a3',  pin: false, name: 'MACE 140',                                      serial: 'A21725',  hospital: 'OLYMPUS GTX CLT',          status: 'Loaned',                 statusColor: '#0070d2', assetNo: '00063681', installDate: '07/11/11', type: 'Loaner Asset', product: 'MACE-140',    serialNo: 'A21725',  installFull: '2011/07/11', contact: 'Dr. Araya',   qty: '1.00' },
  { id: 'a4',  pin: false, name: 'GH-F150 64',                                    serial: 'B85492',  hospital: 'OLYMPUS GTX CLT',          status: 'Available',              statusColor: '#2e7d32', assetNo: '00094513', installDate: '07/11/11', type: 'Demo Asset',   product: 'GH-F150',     serialNo: 'B85492',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a5',  pin: false, name: 'MACE 140',                                      serial: 'C33218',  hospital: 'OLYMPUS GTX CLT',          status: 'Returned',               statusColor: '#706e6b', assetNo: '',          installDate: '07/11/11', type: '',              product: 'MACE-140',    serialNo: 'C33218',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a6',  pin: false, name: 'GP EX II 64',                                   serial: 'D10483',  hospital: 'OLYMPUS GTX CLT',          status: 'Overdue',                statusColor: '#dc2626', assetNo: '00083197', installDate: '07/11/11', type: 'Loaner Asset', product: 'GP-EX-II',    serialNo: 'D10483',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a7',  pin: false, name: 'GH-F150 64',                                    serial: 'F20571',  hospital: 'OLYMPUS GTX CLT',          status: 'Loaned',                 statusColor: '#0070d2', assetNo: '00056284', installDate: '07/11/11', type: 'Demo Asset',   product: 'GH-F150',     serialNo: 'F20571',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a8',  pin: false, name: 'CF EX II 64',                                   serial: 'G47392',  hospital: 'OLYMPUS GTX CLT',          status: 'Waiting list',           statusColor: '#d97706', assetNo: '00047261', installDate: '07/11/11', type: 'Loaner Asset', product: 'CF-EX-II',    serialNo: 'G47392',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a9',  pin: false, name: 'GF EX II 64',                                   serial: 'H58417',  hospital: 'OLYMPUS GTX CLT',          status: 'Available',              statusColor: '#2e7d32', assetNo: '00038952', installDate: '07/11/11', type: 'Demo Asset',   product: 'GF-EX-II',    serialNo: 'H58417',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a10', pin: false, name: 'CF EX II 84',                                   serial: 'I90234',  hospital: 'OLYMPUS GTX CLT',          status: 'Returned',               statusColor: '#706e6b', assetNo: '',          installDate: '07/11/11', type: '',              product: 'CF-EX-II-84', serialNo: 'I90234',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a11', pin: false, name: 'GF EX II 84',                                   serial: 'J71845',  hospital: 'OLYMPUS GTX CLT',          status: 'Overdue',                statusColor: '#dc2626', assetNo: '00018426', installDate: '07/11/11', type: 'Loaner Asset', product: 'GF-EX-II-84', serialNo: 'J71845',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a12', pin: false, name: 'GF EX 84',                                      serial: 'K23019',  hospital: 'OLYMPUS GTX CLT',          status: 'Loaned',                 statusColor: '#0070d2', assetNo: '00012837', installDate: '07/11/11', type: 'Demo Asset',   product: 'GF-EX-84',    serialNo: 'K23019',  installFull: '2011/07/11', contact: '',            qty: '1.00' },
  { id: 'a13', pin: false, name: 'CH-S700-XZ-EA',                                 serial: '7200524', hospital: 'Buddchinarat Hospital',     status: 'Returned but need repair', statusColor: '#d97706', assetNo: '20049378', installDate: '2023/08/29', type: 'Demo / Loaner', product: 'CH-S700-XZ-EA', serialNo: '7200524', installFull: '2023/08/29', contact: '', qty: '1.00' },
];

export type AssetRecord = typeof MOCK_ASSETS[0];

export default function AssetListPage() {
  const { openTab } = useDashboardTabs();
  const [search, setSearch] = useState('');

  const filtered = search
    ? MOCK_ASSETS.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.serial.toLowerCase().includes(search.toLowerCase()),
      )
    : MOCK_ASSETS;

  const openAsset = (asset: AssetRecord) => {
    openTab({
      id: `asset-${asset.id}`,
      type: 'asset-detail',
      title: asset.name,
      payload: asset,
    });
  };

  const createAsset = () => {
    openTab({ id: 'create-asset', type: 'create-asset', title: 'New Asset' });
  };

  return (
    <div className="assets-view">
      {/* Header toolbar */}
      <div className="assets-toolbar">
        <div className="assets-toolbar-left">
          <div className="asset-icon">
            <i className="fas fa-box-open" style={{ color: 'white', fontSize: '14px' }} />
          </div>
          <span className="assets-title">Recently Viewed</span>
          <span className="count-badge">{filtered.length}</span>
          <i
            className="fas fa-chevron-down"
            style={{ color: '#706e6b', fontSize: '11px', cursor: 'pointer' }}
          />
        </div>
        <div className="assets-toolbar-right">
          <button className="btn-sm">
            <i className="fas fa-chevron-left" style={{ fontSize: '10px' }} />
          </button>
          <button className="btn-sm">
            <i className="fas fa-chevron-right" style={{ fontSize: '10px' }} />
          </button>
          <button className="btn-new" onClick={createAsset}>
            New
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="assets-filter-bar">
        <div className="assets-filter-bar-left">{MOCK_ASSETS.length}+ items</div>
        <div className="assets-filter-bar-right">
          <div className="assets-search-wrap">
            <i className="fas fa-search" />
            <input
              type="text"
              className="assets-search-input"
              placeholder="Search this list..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button className="view-btn active">
              <i className="fas fa-list" />
            </button>
            <button className="view-btn">
              <i className="fas fa-th" />
            </button>
            <button className="view-btn">
              <i className="fas fa-chart-bar" />
            </button>
          </div>
          <button className="btn-sm">
            <i className="fas fa-filter" style={{ fontSize: '10px', marginRight: '4px' }} />
            Filters
          </button>
          <button className="btn-sm">
            <i className="fas fa-columns" style={{ fontSize: '10px' }} />
          </button>
          <button className="btn-sm">
            <i className="fas fa-ellipsis-h" style={{ fontSize: '10px' }} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="assets-table-wrap">
        <table className="assets-table">
          <thead className="tbl-head">
            <tr>
              <th style={{ width: '36px', textAlign: 'center' }}>#</th>
              <th style={{ minWidth: '200px' }}>
                Asset Name <i className="fas fa-sort sort-icon" />
              </th>
              <th style={{ minWidth: '110px' }}>
                Serial Number <i className="fas fa-sort sort-icon" />
              </th>
              <th style={{ minWidth: '160px' }}>
                Hospital <i className="fas fa-sort sort-icon" />
              </th>
              <th style={{ minWidth: '110px' }}>
                Asset Status <i className="fas fa-sort sort-icon" />
              </th>
              <th style={{ minWidth: '110px' }}>
                Asset Number <i className="fas fa-sort sort-icon" />
              </th>
              <th style={{ minWidth: '120px' }}>
                Installation Date <i className="fas fa-sort sort-icon" />
              </th>
              <th style={{ minWidth: '110px' }}>
                Demo/Loaner <i className="fas fa-sort sort-icon" />
              </th>
              <th style={{ minWidth: '70px' }}>Record</th>
            </tr>
          </thead>
          <tbody className="tbl-body">
            {filtered.map((asset, i) => (
              <tr key={asset.id} className={asset.pin ? 'pin-row' : ''}>
                <td style={{ textAlign: 'center', color: '#706e6b', fontSize: '11px' }}>
                  {i + 1}
                </td>
                <td>
                  {asset.pin && (
                    <i
                      className="fas fa-thumbtack"
                      style={{ color: '#0070d2', fontSize: '10px', marginRight: '4px' }}
                    />
                  )}
                  <button className="cell-link" onClick={() => openAsset(asset)}>
                    {asset.name}
                  </button>
                </td>
                <td>{asset.serial}</td>
                <td>{asset.hospital}</td>
                <td>
                  <span style={{ color: asset.statusColor, fontWeight: 500 }}>
                    {asset.status}
                  </span>
                </td>
                <td>{asset.assetNo}</td>
                <td>{asset.installDate}</td>
                <td>{asset.type}</td>
                <td>
                  <button className="btn-sm" onClick={() => openAsset(asset)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="assets-pagination">
        <span className="assets-pagination-info">
          Showing 1–{Math.min(filtered.length, 13)} of {MOCK_ASSETS.length}+ items
        </span>
        <div className="assets-pagination-nav">
          <button className="btn-sm" disabled>
            <i className="fas fa-chevron-left" style={{ fontSize: '10px' }} />
          </button>
          <span className="assets-pagination-label">Page 1</span>
          <button className="btn-sm" disabled>
            <i className="fas fa-chevron-right" style={{ fontSize: '10px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
