import React from 'react';
import type { CartItem } from '../../types';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';

interface Props {
  item: CartItem;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
}

export const CartItemRow: React.FC<Props> = ({ item, onUpdateQty, onRemove }) => {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-light)',
        gap: '12px'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.product.name}
        </h4>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {item.product.brand} • {formatPKR(item.unitPrice)} / {item.product.unit}
        </p>
      </div>

      {/* Quantity Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
        <button 
          className="btn btn-secondary btn-icon"
          onClick={() => onUpdateQty(item.product.id!, item.quantity - 1)}
          style={{ width: '28px', height: '28px', minHeight: '28px', padding: '0' }}
        >
          <Minus size={14} />
        </button>

        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
          {item.quantity}
        </span>

        <button 
          className="btn btn-secondary btn-icon"
          onClick={() => onUpdateQty(item.product.id!, item.quantity + 1)}
          disabled={item.quantity >= item.product.stockQty}
          style={{ width: '28px', height: '28px', minHeight: '28px', padding: '0' }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Subtotal */}
      <div style={{ textAlign: 'right', minWidth: '85px' }}>
        <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-400)' }}>
          {formatPKR(item.subtotal)}
        </p>
      </div>

      {/* Remove Button */}
      <button 
        className="btn btn-secondary btn-icon"
        onClick={() => onRemove(item.product.id!)}
        style={{ width: '30px', height: '30px', minHeight: '30px', padding: '0', color: 'var(--danger-500)' }}
        title="Remove Item"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};
