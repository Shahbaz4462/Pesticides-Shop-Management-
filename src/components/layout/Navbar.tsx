import React from 'react';
import { 
  Sprout, 
  ShoppingCart, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Menu, 
  LogOut,
  User
} from 'lucide-react';
import type { UserRole, ShopSettings } from '../../types';

interface Props {
  settings?: ShopSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  expiryCount: number;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  onToggleSidebar: () => void;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  currentUserRole: 'ADMIN' | 'STAFF';
  currentUserName: string;
}

export const Navbar: React.FC<Props> = ({
  settings,
  setActiveTab,
  lowStockCount,
  theme,
  setTheme,
  onToggleSidebar,
  onLogout,
  currentUserRole,
  currentUserName
}) => {

  return (
    <header 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Left: Mobile Menu & Shop Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button 
          className="btn btn-secondary btn-icon"
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          style={{ display: 'flex' }}
        >
          <Menu size={20} />
        </button>

        <div 
          onClick={() => setActiveTab('dashboard')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              transform: 'perspective(500px) rotateY(-10deg)'
            }}
          >
            <Sprout size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {settings?.shopName || 'Kisan Dost Pesticides'}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 500 }}>
              {settings?.city ? `${settings.city} Branch • Offline Direct DB` : 'Pesticide & Agro Shop System'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Low Stock Warning Counter */}
        {lowStockCount > 0 && (
          <button 
            className="btn btn-warning"
            onClick={() => setActiveTab('low-stock')}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <AlertTriangle size={16} />
            <span className="desktop-only">{lowStockCount} Low Stock</span>
            <span className="mobile-only" style={{ display: 'none' }}>{lowStockCount}</span>
          </button>
        )}

        {/* Quick Billing Action */}
        <button 
          className="btn btn-primary"
          onClick={() => setActiveTab('billing')}
          style={{ padding: '8px 16px' }}
        >
          <ShoppingCart size={18} />
          <span className="desktop-only" style={{ fontWeight: 700 }}>New Sale (POS)</span>
          <span className="mobile-only" style={{ display: 'none', fontWeight: 700 }}>POS</span>
        </button>

        {/* Current User Info */}
        <div 
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)'
          }}
        >
          <User size={16} color={currentUserRole === 'ADMIN' ? 'var(--primary-400)' : 'var(--accent-gold)'} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUserName}</span>
          <span 
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: currentUserRole === 'ADMIN' ? 'var(--primary-100)' : 'var(--warning-100)',
              color: currentUserRole === 'ADMIN' ? '#047857' : '#b45309'
            }}
          >
            {currentUserRole}
          </span>
        </div>

        {/* Logout Button */}
        <button 
          className="btn btn-secondary btn-icon"
          onClick={onLogout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>

        {/* Theme Toggle */}
        <button 
          className="btn btn-secondary btn-icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun size={18} color="var(--accent-gold)" /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
