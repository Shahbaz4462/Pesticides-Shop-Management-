import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Staff, ShopSettings } from '../../types';
import { StaffModal } from './StaffModal';
import { Users, Plus, Search, DollarSign, Edit2, Trash2, Shield, Lock, Unlock } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';

interface Props {
  settings?: ShopSettings;
}

export const StaffManagementView: React.FC<Props> = ({ settings }) => {
  const staff = useLiveQuery(() => db.staff.toArray(), []) || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Payment Modal
  const [payStaff, setPayStaff] = useState<Staff | null>(null);
  const [payAmount, setPayAmount] = useState<number>(5000);
  const [payComment, setPayComment] = useState('');

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveStaff = async (data: Partial<Staff>) => {
    const now = new Date().toISOString();
    if (editingStaff && editingStaff.id) {
      await db.staff.update(editingStaff.id, {
        ...data,
        updatedAt: now
      });
    } else {
      await db.staff.add({
        ...data as Staff,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        outstandingBalance: 0
      });
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (confirm('Delete this staff member? This will also remove their payment history.')) {
      await db.staff.delete(id);
      await db.staffPayments.where('staffId').equals(id).delete();
    }
  };

  const handleToggleActive = async (staffMember: Staff) => {
    if (staffMember.id) {
      await db.staff.update(staffMember.id, {
        isActive: !staffMember.isActive,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payStaff && payStaff.id) {
      const currentBal = payStaff.outstandingBalance || 0;
      const newBal = Math.max(0, currentBal - payAmount);
      
      await db.staff.update(payStaff.id, {
        outstandingBalance: newBal,
        updatedAt: new Date().toISOString()
      });

      await db.staffPayments.add({
        staffId: payStaff.id,
        staffName: payStaff.name,
        amount: payAmount,
        paymentType: 'SALARY',
        comment: payComment,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      setPayStaff(null);
      setPayAmount(5000);
      setPayComment('');
    }
  };

  // Only show for admin
  if (settings?.activeUserRole !== 'ADMIN') {
    return (
      <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Lock size={48} color="var(--danger-500)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Access Restricted</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Only administrators can access staff management.
        </p>
      </div>
    );
  }

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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Staff Management</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Manage staff members, roles, and salary payments
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
        >
          <Plus size={20} />
          <span>Add Staff Member</span>
        </button>
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

      {/* Staff Table */}
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
                <th>Status</th>
                <th>Outstanding Balance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(s => (
                <tr key={s.id}>
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
                  <td>
                    <span 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: s.isActive ? 'var(--emerald-100)' : 'var(--danger-100)',
                        color: s.isActive ? '#047857' : '#b91c1c'
                      }}
                    >
                      {s.isActive ? <Shield size={12} /> : <Lock size={12} />}
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: (s.outstandingBalance || 0) > 0 ? 'var(--warning-500)' : 'var(--emerald-500)' }}>
                    {formatPKR(s.outstandingBalance || 0)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {(s.outstandingBalance || 0) > 0 && (
                        <button 
                          className="btn btn-warning" 
                          onClick={() => setPayStaff(s)}
                          style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: '32px' }}
                        >
                          <DollarSign size={14} /> Pay
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary btn-icon" 
                        onClick={() => handleToggleActive(s)}
                        style={{ minHeight: '32px', width: '32px' }}
                        title={s.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {s.isActive ? <Lock size={15} color="var(--warning-500)" /> : <Unlock size={15} color="var(--emerald-500)" />}
                      </button>
                      <button 
                        className="btn btn-secondary btn-icon" 
                        onClick={() => { setEditingStaff(s); setIsModalOpen(true); }} 
                        style={{ minHeight: '32px', width: '32px' }}
                      >
                        <Edit2 size={15} color="var(--info-500)" />
                      </button>
                      <button 
                        className="btn btn-secondary btn-icon" 
                        onClick={() => handleDeleteStaff(s.id!)} 
                        style={{ minHeight: '32px', width: '32px' }}
                      >
                        <Trash2 size={15} color="var(--danger-500)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
        editingStaff={editingStaff}
      />

      {/* Payment Modal */}
      {payStaff && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Process Salary Payment</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setPayStaff(null)}>
                <Trash2 size={18} />
              </button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
                  Staff: <strong>{payStaff.name}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Current Outstanding Balance</label>
                  <input type="text" className="form-input" disabled value={formatPKR(payStaff.outstandingBalance || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Amount (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    required 
                    value={payAmount} 
                    onChange={e => setPayAmount(parseFloat(e.target.value) || 0)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Comment / Note</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    value={payComment}
                    onChange={e => setPayComment(e.target.value)}
                    placeholder="e.g., Monthly salary for August 2026"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPayStaff(null)}>Cancel</button>
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