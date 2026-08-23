import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Customer, ShopSettings } from '../../types';
import { CustomerModal } from './CustomerModal';
import { CustomerDetailsView } from './CustomerDetailsView';
import { Users, Plus, Search, DollarSign, Edit2, Trash2, CheckCircle2, X } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';

interface Props {
  settings?: ShopSettings;
}

export const CustomerManagementView: React.FC<Props> = ({ settings }) => {
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Udhar Payment Collection Modal
  const [payCustomer, setPayCustomer] = useState<Customer | null>(null);
  const [recAmount, setRecAmount] = useState<number>(1000);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveCustomer = async (data: Partial<Customer>) => {
    const now = new Date().toISOString();
    if (editingCustomer && editingCustomer.id) {
      await db.customers.update(editingCustomer.id, {
        ...data,
        updatedAt: now
      });
    } else {
      await db.customers.add({
        ...data as Customer,
        createdAt: now,
        updatedAt: now
      });
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm('Delete this customer record?')) {
      await db.customers.delete(id);
    }
  };

  const handleReceivePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payCustomer && payCustomer.id) {
      const currentBal = payCustomer.outstandingBalance || 0;
      const newBal = Math.max(0, currentBal - recAmount);
      await db.customers.update(payCustomer.id, {
        outstandingBalance: newBal,
        updatedAt: new Date().toISOString()
      });

      setPayCustomer(null);
      setRecAmount(1000);
    }
  };

  // Show customer details view if a customer is selected
  if (selectedCustomerId) {
    return (
      <CustomerDetailsView 
        customerId={selectedCustomerId} 
        onBack={() => setSelectedCustomerId(null)}
        settings={settings}
      />
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Farmers & Customers Directory</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Manage farmer profiles and credit (Udhar) ledgers
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
        >
          <Plus size={20} />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search farmer name, phone, village..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {/* Grid or Table */}
      {filteredCustomers.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Customers Found</h3>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer / Farmer Name</th>
                <th>Phone Number</th>
                <th>Village / Address</th>
                <th>City</th>
                <th>Udhar / Credit Balance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => {
                const hasBalance = (c.outstandingBalance || 0) > 0;
                return (
                  <tr 
                    key={c.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCustomerId(c.id!)}
                  >
                    <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {c.name}
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.address || 'N/A'}</td>
                    <td>{c.city || 'Vehari'}</td>
                    <td style={{ fontWeight: 800, color: hasBalance ? 'var(--warning-500)' : 'var(--emerald-500)' }}>
                      {formatPKR(c.outstandingBalance || 0)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={(e) => { e.stopPropagation(); setSelectedCustomerId(c.id!); }}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          View Details
                        </button>
                        {hasBalance && (
                          <button 
                            className="btn btn-warning" 
                            onClick={(e) => { e.stopPropagation(); setPayCustomer(c); }}
                            style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: '32px' }}
                          >
                            <DollarSign size={14} /> Receive Udhar
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary btn-icon" 
                          onClick={(e) => { e.stopPropagation(); setEditingCustomer(c); setIsModalOpen(true); }} 
                          style={{ minHeight: '32px', width: '32px' }}
                        >
                          <Edit2 size={15} color="var(--info-500)" />
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c.id!); }} 
                          style={{ minHeight: '32px', width: '32px' }}
                        >
                          <Trash2 size={15} color="var(--danger-500)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        editingCustomer={editingCustomer}
      />

      {/* Receive Payment Modal */}
      {payCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Receive Farmer Udhar Payment</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setPayCustomer(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReceivePayment}>
              <div className="modal-body">
                <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
                  Farmer: <strong>{payCustomer.name}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Current Outstanding Udhar</label>
                  <input type="text" className="form-input" disabled value={formatPKR(payCustomer.outstandingBalance || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount Received (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    max={payCustomer.outstandingBalance}
                    required 
                    value={recAmount} 
                    onChange={e => setRecAmount(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPayCustomer(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={18} />
                  <span>Deduct Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
