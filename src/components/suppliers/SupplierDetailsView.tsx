import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { ShopSettings } from '../../types';
import { ArrowLeft, Building2, Phone, MapPin, Calendar, DollarSign, Package, Truck, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { formatPKR, formatDateTime } from '../../utils/formatters';

interface Props {
  supplierId: number;
  onBack: () => void;
  settings?: ShopSettings;
}

export const SupplierDetailsView: React.FC<Props> = ({ supplierId, onBack }) => {
  const supplier = useLiveQuery(() => db.suppliers.get(supplierId), [supplierId]);
  const purchases = useLiveQuery(() => db.purchases.where('supplierId').equals(supplierId).toArray(), [supplierId]) || [];
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(10000);
  const [paymentComment, setPaymentComment] = useState('');

  if (!supplier) {
    return (
      <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Building2 size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Supplier Not Found</h3>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '16px' }}>
          Back to Supplier List
        </button>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentBal = supplier.outstandingBalance || 0;
    const newBal = Math.max(0, currentBal - paymentAmount);
    
    await db.suppliers.update(supplierId, {
      outstandingBalance: newBal,
      updatedAt: new Date().toISOString()
    });

    setShowPaymentModal(false);
    setPaymentAmount(10000);
    setPaymentComment('');
  };

  // Calculate financial summary
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const totalPaid = purchases.reduce((sum, purchase) => sum + purchase.paidAmount, 0);
  const totalDue = supplier.outstandingBalance || 0;

  // Sort purchases by date (newest first)
  const sortedPurchases = [...purchases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Back Button */}
      <button 
        className="btn btn-secondary"
        onClick={onBack}
        style={{ alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={18} />
        <span>Back to Supplier List</span>
      </button>

      {/* Supplier Information Card */}
      <div className="card-3d" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {supplier.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {supplier.company} • Supplier ID: #{supplier.id}
            </p>
          </div>
          {(supplier.outstandingBalance || 0) > 0 && (
            <button 
              className="btn btn-warning"
              onClick={() => setShowPaymentModal(true)}
            >
              <DollarSign size={18} />
              <span>Make Payment</span>
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Phone
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 700 }}>{supplier.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Address
            </p>
            <p style={{ fontSize: '1rem' }}>{supplier.address || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Supplier Since
            </p>
            <p style={{ fontSize: '1rem' }}>{formatDateTime(supplier.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card-3d" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Purchases</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-400)', marginTop: '4px' }}>
            {formatPKR(totalPurchases)}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{purchases.length} transactions</span>
        </div>

        <div className="card-3d" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Paid</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--emerald-500)', marginTop: '4px' }}>
            {formatPKR(totalPaid)}
          </div>
        </div>

        <div className="card-3d" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Outstanding Balance</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: totalDue > 0 ? 'var(--warning-500)' : 'var(--emerald-500)', marginTop: '4px' }}>
            {formatPKR(totalDue)}
          </div>
          <span style={{ fontSize: '0.78rem', color: totalDue > 0 ? 'var(--warning-500)' : 'var(--emerald-500)', fontWeight: 700 }}>
            {totalDue > 0 ? 'Due Amount' : 'Clear'}
          </span>
        </div>
      </div>

      {/* Purchase History */}
      <div className="card-3d" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={20} color="var(--primary-400)" />
          Purchase History
        </h3>

        {sortedPurchases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Package size={32} style={{ marginBottom: '8px' }} />
            <p>No purchase history found</p>
          </div>
        ) : (
          <div className="responsive-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Purchase Number</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary-400)' }}>
                      {purchase.purchaseNumber}
                    </td>
                    <td>{formatDateTime(purchase.createdAt)}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {purchase.items.slice(0, 2).map(item => item.productName).join(', ')}
                        {purchase.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800 }}>{formatPKR(purchase.totalAmount)}</td>
                    <td style={{ color: 'var(--emerald-500)', fontWeight: 700 }}>
                      {formatPKR(purchase.paidAmount)}
                    </td>
                    <td style={{ color: (purchase.totalAmount - purchase.paidAmount) > 0 ? 'var(--warning-500)' : 'var(--emerald-500)', fontWeight: 700 }}>
                      {formatPKR(purchase.totalAmount - purchase.paidAmount)}
                    </td>
                    <td>
                      {(purchase.totalAmount - purchase.paidAmount) > 0 ? (
                        <span className="badge badge-warning">
                          <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Due
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Make Payment</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
                  Supplier: <strong>{supplier.name}</strong> ({supplier.company})
                </p>
                <div className="form-group">
                  <label className="form-label">Current Outstanding Balance</label>
                  <input type="text" className="form-input" disabled value={formatPKR(supplier.outstandingBalance || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Amount (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    max={supplier.outstandingBalance}
                    required 
                    value={paymentAmount} 
                    onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Comment / Note</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    value={paymentComment}
                    onChange={e => setPaymentComment(e.target.value)}
                    placeholder="e.g., Partial payment for August purchases"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <DollarSign size={18} />
                  <span>Process Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};