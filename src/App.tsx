import React, { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialDataIfEmpty } from './db/database';
import { getExpiryStatus } from './utils/formatters';
import type { UserRole, ShopSettings } from './types';
import { ToastContainer, type Toast } from './components/ui/Toast';

// Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { AgriculturalCanvas } from './components/layout/AgriculturalCanvas';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductCatalog } from './components/inventory/ProductCatalog';
import { LowStockView } from './components/inventory/LowStockView';
import { ExpiryView } from './components/inventory/ExpiryView';
import { StockHistoryView } from './components/inventory/StockHistoryView';
import { POSBillingView } from './components/billing/POSBillingView';
import { SalesHistoryView } from './components/sales/SalesHistoryView';
import { PurchaseManagementView } from './components/purchases/PurchaseManagementView';
import { CustomerManagementView } from './components/customers/CustomerManagementView';
import { SupplierManagementView } from './components/suppliers/SupplierManagementView';
import { StaffManagementView } from './components/staff/StaffManagementView';
import { StaffLedgerView } from './components/staff/StaffLedgerView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const ROOT_TAB = 'dashboard';
const ADMIN_ONLY_TABS = new Set(['purchases', 'suppliers', 'staff', 'staff-ledger', 'reports', 'settings']);
const VALID_TABS = new Set([
  ROOT_TAB,
  'billing',
  'products',
  'low-stock',
  'expiry',
  'stock-history',
  'sales-history',
  'purchases',
  'customers',
  'suppliers',
  'staff',
  'staff-ledger',
  'reports',
  'settings',
]);

const getTabFromLocation = () => {
  const tab = new URLSearchParams(window.location.search).get('screen');
  return tab && VALID_TABS.has(tab) ? tab : ROOT_TAB;
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(getTabFromLocation);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'STAFF'>('ADMIN');
  const [currentUserName, setCurrentUserName] = useState<string>('');

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    seedInitialDataIfEmpty();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromLocation());
      setIsSidebarOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((tab: string) => {
    if (!VALID_TABS.has(tab)) return;
    if (ADMIN_ONLY_TABS.has(tab) && currentUserRole !== 'ADMIN') {
      setActiveTab(ROOT_TAB);
      return;
    }

    setIsSidebarOpen(false);
    if (activeTab === tab) return;

    const url = new URL(window.location.href);
    url.searchParams.set('screen', tab);
    window.history.pushState({ screen: tab }, '', url);
    setActiveTab(tab);
  }, [activeTab, currentUserRole]);

  useEffect(() => {
    window.history.replaceState({ screen: getTabFromLocation() }, '', window.location.href);
  }, []);

  useEffect(() => {
    document.title = activeTab === ROOT_TAB ? 'Agro Manager' : `${activeTab.replace('-', ' ')} • Agro Manager`;
  }, [activeTab]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn, isSidebarOpen]);

  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const settings = settingsList[0];

  const lowStockCount = products.filter(p => p.stockQty <= p.minStockAlert).length;
  const expiryCount = products.filter(p => {
    const status = getExpiryStatus(p.expiryDate);
    return status.type === 'EXPIRED' || status.type === 'EXPIRING_SOON';
  }).length;

  const handleRoleChange = async (newRole: UserRole) => {
    if (settings && settings.id) {
      await db.settings.update(settings.id, { activeUserRole: newRole });
    }
  };

  const handleBack = () => {
    if (activeTab !== ROOT_TAB) window.history.back();
  };

  const handleLogin = (role: 'ADMIN' | 'STAFF', staffName?: string) => {
    setCurrentUserRole(role);
    setCurrentUserName(staffName || (role === 'ADMIN' ? 'Administrator' : 'Staff'));
    setIsLoggedIn(true);
    navigateTo(ROOT_TAB);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserRole('ADMIN');
    setCurrentUserName('');
    setIsSidebarOpen(false);
    setActiveTab(ROOT_TAB);
    const url = new URL(window.location.href);
    url.searchParams.delete('screen');
    window.history.replaceState({ screen: ROOT_TAB }, '', url);
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} settings={settings} />;
  }

  const effectiveSettings: ShopSettings | undefined = settings ? {
    ...settings,
    activeUserRole: currentUserRole,
    activeUserName: currentUserName || settings.activeUserName,
  } : undefined;

  const isAdmin = currentUserRole === 'ADMIN';
  const activeScreen = (() => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView setActiveTab={navigateTo} />;
      case 'billing': return <POSBillingView settings={effectiveSettings} />;
      case 'products': return <ProductCatalog />;
      case 'low-stock': return <LowStockView setActiveTab={navigateTo} />;
      case 'expiry': return <ExpiryView />;
      case 'stock-history': return <StockHistoryView />;
      case 'sales-history': return <SalesHistoryView settings={effectiveSettings} />;
      case 'purchases': return isAdmin ? <PurchaseManagementView /> : <DashboardView setActiveTab={navigateTo} />;
      case 'customers': return <CustomerManagementView settings={effectiveSettings} />;
      case 'suppliers': return isAdmin ? <SupplierManagementView settings={effectiveSettings} /> : <DashboardView setActiveTab={navigateTo} />;
      case 'staff': return isAdmin ? <StaffManagementView settings={effectiveSettings} /> : <DashboardView setActiveTab={navigateTo} />;
      case 'staff-ledger': return isAdmin ? <StaffLedgerView settings={effectiveSettings} /> : <DashboardView setActiveTab={navigateTo} />;
      case 'reports': return isAdmin ? <ReportsView /> : <DashboardView setActiveTab={navigateTo} />;
      case 'settings': return isAdmin ? <SettingsView /> : <DashboardView setActiveTab={navigateTo} />;
      default: return <DashboardView setActiveTab={navigateTo} />;
    }
  })();

  return (
    <div className="app-shell">
      <AgriculturalCanvas enabled={settings?.enable3DEffects !== false} />
      <Navbar
        settings={effectiveSettings}
        activeTab={activeTab}
        setActiveTab={navigateTo}
        lowStockCount={lowStockCount}
        expiryCount={expiryCount}
        theme={theme}
        setTheme={setTheme}
        onToggleSidebar={() => setIsSidebarOpen(open => !open)}
        onBack={handleBack}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
      />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        lowStockCount={lowStockCount}
        expiryCount={expiryCount}
        userRole={currentUserRole}
      />
      <main className="app-main" aria-live="polite">
        <div className="screen-container" key={activeTab}>
          {activeScreen}
        </div>
      </main>
      <footer className="app-footer no-print">
        Kisan Dost Agro Pesticide Management • Designed for Agricultural Retail Shops in Pakistan
      </footer>
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onOpenMenu={() => setIsSidebarOpen(true)}
        userRole={currentUserRole}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
