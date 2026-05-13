import { useDashboardTabs } from './DashboardTabContext';

export default function DashboardTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useDashboardTabs();

  return (
    <div className="dashboard-tabs">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={`dashboard-tab ${active ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.title}</span>
            {tab.closable !== false && (
              <button
                className="tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
