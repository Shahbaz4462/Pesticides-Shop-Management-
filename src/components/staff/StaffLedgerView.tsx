import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Staff, ShopSettings } from '../../types';
import { Users, Search, DollarSign, Calendar, X } from 'lucide-react';
import { formatPKR, formatDateTime } from '../../utils/formatters';

interface Props {
  settings?: ShopSettings;
}

export const StaffLedgerView: React.FC<Props> = ({ settings }) => {
  const staff = useLiveQuery(() => db.staff.toArray(), []) || [];
  const staffPayments = useLiveQuery(() => db.staffPayments.toArray(), []) || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(5000);
  const [paymentComment, setPaymentComment] = useState('');

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff && selectedStaff.id) {
      const currentBal = selectedStaff.outstandingBalance || 0;
      const newBal = Math.max(0, currentBal - paymentAmount);
      
      await db.staff.update(selectedStaff.id, {
        outstandingBalance: newBal,
        updatedAt: new Date().toISOString()
      });

      await db.staffPayments.add({
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        amount: paymentAmount,
        paymentType: 'SALARY',
        comment: paymentComment,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      setShowPaymentModal(false);
      setPaymentAmount(5000);
      setPaymentComment('');
    }
  };

  const getStaffPayments = (staffId: number) => {
    return staffPayments
      .filter(p => p.staffId === staffId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Staff Ledger</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Staff payment history and salary management
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search staff name, phone, username..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {/* Staff List or Detail View */}
      {!selectedStaff ? (
        <>
          {filteredStaff.length === 0 ? (
            <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Users size={48} style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Staff Members Found</h3>
            </div>
          ) : (
            <div className="responsive-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Username</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Outstanding Balance</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map(s => (
                    <tr 
                      key={s.id} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedStaff(s)}
                    >
                      <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                        {s.name}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {s.username}
                      </td>
                      <td>{s.phone}</td>
                      <td>
                        <span 
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'var(--primary-100)',
                            color: '#047857'
                          }}
                        >
                          {s.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: (s.outstandingBalance || 0) > 0 ? 'var(--warning-500)' : 'var(--emerald-500)' }}>
                        {formatPKR(s.outstandingBalance || 0)}
                      </td>
                      <td>
                    <span 
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: s.isActive ? 'var(--emerald-100)' : 'var(--danger-100)',
                        color: s.isActive ? '#047857' : '#b91c1c'
                      }}
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={(e) => { e.stopPropagation(); setSelectedStaff(s); }}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* Staff Detail View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Back Button */}
          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedStaff(null)}
            style={{ alignSelf: 'flex-start' }}
          >
            ← Back to Staff List
          </button>

          {/* Staff Information Card */}
          <div className="card-3d" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedStaff.name}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedStaff.role} • {selectedStaff.username}
                </p>
              </div>
              {settings?.activeUserRole === 'ADMIN' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <DollarSign size={18} />
                  <span>Add Payment</span>
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Phone</p>
                <p style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedStaff.phone}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Address</p>
                <p style={{ fontSize: '1rem' }}>{selectedStaff.address || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Joining Date</p>
                <p style={{ fontSize: '1rem' }}>{selectedStaff.joiningDate ? formatDateTime(selectedStaff.joiningDate) : 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Salary</p>
                <p style={{ fontSize: '1rem', fontWeight: 700 }}>{formatPKR(selectedStaff.salary || 0)}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Outstanding Balance</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: (selectedStaff.outstandingBalance || 0) > 0 ? 'var(--warning-500)' : 'var(--emerald-500)' }}>
                  {formatPKR(selectedStaff.outstandingBalance || 0)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: selectedStaff.isActive ? 'var(--emerald-500)' : 'var(--danger-500)' }}>
                  {selectedStaff.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card-3d" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary-400)" />
              Payment History
            </h3>

            {getStaffPayments(selectedStaff.id!).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <DollarSign size={32} style={{ marginBottom: '8px' }} />
                <p>No payment history found</p>
              </div>
            ) : (
              <div className="responsive-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payment Type</th>
                      <th>Amount</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStaffPayments(selectedStaff.id!).map(payment => (
                      <tr key={payment.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="var(--text-muted)" />
                            <span style={{ fontWeight: 600 }}>{formatDateTime(payment.date)}</span>
                          </div>
                        </td>
                        <td>
                          <span 
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: 'var(--primary-100)',
                              color: '#047857'
                            }}
                          >
                            {payment.paymentType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--emerald-500)' }}>
                          {formatPKR(payment.amount)}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {payment.comment || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Add Payment</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
                  Staff: <strong>{selectedStaff.name}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Current Outstanding Balance</label>
                  <input type="text" className="form-input" disabled value={formatPKR(selectedStaff.outstandingBalance || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Amount (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
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
                    placeholder="e.g., Monthly salary for August 2026"
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