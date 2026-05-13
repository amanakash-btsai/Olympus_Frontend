import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type DashboardTabType =
  | 'assets'
  | 'sales-field'
  | 'demo-tracker'
  | 'loaner-tracker'
  | 'asset-detail'
  | 'create-asset'
  | 'dashboard';

export interface DashboardTab {
  id: string;
  type: DashboardTabType;
  title: string;
  closable?: boolean;
  payload?: any;
}

interface DashboardTabContextType {
  tabs: DashboardTab[];
  activeTabId: string;
  openTab: (tab: DashboardTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
}

const DashboardTabContext = createContext<DashboardTabContextType | null>(null);

export function DashboardTabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<DashboardTab[]>([
    // CHANGED: closable was false — set to true to show the × button on Assets tab
    { id: 'assets', type: 'assets', title: 'Assets', closable: true },
  ]);
  const [activeTabId, setActiveTabId] = useState('assets');

  const openTab = (tab: DashboardTab) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === tab.id);
      if (exists) {
        setActiveTabId(tab.id);
        return prev;
      }
      return [...prev, tab];
    });
    setActiveTabId(tab.id);
  };

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId && filtered.length > 0) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  const value = useMemo(
    () => ({ tabs, activeTabId, openTab, closeTab, setActiveTab: setActiveTabId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabs, activeTabId],
  );

  return (
    <DashboardTabContext.Provider value={value}>
      {children}
    </DashboardTabContext.Provider>
  );
}

export function useDashboardTabs() {
  const context = useContext(DashboardTabContext);
  if (!context) {
    throw new Error('useDashboardTabs must be used inside DashboardTabProvider');
  }
  return context;
}
