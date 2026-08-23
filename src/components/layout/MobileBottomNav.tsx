import React from 'react';
import {
  BarChart3,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMenu: () => void;
  userRole: UserRole;
}

export const MobileBottomNav: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenMenu,
  userRole,
}) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'billing', label: 'POS', icon: ShoppingCart },
    { id: 'products', label: 'Stock', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    ...(userRole === 'ADMIN'
      ? [{ id: 'reports', label: 'Reports', icon: BarChart3 }]
      : []),
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
      {items.map(({ id, label, icon: Icon }) => {
        const selected = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            className={`mobile-bottom-nav__item${selected ? ' is-active' : ''}`}
            onClick={() => setActiveTab(id)}
            aria-current={selected ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={selected ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        );
      })}
      <button
        type="button"
        className={`mobile-bottom-nav__item${activeTab !== 'dashboard' && activeTab !== 'billing' && activeTab !== 'products' && activeTab !== 'customers' && activeTab !== 'reports' ? ' is-active' : ''}`}
        onClick={onOpenMenu}
        aria-label="Open more sections"
      >
        <MoreHorizontal size={20} />
        <span>More</span>
      </button>
    </nav>
  );
};
