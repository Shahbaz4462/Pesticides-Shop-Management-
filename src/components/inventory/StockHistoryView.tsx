import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { StockLog } from '../../types';
import { 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Package, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const StockHistoryView: React.FC = () => {
  const stockLogs = useLiveQuery(() => db.stockLogs.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');

  // Filter logs
  const filteredLogs = stockLogs.filter(log => {
    const matchesSearch = 
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
    const matchesProduct = selectedProductId === 'ALL' || log.productId === parseInt(selectedProductId);

    return matchesSearch && matchesType && matchesProduct;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Get type-specific styling
  const getTypeConfig = (type: StockLog['type']) => {
    switch (type) {
      case 'INITIAL':
        return { 
          icon: Package, 
          color: 'var(--info-500)', 
          bg: 'var(--info-100)',
          label: 'Initial Stock',
          trend: 'neutral'
        };
      case 'ADD_STOCK':
        return { 
          icon: Plus, 
          color: 'var(--emerald-500)', 
          bg: 'var(--emerald-100)',
          label: 'Stock Added',
          trend: 'up'
        };
      case 'SALE':
        return { 
          icon: TrendingDown, 
          color: 'var(--danger-500)', 
          bg: 'var(--danger-100)',
          label: 'Sale Deduction',
          trend: 'down'
        };
      case 'PURCHASE':
        return { 
          icon: TrendingUp, 
          color: 'var(--primary-500)', 
          bg: 'var(--primary-100)',
          label: 'Purchase Intake',
          trend: 'up'
        };
      case 'ADJUSTMENT':
        return { 
          icon: RefreshCw, 
          color: 'var(--warning-500)', 
          bg: 'var(--warning-100)',
          label: 'Manual Adjustment',
          trend: 'neutral'
        };
      case 'RETURN':
        return { 
          icon: ArrowUp, 
          color: 'var(--accent-gold)', 
          bg: 'rgba(245, 158, 11, 0.1)',
          label: 'Return',
          trend: 'up'
        };
      default:
        return { 
          icon: Package, 
          color: 'var(--text-muted)', 
          bg: 'rgba(156, 163, 175, 0.1)',
          label: type,
          trend: 'neutral'
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div 
        className="card-3d"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Stock Movement History</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Complete audit trail of all inventory changes, sales, purchases, and adjustments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div 
        className="card-3d"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by product name or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <select 
          className="form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Movement Types</option>
          <option value="INITIAL">Initial Stock</option>
          <option value="ADD_STOCK">Stock Added</option>
          <option value="SALE">Sale Deduction</option>
          <option value="PURCHASE">Purchase Intake</option>
          <option value="ADJUSTMENT">Manual Adjustment</option>
          <option value="RETURN">Return</option>
        </select>

        <select 
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedProductId}
          onChange={e => setSelectedProductId(e.target.value)}
        >
          <option value="ALL">All Products</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Stock Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Package size={50} color="var(--primary-500)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Stock History Found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            No stock movement records match your search criteria.
          </p>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Movement Type</th>
                <th>Quantity Change</th>
                <th>New Stock Level</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const config = getTypeConfig(log.type);
                const Icon = config.icon;
                const isPositive = log.changeQty > 0;

                return (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600 }}>{formatDateTime(log.timestamp)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{log.productName}</div>
                    </td>
                    <td>
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: config.bg,
                          color: config.color
                        }}
                      >
                        <Icon size={14} />
                        {config.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isPositive ? (
                          <ArrowUp size={16} color="var(--emerald-500)" />
                        ) : (
                          <ArrowDown size={16} color="var(--danger-500)" />
                        )}
                        <span 
                          style={{ 
                            fontWeight: 800, 
                            fontSize: '1rem',
                            color: isPositive ? 'var(--emerald-500)' : 'var(--danger-500)'
                          }}
                        >
                          {isPositive ? '+' : ''}{log.changeQty}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                        {log.newQty}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {log.notes || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card-3d" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Movements</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
            {filteredLogs.length}
          </div>
        </div>

        <div className="card-3d" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stock Added</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--emerald-500)', marginTop: '4px' }}>
            {filteredLogs.filter(l => l.changeQty > 0).reduce((sum, l) => sum + l.changeQty, 0)}
          </div>
        </div>

        <div className="card-3d" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stock Deducted</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--danger-500)', marginTop: '4px' }}>
            {Math.abs(filteredLogs.filter(l => l.changeQty < 0).reduce((sum, l) => sum + l.changeQty, 0))}
          </div>
        </div>
      </div>
    </div>
  );
};
