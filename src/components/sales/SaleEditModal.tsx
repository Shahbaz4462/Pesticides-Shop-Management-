import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Sale, ShopSettings } from '../../types';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  settings?: ShopSettings;
  onSave: () => void;
}

export const SaleEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sale,
  settings,
  onSave
}) => {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  
  const [editedSale, setEditedSale] = useState<Partial<Sale>>({});
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  useEffect(() => {
    if (sale) {
      setEditedSale({
        ...sale,
        items: [...sale.items]
      });
    }
  }, [sale, isOpen]);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    setEditedSale(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          productId: product.id!,
          productName: product.name,
          unit: product.unit,
          qty: 1,
          purchasePrice: product.purchasePrice || 0,
          unitPrice: product.sellingPrice,
          subtotal: product.sellingPrice
        }
      ]
    }));
    setSelectedProductId('');
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    setEditedSale(prev => {
      const items = [...(prev.items || [])];
      const item = { ...items[index] };
      
      if (field === 'qty') {
        item.qty = parseInt(value) || 0;
        item.subtotal = item.qty * item.unitPrice;
      } else if (field === 'unitPrice') {
        item.unitPrice = parseFloat(value) || 0;
        item.subtotal = item.qty * item.unitPrice;
      } else {
        (item as any)[field] = value;
      }
      
      items[index] = item;
      
      // Recalculate totals
      const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
      const totalAmount = Math.max(0, subtotal - (prev.discount || 0));
      const dueAmount = Math.max(0, totalAmount - (prev.paidAmount || 0));
      
      return {
        ...prev,
        items,
        subtotal,
        totalAmount,
        dueAmount
      };
    });
  };

  const handleRemoveItem = (index: number) => {
    setEditedSale(prev => {
      const items = prev.items?.filter((_, i) => i !== index) || [];
      const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
      const totalAmount = Math.max(0, subtotal - (prev.discount || 0));
      const dueAmount = Math.max(0, totalAmount - (prev.paidAmount || 0));
      
      return {
        ...prev,
        items,
        subtotal,
        totalAmount,
        dueAmount
      };
    });
  };

  const handleSave = async () => {
    if (!sale || !editedSale.id) return;

    const now = new Date().toISOString();
    const changes: string[] = [];

    // Track changes for edit history
    if (editedSale.customerName !== sale.customerName) {
      changes.push(`Customer: ${sale.customerName} → ${editedSale.customerName}`);
      await db.saleEditHistory.add({
        saleId: sale.id!,
        billNumber: sale.billNumber,
        editedBy: settings?.activeUserName || 'Admin',
        editedAt: now,
        fieldChanged: 'customerName',
        previousValue: sale.customerName,
        newValue: editedSale.customerName || '',
        changeType: 'CUSTOMER_CHANGED'
      });
    }

    if (editedSale.discount !== sale.discount) {
      changes.push(`Discount: ${sale.discount} → ${editedSale.discount}`);
      await db.saleEditHistory.add({
        saleId: sale.id!,
        billNumber: sale.billNumber,
        editedBy: settings?.activeUserName || 'Admin',
        editedAt: now,
        fieldChanged: 'discount',
        previousValue: sale.discount.toString(),
        newValue: (editedSale.discount || 0).toString(),
        changeType: 'DISCOUNT_CHANGED'
      });
    }

    if (editedSale.paidAmount !== sale.paidAmount) {
      changes.push(`Paid Amount: ${sale.paidAmount} → ${editedSale.paidAmount}`);
      await db.saleEditHistory.add({
        saleId: sale.id!,
        billNumber: sale.billNumber,
        editedBy: settings?.activeUserName || 'Admin',
        editedAt: now,
        fieldChanged: 'paidAmount',
        previousValue: sale.paidAmount.toString(),
        newValue: (editedSale.paidAmount || 0).toString(),
        changeType: 'PAYMENT_CHANGED'
      });
    }

    // Check for item changes
    const originalItems = sale.items;
    const newItems = editedSale.items || [];
    
    // Added items
    newItems.forEach((newItem) => {
      const originalItem = originalItems.find(oi => oi.productId === newItem.productId);
      if (!originalItem) {
        changes.push(`Added: ${newItem.productName} (Qty: ${newItem.qty})`);
        db.saleEditHistory.add({
          saleId: sale.id!,
          billNumber: sale.billNumber,
          editedBy: settings?.activeUserName || 'Admin',
          editedAt: now,
          fieldChanged: 'item_added',
          previousValue: '',
          newValue: `${newItem.productName} - Qty: ${newItem.qty}, Price: ${newItem.unitPrice}`,
          changeType: 'ITEM_ADDED'
        });
      }
    });

    // Removed items
    originalItems.forEach(originalItem => {
      const newItem = newItems.find(ni => ni.productId === originalItem.productId);
      if (!newItem) {
        changes.push(`Removed: ${originalItem.productName}`);
        db.saleEditHistory.add({
          saleId: sale.id!,
          billNumber: sale.billNumber,
          editedBy: settings?.activeUserName || 'Admin',
          editedAt: now,
          fieldChanged: 'item_removed',
          previousValue: `${originalItem.productName} - Qty: ${originalItem.qty}, Price: ${originalItem.unitPrice}`,
          newValue: '',
          changeType: 'ITEM_REMOVED'
        });
      }
    });

    // Modified items
    newItems.forEach(newItem => {
      const originalItem = originalItems.find(oi => oi.productId === newItem.productId);
      if (originalItem && (originalItem.qty !== newItem.qty || originalItem.unitPrice !== newItem.unitPrice)) {
        changes.push(`Modified: ${newItem.productName}`);
        db.saleEditHistory.add({
          saleId: sale.id!,
          billNumber: sale.billNumber,
          editedBy: settings?.activeUserName || 'Admin',
          editedAt: now,
          fieldChanged: 'item_modified',
          previousValue: `${originalItem.productName} - Qty: ${originalItem.qty}, Price: ${originalItem.unitPrice}`,
          newValue: `${newItem.productName} - Qty: ${newItem.qty}, Price: ${newItem.unitPrice}`,
          changeType: 'ITEM_MODIFIED'
        });
      }
    });

    // Update the sale
    await db.sales.update(sale.id!, {
      ...editedSale,
      updatedAt: now
    });

    onSave();
    onClose();
  };

  if (!isOpen || !sale) return null;

  const items = editedSale.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = Math.max(0, subtotal - (editedSale.discount || 0));
  const dueAmount = Math.max(0, totalAmount - (editedSale.paidAmount || 0));

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            Edit Sale: {sale.billNumber}
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto' }}>
          {/* Customer Information */}
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              value={editedSale.customerName || ''}
              onChange={e => setEditedSale({ ...editedSale, customerName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Customer Phone</label>
            <input
              type="text"
              className="form-input"
              value={editedSale.customerPhone || ''}
              onChange={e => setEditedSale({ ...editedSale, customerPhone: e.target.value })}
            />
          </div>

          {/* Items Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <select
                className="form-select"
                style={{ flex: 1 }}
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
              >
                <option value="">Select product to add...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatPKR(p.sellingPrice)} ({p.stockQty} in stock)
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={handleAddItem}
                disabled={!selectedProductId}
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Items Table */}
            <div className="responsive-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: '60px', padding: '4px' }}
                          min="1"
                          value={item.qty}
                          onChange={e => handleUpdateItem(index, 'qty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: '80px', padding: '4px' }}
                          min="0"
                          value={item.unitPrice}
                          onChange={e => handleUpdateItem(index, 'unitPrice', e.target.value)}
                        />
                      </td>
                      <td>{formatPKR(item.subtotal)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleRemoveItem(index)}
                          style={{ minHeight: '32px', width: '32px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Discount (Rs.)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={editedSale.discount || 0}
                onChange={e => {
                  const discount = parseFloat(e.target.value) || 0;
                  setEditedSale({
                    ...editedSale,
                    discount,
                    totalAmount: Math.max(0, subtotal - discount),
                    dueAmount: Math.max(0, Math.max(0, subtotal - discount) - (editedSale.paidAmount || 0))
                  });
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Paid Amount (Rs.)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={editedSale.paidAmount || 0}
                onChange={e => {
                  const paidAmount = parseFloat(e.target.value) || 0;
                  setEditedSale({
                    ...editedSale,
                    paidAmount,
                    dueAmount: Math.max(0, totalAmount - paidAmount)
                  });
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={editedSale.paymentMethod}
                onChange={e => setEditedSale({ ...editedSale, paymentMethod: e.target.value as any })}
              >
                <option value="CASH">Cash</option>
                <option value="JAZZCASH">JazzCash</option>
                <option value="EASYPAISA">EasyPaisa</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UDHAR_CREDIT">Udhar/Credit</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div 
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal:</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Discount:</span>
              <span>-{formatPKR(editedSale.discount || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 800 }}>
              <span>Total:</span>
              <span>{formatPKR(totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Paid:</span>
              <span>{formatPKR(editedSale.paidAmount || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: dueAmount > 0 ? 'var(--warning-500)' : 'var(--emerald-500)' }}>
              <span>Due:</span>
              <span>{formatPKR(dueAmount)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};