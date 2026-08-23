import React from 'react';
import { 
  Sprout, 
  ShoppingCart, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Menu, 
  LogOut,
  User,
  ArrowLeft
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
  onBack: () => void;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  currentUserRole: 'ADMIN' | 'STAFF';
  currentUserName: string;
}

export const Navbar: React.FC<Props> = ({
  settings,
  activeTab,
  setActiveTab,
  lowStockCount,
  theme,
  setTheme,
  onToggleSidebar,
  onBack,
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
      <div className="app-navbar__brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {activeTab !== 'dashboard' && (
          <button
            className="btn btn-secondary btn-icon"
            onClick={onBack}
            title="Back to previous screen"
            aria-label="Back to previous screen"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <button 
          className="btn btn-secondary btn-icon"
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          aria-label="Open navigation menu"
          style={{ display: 'flex' }}
        >
          <Menu size={20} />
        </button>

        <div 
          onClick={() => setActiveTab('dashboard')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div
            className="shop-logo shop-logo--header"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              transform: 'perspective(500px) rotateY(-10deg)'
            }}
          >
            {settings?.logoDataUrl ? (
              <img src={settings.logoDataUrl} alt="Official shop logo" className="shop-logo__image" />
            ) : (
              <Sprout size={21} aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {settings?.shopName || 'Kisan Dost Pesticides'}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 500 }}>
              {settings?.city ? `${settings.city} Branch` : 'Pesticide & Agro Shop System'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="app-navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Low Stock Warning Counter */}
        {lowStockCount > 0 && (
          <button 
            className="btn btn-warning quick-action"
            onClick={() => setActiveTab('low-stock')}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <AlertTriangle size={17} aria-hidden="true" />
            <span className="desktop-only">{lowStockCount} Low Stock</span>
            <span className="mobile-only" style={{ display: 'none' }}>{lowStockCount}</span>
          </button>
        )}

        {/* Quick Billing Action */}
        <button 
          className="btn btn-primary quick-action"
          onClick={() => setActiveTab('billing')}
          style={{ padding: '8px 16px' }}
        >
          <ShoppingCart size={18} aria-hidden="true" />
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
          <LogOut size={18} aria-hidden="true" />
        </button>

        {/* Theme Toggle */}
        <button 
          className="btn btn-secondary btn-icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun size={18} color="var(--accent-gold)" aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
};
