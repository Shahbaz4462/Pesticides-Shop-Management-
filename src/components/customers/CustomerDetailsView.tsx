import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { ShopSettings } from '../../types';
import { ArrowLeft, User, Phone, MapPin, Calendar, DollarSign, Package, Receipt, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { formatPKR, formatDateTime } from '../../utils/formatters';

interface Props {
  customerId: number;
  onBack: () => void;
  settings?: ShopSettings;
}

export const CustomerDetailsView: React.FC<Props> = ({ customerId, onBack }) => {
  const customer = useLiveQuery(() => db.customers.get(customerId), [customerId]);
  const sales = useLiveQuery(() => db.sales.where('customerId').equals(customerId).toArray(), [customerId]) || [];
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(1000);
  const [paymentComment, setPaymentComment] = useState('');

  if (!customer) {
    return (
      <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <User size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Customer Not Found</h3>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '16px' }}>
          Back to Customer List
        </button>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentBal = customer.outstandingBalance || 0;
    const newBal = Math.max(0, currentBal - paymentAmount);
    
    await db.customers.update(customerId, {
      outstandingBalance: newBal,
      updatedAt: new Date().toISOString()
    });

    setShowPaymentModal(false);
    setPaymentAmount(1000);
    setPaymentComment('');
  };

  // Calculate financial summary
  const totalPurchases = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPaid = sales.reduce((sum, sale) => sum + sale.paidAmount, 0);
  const totalDue = customer.outstandingBalance || 0;

  // Sort sales by date (newest first)
  const sortedSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Back Button */}
      <button 
        className="btn btn-secondary"
        onClick={onBack}
        style={{ alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={18} />
        <span>Back to Customer List</span>
      </button>

      {/* Customer Information Card */}
      <div className="card-3d" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {customer.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Customer ID: #{customer.id}
            </p>
          </div>
          {(customer.outstandingBalance || 0) > 0 && (
            <button 
              className="btn btn-warning"
              onClick={() => setShowPaymentModal(true)}
            >
              <DollarSign size={18} />
              <span>Receive Payment</span>
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Phone
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 700 }}>{customer.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Address
            </p>
            <p style={{ fontSize: '1rem' }}>{customer.address || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              City
            </p>
            <p style={{ fontSize: '1rem' }}>{customer.city || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Customer Since
            </p>
            <p style={{ fontSize: '1rem' }}>{formatDateTime(customer.createdAt)}</p>
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
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sales.length} transactions</span>
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
          <Package size={20} color="var(--primary-400)" />
          Purchase History
        </h3>

        {sortedSales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Receipt size={32} style={{ marginBottom: '8px' }} />
            <p>No purchase history found</p>
          </div>
        ) : (
          <div className="responsive-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedSales.map(sale => (
                  <tr key={sale.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary-400)' }}>
                      {sale.billNumber}
                    </td>
                    <td>{formatDateTime(sale.createdAt)}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {sale.items.slice(0, 2).map(item => item.productName).join(', ')}
                        {sale.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800 }}>{formatPKR(sale.totalAmount)}</td>
                    <td style={{ color: 'var(--emerald-500)', fontWeight: 700 }}>
                      {formatPKR(sale.paidAmount)}
                    </td>
                    <td style={{ color: sale.dueAmount > 0 ? 'var(--warning-500)' : 'var(--emerald-500)', fontWeight: 700 }}>
                      {formatPKR(sale.dueAmount)}
                    </td>
                    <td>
                      {sale.dueAmount > 0 ? (
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Receive Payment</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
                  Customer: <strong>{customer.name}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Current Outstanding Balance</label>
                  <input type="text" className="form-input" disabled value={formatPKR(customer.outstandingBalance || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Amount (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    max={customer.outstandingBalance}
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