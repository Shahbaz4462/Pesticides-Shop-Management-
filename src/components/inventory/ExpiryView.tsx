import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { getExpiryStatus, formatDate } from '../../utils/formatters';
import { CalendarX, CheckCircle2 } from 'lucide-react';

export const ExpiryView: React.FC = () => {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  const expiringProducts = products
    .map(p => ({
      product: p,
      expiryStatus: getExpiryStatus(p.expiryDate)
    }))
    .filter(item => item.expiryStatus.type === 'EXPIRED' || item.expiryStatus.type === 'EXPIRING_SOON')
    .sort((a, b) => a.expiryStatus.daysLeft - b.expiryStatus.daysLeft);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div 
        className="card-3d"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(127, 29, 29, 0.35))',
          borderColor: 'var(--danger-500)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div 
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--danger-100)',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CalendarX size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Pesticide Expiry Management</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Products expiring within 60 days or past their chemical shelf-life expiration date.
          </p>
        </div>
      </div>

      {expiringProducts.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CheckCircle2 size={46} color="var(--emerald-500)" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Expiring Products</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            All chemicals and fertilizers in your catalog have healthy expiration dates.
          </p>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Batch Number</th>
                <th>Expiry Date</th>
                <th>Stock Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expiringProducts.map(({ product, expiryStatus }) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {product.category}</div>
                  </td>
                  <td>{product.brand}</td>
                  <td><code>{product.batchNo || 'N/A'}</code></td>
                  <td style={{ fontWeight: 700 }}>{formatDate(product.expiryDate)}</td>
                  <td>{product.stockQty} {product.unit}s</td>
                  <td>
                    <span className={`badge ${expiryStatus.badgeClass}`}>
                      {expiryStatus.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
