import React, { useState, useEffect } from 'react';
import type { Supplier } from '../../types';
import { X, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => Promise<void>;
  editingSupplier?: Supplier | null;
}

export const SupplierModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingSupplier
}) => {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    company: '',
    phone: '',
    address: '',
    outstandingBalance: 0
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData(editingSupplier);
    } else {
      setFormData({
        name: '',
        company: 'Syngenta Pakistan',
        phone: '',
        address: '',
        outstandingBalance: 0
      });
    }
  }, [editingSupplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) {
      alert('Please fill in required Representative Name and Company Name.');
      return;
    }

    await onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            {editingSupplier ? 'Edit Supplier Record' : 'Register New Pesticide Supplier'}
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Company / Manufacturer Name *</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="e.g. Bayer CropScience, Syngenta, FMC, Engro" 
                value={formData.company || ''} 
                onChange={e => setFormData({ ...formData, company: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Representative / Contact Person Name *</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="e.g. Tariq Mehmood" 
                value={formData.name || ''} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="e.g. 0300-8654321" 
                value={formData.phone || ''} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Depot Address / Region</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Industrial Estate, Multan" 
                value={formData.address || ''} 
                onChange={e => setFormData({ ...formData, address: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Payable Balance (Rs.)</label>
              <input 
                type="number" 
                className="form-input" 
                min="0" 
                placeholder="0" 
                value={formData.outstandingBalance ?? 0} 
                onChange={e => setFormData({ ...formData, outstandingBalance: parseFloat(e.target.value) || 0 })} 
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              <span>Save Supplier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
