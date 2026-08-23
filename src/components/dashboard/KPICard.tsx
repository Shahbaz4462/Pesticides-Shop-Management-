import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
  animate?: boolean;
}

export const KPICard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  badgeText,
  badgeType = 'success',
  onClick,
  animate = true
}) => {
  // Parse numeric value for animation
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
  const { formatted: animatedValue } = useAnimatedNumber(numericValue, 1200, 0);

  // Format the display value
  const displayValue = animate && !isNaN(numericValue) 
    ? (typeof value === 'string' && value.startsWith('Rs.') 
        ? `Rs. ${Math.round(parseFloat(animatedValue)).toLocaleString('en-PK')}`
        : animatedValue)
    : value;

  return (
    <div 
      className="card-3d kpi-card"
      onClick={onClick}
      style={{
        padding: '20px 22px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '135px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span className="kpi-card__title" style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </span>
          <div className="kpi-card__value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.1 }}>
            {displayValue}
          </div>
        </div>

        <div 
          className="kpi-card__icon"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: `rgba(${color}, 0.15)`,
            border: `1px solid rgba(${color}, 0.3)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 15px rgba(${color}, 0.2)`
          }}
        >
          <Icon size={24} style={{ color: `rgb(${color})` }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
        {subtitle ? (
          <span className="kpi-card__subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {subtitle}
          </span>
        ) : <div />}

        {badgeText && (
          <span className={`badge badge-${badgeType}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
