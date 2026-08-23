import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  CalendarX, 
  Truck, 
  Receipt, 
  Users, 
  Building2, 
  BarChart3, 
  Settings,
  X,
  Sparkles,
  TrendingUp,
  UserCog,
  Wallet
} from 'lucide-react';
import type { UserRole } from '../../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  lowStockCount: number;
  expiryCount: number;
  userRole: UserRole;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  lowStockCount,
  expiryCount,
  userRole
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roleReq: 'EMPLOYEE' },
    { id: 'billing', label: 'Billing / POS', icon: ShoppingCart, roleReq: 'EMPLOYEE', badge: 'FAST' },
    { id: 'products', label: 'Product Inventory', icon: Package, roleReq: 'EMPLOYEE' },
    { id: 'low-stock', label: 'Low Stock Alerts', icon: AlertTriangle, roleReq: 'EMPLOYEE', count: lowStockCount, color: 'var(--warning-500)' },
    { id: 'expiry', label: 'Expiry Alerts', icon: CalendarX, roleReq: 'EMPLOYEE', count: expiryCount, color: 'var(--danger-500)' },
    { id: 'stock-history', label: 'Stock Movement', icon: TrendingUp, roleReq: 'EMPLOYEE' },
    { id: 'sales-history', label: 'Sales History', icon: Receipt, roleReq: 'EMPLOYEE' },
    { id: 'purchases', label: 'Purchases Intake', icon: Truck, roleReq: 'ADMIN' },
    { id: 'customers', label: 'Customers Ledger', icon: Users, roleReq: 'EMPLOYEE' },
    { id: 'suppliers', label: 'Suppliers Ledger', icon: Building2, roleReq: 'ADMIN' },
    { id: 'staff', label: 'Staff Management', icon: UserCog, roleReq: 'ADMIN' },
    { id: 'staff-ledger', label: 'Staff Ledger', icon: Wallet, roleReq: 'ADMIN' },
    { id: 'reports', label: 'Reports & Profit', icon: BarChart3, roleReq: 'ADMIN' },
    { id: 'settings', label: 'Settings & Backup', icon: Settings, roleReq: 'ADMIN' }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 95
          }}
        />
      )}

      {/* Sidebar Navigation Container */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '85vw',
          zIndex: 100,
          background: 'var(--bg-surface-elevated)',
          borderRight: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform var(--transition-smooth)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: 'var(--shadow-3d)'
        }}
      >
        {/* Header inside sidebar */}
        <div 
          style={{
            padding: '20px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary-400)" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-400)', letterSpacing: '0.5px' }}>
              AGRO MANAGER
            </span>
          </div>

          <button 
            className="btn btn-secondary btn-icon"
            onClick={onClose}
            style={{ width: '36px', height: '36px', minHeight: '36px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '14px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isSelected = activeTab === item.id;
            const Icon = item.icon;
            const isRestricted = item.roleReq === 'ADMIN' && userRole !== 'ADMIN';

            if (isRestricted) {
              return null;
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1px solid var(--primary-400)' : '1px solid transparent',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(4, 77, 41, 0.4))' 
                    : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left'
                }}
                className={isSelected ? 'nav-item-active' : ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={19} color={isSelected ? 'var(--primary-400)' : 'currentColor'} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span 
                    style={{
                      background: item.color || 'var(--primary-600)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    {item.count}
                  </span>
                )}

                {item.badge && !item.count && (
                  <span 
                    style={{
                      background: 'var(--primary-600)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '8px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info inside sidebar */}
        <div 
          style={{
            padding: '16px 14px',
            borderTop: '1px solid var(--border-light)',
            background: 'rgba(0,0,0,0.2)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <p style={{ fontWeight: 700, color: 'var(--primary-400)' }}>Pesticide Shop Management</p>
          <p>Version 3.0 • Pakistan Edition</p>
        </div>
      </aside>
    </>
  );
};
