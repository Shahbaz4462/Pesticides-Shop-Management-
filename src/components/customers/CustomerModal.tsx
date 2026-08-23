import React, { useState, useEffect } from 'react';
import type { Customer } from '../../types';
import { X, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => Promise<void>;
  editingCustomer?: Customer | null;
}

export const CustomerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingCustomer
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    address: '',
    city: 'Vehari',
    outstandingBalance: 0
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData(editingCustomer);
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: 'Vehari',
        outstandingBalance: 0
      });
    }
  }, [editingCustomer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in required Customer Name and Phone Number.');
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
            {editingCustomer ? 'Edit Customer Record' : 'Register New Farmer / Customer'}
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Customer / Farmer Name *</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="e.g. Malik Zahid Hussain" 
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
                placeholder="e.g. 0300-1234567" 
                value={formData.phone || ''} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Village / Chak / Address</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Chak 114/WB" 
                value={formData.address || ''} 
                onChange={e => setFormData({ ...formData, address: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tehsil / City</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Vehari" 
                value={formData.city || ''} 
                onChange={e => setFormData({ ...formData, city: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Udhar / Credit Balance (Rs.)</label>
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
              <span>Save Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
