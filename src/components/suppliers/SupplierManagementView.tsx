import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Supplier, ShopSettings } from '../../types';
import { SupplierModal } from './SupplierModal';
import { SupplierDetailsView } from './SupplierDetailsView';
import { Building2, Plus, Search, Edit2, Trash2, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';

interface Props {
  settings?: ShopSettings;
}

export const SupplierManagementView: React.FC<Props> = ({ settings }) => {
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);

  // Clear Payable Balance Modal
  const [paySupplier, setPaySupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number>(50000);

  const filteredSuppliers = suppliers.filter(s => 
    s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveSupplier = async (data: Partial<Supplier>) => {
    const now = new Date().toISOString();
    if (editingSupplier && editingSupplier.id) {
      await db.suppliers.update(editingSupplier.id, {
        ...data,
        updatedAt: now
      });
    } else {
      await db.suppliers.add({
        ...data as Supplier,
        createdAt: now,
        updatedAt: now
      });
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (confirm('Delete this supplier profile?')) {
      await db.suppliers.delete(id);
    }
  };

  const handlePaySupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paySupplier && paySupplier.id) {
      const currentPayable = paySupplier.outstandingBalance || 0;
      const newPayable = Math.max(0, currentPayable - payAmount);
      await db.suppliers.update(paySupplier.id, {
        outstandingBalance: newPayable,
        updatedAt: new Date().toISOString()
      });

      setPaySupplier(null);
      setPayAmount(50000);
    }
  };

  // Show supplier details view if a supplier is selected
  if (selectedSupplierId) {
    return (
      <SupplierDetailsView 
        supplierId={selectedSupplierId} 
        onBack={() => setSelectedSupplierId(null)}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Pesticide Suppliers & Companies</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Manage chemical company distributors and company payable debt ledgers
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
        >
          <Plus size={20} />
          <span>Register New Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search company, contact person..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {/* Table */}
      {filteredSuppliers.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Building2 size={48} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Suppliers Found</h3>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Company / Brand</th>
                <th>Contact Representative</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Payable Balance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(s => {
                const hasPayable = (s.outstandingBalance || 0) > 0;
                return (
                  <tr 
                    key={s.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedSupplierId(s.id!)}
                  >
                    <td style={{ fontWeight: 800, color: 'var(--primary-300)' }}>
                      {s.company}
                    </td>
                    <td>{s.name}</td>
                    <td>{s.phone}</td>
                    <td>{s.address || 'N/A'}</td>
                    <td style={{ fontWeight: 800, color: hasPayable ? 'var(--danger-500)' : 'var(--emerald-500)' }}>
                      {formatPKR(s.outstandingBalance || 0)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={(e) => { e.stopPropagation(); setSelectedSupplierId(s.id!); }}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          View Details
                        </button>
                        {hasPayable && (
                          <button 
                            className="btn btn-secondary" 
                            onClick={(e) => { e.stopPropagation(); setPaySupplier(s); }}
                            style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: '32px' }}
                          >
                            <DollarSign size={14} color="var(--primary-400)" /> Pay Company
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary btn-icon" 
                          onClick={(e) => { e.stopPropagation(); setEditingSupplier(s); setIsModalOpen(true); }} 
                          style={{ minHeight: '32px', width: '32px' }}
                        >
                          <Edit2 size={15} color="var(--info-500)" />
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(s.id!); }} 
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

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSupplier}
        editingSupplier={editingSupplier}
      />

      {/* Pay Supplier Modal */}
      {paySupplier && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Clear Supplier Debt Payment</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setPaySupplier(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePaySupplierSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
                  Company: <strong>{paySupplier.company}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Current Outstanding Payable</label>
                  <input type="text" className="form-input" disabled value={formatPKR(paySupplier.outstandingBalance || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Amount Paid (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    max={paySupplier.outstandingBalance}
                    required 
                    value={payAmount} 
                    onChange={e => setPayAmount(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPaySupplier(null)}>Cancel</button>
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
