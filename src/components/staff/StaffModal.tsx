import React, { useState, useEffect } from 'react';
import type { Staff } from '../../types';
import { X, User, Phone, Shield, Key, MapPin, Calendar, DollarSign } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Staff>) => void;
  editingStaff: Staff | null;
}

export const StaffModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingStaff
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    role: 'SALES' as Staff['role'],
    username: '',
    password: '',
    salary: 0,
    joiningDate: ''
  });

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        name: editingStaff.name,
        phone: editingStaff.phone,
        address: editingStaff.address || '',
        role: editingStaff.role,
        username: editingStaff.username,
        password: editingStaff.password,
        salary: editingStaff.salary || 0,
        joiningDate: editingStaff.joiningDate || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        role: 'SALES',
        username: '',
        password: '',
        salary: 0,
        joiningDate: ''
      });
    }
  }, [editingStaff, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                <User size={14} />
                Full Name
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Muhammad Ali"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={14} />
                Phone Number
              </label>
              <input
                type="tel"
                className="form-input"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., 0300-1234567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} />
                Address
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., House 123, Street 4, Vehari"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Shield size={14} />
                Role
              </label>
              <select
                className="form-select"
                required
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as Staff['role'] })}
              >
                <option value="SALES">Sales Staff</option>
                <option value="WAREHOUSE">Warehouse Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN_ASSISTANT">Admin Assistant</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Key size={14} />
                Username (for login)
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g., muhammad_ali"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Key size={14} />
                Password
              </label>
              <input
                type="password"
                className="form-input"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <DollarSign size={14} />
                Monthly Salary (Rs.)
              </label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.salary}
                onChange={e => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 25000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                Joining Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.joiningDate}
                onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingStaff ? 'Update Staff' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};