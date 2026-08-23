import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle2,
          bgColor: 'rgba(16, 185, 129, 0.95)',
          borderColor: 'var(--emerald-500)',
          iconColor: '#ffffff'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'rgba(239, 68, 68, 0.95)',
          borderColor: 'var(--danger-500)',
          iconColor: '#ffffff'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'rgba(245, 158, 11, 0.95)',
          borderColor: 'var(--warning-500)',
          iconColor: '#ffffff'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'rgba(59, 130, 246, 0.95)',
          borderColor: 'var(--info-500)',
          iconColor: '#ffffff'
        };
      default:
        return {
          icon: Info,
          bgColor: 'rgba(59, 130, 246, 0.95)',
          borderColor: 'var(--info-500)',
          iconColor: '#ffffff'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        minWidth: '300px',
        maxWidth: '420px',
        transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Icon size={22} color={config.iconColor} />
      <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600 }}>
        {toast.message}
      </span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
      >
        <X size={18} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};
