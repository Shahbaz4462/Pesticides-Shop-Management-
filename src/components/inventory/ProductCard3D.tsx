import React from 'react';
import type { Product } from '../../types';
import { getStockStatus, getExpiryStatus, formatPKR } from '../../utils/formatters';
import { Package, Edit2, Trash2, PlusCircle, Calendar } from 'lucide-react';

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddStock: (product: Product) => void;
}

export const ProductCard3D: React.FC<Props> = ({
  product,
  onEdit,
  onDelete,
  onAddStock
}) => {
  const stockStatus = getStockStatus(product.stockQty, product.minStockAlert);
  const expiryStatus = getExpiryStatus(product.expiryDate);

  return (
    <div 
      className="card-3d"
      style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        {/* Card Header: Category & Stock Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span 
            style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: 'var(--primary-400)', 
              background: 'rgba(16, 185, 129, 0.12)', 
              padding: '3px 8px', 
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            {product.category}
          </span>

          <span className={`badge ${stockStatus.badgeClass}`}>
            {stockStatus.label}
          </span>
        </div>

        {/* Product Image / Visual Placeholder */}
        <div 
          style={{
            height: '110px',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '12px',
            border: '1px solid var(--border-light)',
            position: 'relative'
          }}
        >
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
              <Package size={36} color="var(--primary-500)" style={{ filter: 'drop-shadow(0 2px 8px rgba(16,185,129,0.3))' }} />
              <span style={{ fontSize: '0.72rem', marginTop: '4px', fontWeight: 600 }}>{product.brand}</span>
            </div>
          )}

          {product.formulation && product.formulation !== 'N/A' && (
            <span 
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                fontSize: '0.7rem',
                fontWeight: 800,
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#ffffff',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              {product.formulation}
            </span>
          )}
        </div>

        {/* Product Details */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25, marginBottom: '4px' }}>
          {product.name}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Brand: <strong style={{ color: 'var(--primary-300)' }}>{product.brand}</strong> • SKU: {product.sku || 'N/A'}
        </p>

        {/* Expiry Badge if warning */}
        {expiryStatus.type !== 'NONE' && (
          <div style={{ marginBottom: '10px' }}>
            <span className={`badge ${expiryStatus.badgeClass}`} style={{ fontSize: '0.72rem' }}>
              <Calendar size={12} /> {expiryStatus.label}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Price & Actions */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Selling Price</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-400)' }}>
              {formatPKR(product.sellingPrice)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stock Qty</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: product.stockQty <= product.minStockAlert ? 'var(--warning-500)' : 'var(--text-main)' }}>
              {product.stockQty} <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{product.unit}s</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => onAddStock(product)}
            style={{ flex: 1, padding: '6px', fontSize: '0.8rem', minHeight: '36px' }}
            title="Quick Stock Increase"
          >
            <PlusCircle size={15} color="var(--primary-400)" />
            <span>+ Stock</span>
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            onClick={() => onEdit(product)}
            style={{ minHeight: '36px', width: '36px', padding: '6px' }}
            title="Edit Product"
          >
            <Edit2 size={15} color="var(--info-500)" />
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            onClick={() => onDelete(product)}
            style={{ minHeight: '36px', width: '36px', padding: '6px' }}
            title="Delete Product"
          >
            <Trash2 size={15} color="var(--danger-500)" />
          </button>
        </div>
      </div>
    </div>
  );
};
