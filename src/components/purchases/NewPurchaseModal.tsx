import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Purchase, PurchaseItem } from '../../types';
import { X, Plus, Trash2, Check, Truck } from 'lucide-react';
import { formatPKR, generatePurchaseNumber } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPurchaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [notes] = useState('');

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [purchaseQty, setPurchaseQty] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(1000);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === parseInt(selectedProductId));
    if (!prod) return;

    setItems(prev => [
      ...prev,
      {
        productId: prod.id!,
        productName: prod.name,
        qty: purchaseQty,
        purchasePrice: unitCost,
        total: purchaseQty * unitCost
      }
    ]);

    setSelectedProductId('');
    setPurchaseQty(10);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || items.length === 0) {
      alert('Please select a supplier and add at least one product.');
      return;
    }

    const supplier = suppliers.find(s => s.id === parseInt(selectedSupplierId));
    if (!supplier) return;

    const purNo = await generatePurchaseNumber();
    const now = new Date().toISOString();

    const purchaseRecord: Purchase = {
      purchaseNumber: purNo,
      supplierId: supplier.id,
      supplierName: `${supplier.company} (${supplier.name})`,
      invoiceNo,
      items,
      totalAmount,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      notes,
      createdAt: now
    };

    // Execute atomic Dexie Transaction: Add Purchase + Increase Stock Qty + Update Supplier Balance
    await db.transaction('rw', [db.purchases, db.products, db.suppliers, db.stockLogs], async () => {
      await db.purchases.add(purchaseRecord);

      // 1. Increase product stock
      for (const item of items) {
        const prod = await db.products.get(item.productId);
        if (prod) {
          const newQty = prod.stockQty + item.qty;
          await db.products.update(prod.id!, {
            stockQty: newQty,
            purchasePrice: item.purchasePrice, // update cost price reference
            updatedAt: now
          });

          await db.stockLogs.add({
            productId: prod.id!,
            productName: prod.name,
            changeQty: item.qty,
            type: 'PURCHASE',
            newQty,
            notes: `Intake from Supplier: ${supplier.company}`,
            timestamp: now
          });
        }
      }

      // 2. Increase Supplier Payable Outstanding Balance
      const newPayable = (supplier.outstandingBalance || 0) + totalAmount;
      await db.suppliers.update(supplier.id!, {
        outstandingBalance: newPayable,
        updatedAt: now
      });
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={22} color="var(--primary-400)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Record Supplier Stock Purchase</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Supplier / Company *</label>
                <select 
                  className="form-select" 
                  required
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.company} ({s.name})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Supplier Invoice Ref #</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. BAY-99412"
                  value={invoiceNo}
                  onChange={e => setInvoiceNo(e.target.value)}
                />
              </div>
            </div>

            {/* Add Item Row */}
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Add Products to Purchase Batch</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Product</label>
                  <select 
                    className="form-select"
                    value={selectedProductId}
                    onChange={e => {
                      setSelectedProductId(e.target.value);
                      const prod = products.find(p => p.id === parseInt(e.target.value));
                      if (prod) setUnitCost(prod.purchasePrice || 1000);
                    }}
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty Intake</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    value={purchaseQty} 
                    onChange={e => setPurchaseQty(parseInt(e.target.value) || 1)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unit Cost (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="0" 
                    value={unitCost} 
                    onChange={e => setUnitCost(parseFloat(e.target.value) || 0)} 
                  />
                </div>

                <button type="button" className="btn btn-primary" onClick={handleAddItem} style={{ height: '44px' }}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Added Items List */}
            {items.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Cost</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{it.productName}</td>
                        <td>{it.qty}</td>
                        <td>{formatPKR(it.purchasePrice)}</td>
                        <td style={{ fontWeight: 800 }}>{formatPKR(it.total)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="btn btn-secondary btn-icon" onClick={() => handleRemoveItem(idx)}>
                            <Trash2 size={14} color="var(--danger-500)" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--primary-400)' }}>
              <span style={{ fontWeight: 800 }}>Total Purchase Batch Cost:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary-400)' }}>
                {formatPKR(totalAmount)}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Check size={18} />
              <span>Record Stock Intake</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
