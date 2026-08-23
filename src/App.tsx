import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialDataIfEmpty } from './db/database';
import { getExpiryStatus } from './utils/formatters';
import type { UserRole, ShopSettings } from './types';
import { ToastContainer, type Toast } from './components/ui/Toast';

// Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'STAFF'>('ADMIN');
  const [currentUserName, setCurrentUserName] = useState<string>('');

  // Toast management
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Seed sample data on first launch
  useEffect(() => {
    seedInitialDataIfEmpty();
  }, []);

  // Update theme attribute on root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Live queries for header counters & settings
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  const settings = settingsList[0];

  // Badges calculations
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

  const handleLogin = (role: 'ADMIN' | 'STAFF', staffName?: string) => {
    setCurrentUserRole(role);
    setCurrentUserName(staffName || (role === 'ADMIN' ? 'Administrator' : 'Staff'));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserRole('ADMIN');
    setCurrentUserName('');
    setActiveTab('dashboard');
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} settings={settings} />;
  }

  // Effective settings object with activeUserRole aligned with logged-in role
  const effectiveSettings: ShopSettings | undefined = settings ? {
    ...settings,
    activeUserRole: currentUserRole,
    activeUserName: currentUserName || settings.activeUserName
  } : undefined;

  const isAdmin = currentUserRole === 'ADMIN';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Dynamic 3D Agricultural Background Canvas */}
      <AgriculturalCanvas enabled={settings?.enable3DEffects !== false} />

      {/* Top Sticky Navbar */}
      <Navbar
        settings={effectiveSettings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        expiryCount={expiryCount}
        theme={theme}
        setTheme={setTheme}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        lowStockCount={lowStockCount}
        expiryCount={expiryCount}
        userRole={currentUserRole}
      />

      {/* Main View Area */}
      <main 
        style={{
          flex: 1,
          padding: '24px 20px',
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'billing' && <POSBillingView settings={effectiveSettings} />}
        {activeTab === 'products' && <ProductCatalog />}
        {activeTab === 'low-stock' && <LowStockView setActiveTab={setActiveTab} />}
        {activeTab === 'expiry' && <ExpiryView />}
        {activeTab === 'stock-history' && <StockHistoryView />}
        {activeTab === 'sales-history' && <SalesHistoryView settings={effectiveSettings} />}
        {activeTab === 'purchases' && (isAdmin ? <PurchaseManagementView /> : <DashboardView setActiveTab={setActiveTab} />)}
        {activeTab === 'customers' && <CustomerManagementView settings={effectiveSettings} />}
        {activeTab === 'suppliers' && (isAdmin ? <SupplierManagementView settings={effectiveSettings} /> : <DashboardView setActiveTab={setActiveTab} />)}
        {activeTab === 'staff' && (isAdmin ? <StaffManagementView settings={effectiveSettings} /> : <DashboardView setActiveTab={setActiveTab} />)}
        {activeTab === 'staff-ledger' && (isAdmin ? <StaffLedgerView settings={effectiveSettings} /> : <DashboardView setActiveTab={setActiveTab} />)}
        {activeTab === 'reports' && (isAdmin ? <ReportsView /> : <DashboardView setActiveTab={setActiveTab} />)}
        {activeTab === 'settings' && (isAdmin ? <SettingsView /> : <DashboardView setActiveTab={setActiveTab} />)}
      </main>

      {/* Footer */}
      <footer 
        style={{
          textAlign: 'center',
          padding: '16px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-glass)',
          position: 'relative',
          zIndex: 1
        }}
        className="no-print"
      >
        Kisan Dost Agro Pesticide Management • Designed for Agricultural Retail Shops in Pakistan • Offline First Storage
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
