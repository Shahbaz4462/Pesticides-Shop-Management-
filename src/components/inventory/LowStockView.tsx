import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Product } from '../../types';
import { AlertTriangle, PlusCircle, Check, X, Truck } from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const LowStockView: React.FC<Props> = ({ setActiveTab }) => {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  
  // Filter products below minimum stock alert
  const lowStockProducts = products.filter(p => p.stockQty <= p.minStockAlert);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addQty, setAddQty] = useState<number>(20);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && selectedProduct.id) {
      const newStock = selectedProduct.stockQty + addQty;
      await db.products.update(selectedProduct.id, {
        stockQty: newStock,
        updatedAt: new Date().toISOString()
      });

      await db.stockLogs.add({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        changeQty: addQty,
        type: 'ADD_STOCK',
        newQty: newStock,
        notes: `Restocked via Low Stock alert panel (+${addQty})`,
        timestamp: new Date().toISOString()
      });

      setSelectedProduct(null);
      setAddQty(20);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div 
        className="card-3d"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25), rgba(120, 53, 15, 0.4))',
          borderColor: 'var(--warning-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--warning-100)',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Low Stock & Out of Stock Alerts</h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Products below their configured minimum safety stock levels requiring immediate reordering.
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setActiveTab('purchases')}>
          <Truck size={18} />
          <span>Record Supplier Intake</span>
        </button>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-400)' }}>🎉 Stock Levels Are Healthy!</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            No products are currently at or below their minimum stock threshold.
          </p>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Alert Threshold</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => {
                const isOutOfStock = p.stockQty <= 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku || 'N/A'}</div>
                    </td>
                    <td>{p.brand}</td>
                    <td><span className="badge badge-success" style={{ textTransform: 'none' }}>{p.category}</span></td>
                    <td style={{ fontWeight: 800, fontSize: '1rem', color: isOutOfStock ? 'var(--danger-500)' : 'var(--warning-500)' }}>
                      {p.stockQty} {p.unit}s
                    </td>
                    <td>{p.minStockAlert} {p.unit}s</td>
                    <td>
                      <span className={`badge ${isOutOfStock ? 'badge-danger' : 'badge-warning'}`}>
                        {isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-primary" onClick={() => setSelectedProduct(p)} style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                        <PlusCircle size={14} />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Restock Modal */}
      {selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Restock Inventory</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setSelectedProduct(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateStock}>
              <div className="modal-body">
                <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
                  Restocking: <strong>{selectedProduct.name}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Current Stock</label>
                  <input type="text" className="form-input" disabled value={`${selectedProduct.stockQty} ${selectedProduct.unit}s`} />
                </div>
                <div className="form-group">
                  <label className="form-label">Add Stock Quantity</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    required 
                    value={addQty} 
                    onChange={e => setAddQty(parseInt(e.target.value) || 1)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} />
                  <span>Confirm Restock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
