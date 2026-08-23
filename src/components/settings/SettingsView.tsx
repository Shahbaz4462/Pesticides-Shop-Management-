import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialDataIfEmpty } from '../../db/database';
import type { ShopSettings } from '../../types';
import { exportDatabaseBackup, restoreDatabaseBackup } from '../../utils/formatters';
import { Save, Download, Upload, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const currentSettings = settingsList[0];

  const [formData, setFormData] = useState<Partial<ShopSettings>>({
    shopName: '',
    tagline: '',
    phone: '',
    address: '',
    city: 'Vehari',
    ntn: '',
    invoiceNote: '',
    enable3DEffects: true,
    invoiceHeader: '',
    invoiceFooter: '',
    taxInfo: '',
    billWidth: '80mm'
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentSettings) {
      setFormData(currentSettings);
    }
  }, [currentSettings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentSettings && currentSettings.id) {
        await db.settings.update(currentSettings.id, formData);
      } else {
        await db.settings.add(formData as ShopSettings);
      }
      setSuccessMsg('Shop settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error updating settings: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    const jsonStr = await exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kisan_Dost_Pesticide_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (confirm('CAUTION: Restoring backup will overwrite existing database records! Continue?')) {
          const success = await restoreDatabaseBackup(content);
          if (success) {
            alert('Database restored successfully!');
            window.location.reload();
          } else {
            alert('Failed to restore backup file. Invalid format.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset to Sample Data
  const handleResetSampleData = async () => {
    if (confirm('Reset database and seed initial Pakistani Pesticide Shop sample data?')) {
      await db.products.clear();
      await db.customers.clear();
      await db.suppliers.clear();
      await db.sales.clear();
      await db.purchases.clear();
      await db.stockLogs.clear();
      await db.settings.clear();

      await seedInitialDataIfEmpty();
      alert('Sample data re-seeded successfully!');
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div 
        className="card-3d"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Shop Profile & Data Management</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Configure shop receipt info, thermal print settings, and local database backup/restore
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--emerald-100)', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} className="card-3d" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Shop Profile Details</h3>

          <div className="form-group">
            <label className="form-label">Shop Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.shopName || ''} 
              onChange={e => setFormData({ ...formData, shopName: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tagline / Business Slogan</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.tagline || ''} 
              onChange={e => setFormData({ ...formData, tagline: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.phone || ''} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Shop Address</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.address || ''} 
              onChange={e => setFormData({ ...formData, address: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.city || ''} 
              onChange={e => setFormData({ ...formData, city: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">NTN / Registration Number</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.ntn || ''} 
              onChange={e => setFormData({ ...formData, ntn: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Footer Terms & Conditions</label>
            <textarea 
              className="form-textarea" 
              rows={2} 
              value={formData.invoiceNote || ''} 
              onChange={e => setFormData({ ...formData, invoiceNote: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Header (Additional)</label>
            <textarea 
              className="form-textarea" 
              rows={2} 
              value={formData.invoiceHeader || ''} 
              onChange={e => setFormData({ ...formData, invoiceHeader: e.target.value })} 
              placeholder="Additional header text for invoices"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Footer (Additional)</label>
            <textarea 
              className="form-textarea" 
              rows={2} 
              value={formData.invoiceFooter || ''} 
              onChange={e => setFormData({ ...formData, invoiceFooter: e.target.value })} 
              placeholder="Additional footer text for invoices"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tax Information</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.taxInfo || ''} 
              onChange={e => setFormData({ ...formData, taxInfo: e.target.value })} 
              placeholder="e.g., Tax Number: 123456789"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bill Width Format</label>
            <select 
              className="form-select"
              value={formData.billWidth || '80mm'}
              onChange={e => setFormData({ ...formData, billWidth: e.target.value as any })}
            >
              <option value="58mm">58mm Thermal Receipt</option>
              <option value="80mm">80mm Thermal Receipt</option>
              <option value="A4">A4 Invoice Format</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            <Save size={18} />
            <span>Save Profile Settings</span>
          </button>
        </form>

        {/* Data Backup & Restore Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-3d" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '10px' }}>Data Safety & Export Backup</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Export all products, sales bills, customer ledgers, and supplier records into a local JSON backup file.
            </p>

            <button className="btn btn-primary" onClick={handleExportBackup} style={{ width: '100%', marginBottom: '14px' }}>
              <Download size={18} />
              <span>Export Full Database Backup</span>
            </button>

            <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer' }}>
              <Upload size={18} />
              <span>Restore Backup from File</span>
              <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="card-3d" style={{ padding: '24px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-500)', marginBottom: '8px' }}>
              <ShieldAlert size={20} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Demo Data Reset</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Re-seed database with default realistic Pakistani pesticide products (Chlorpyrifos, Bayer, Syngenta, DAP, Urea).
            </p>

            <button className="btn btn-danger" onClick={handleResetSampleData} style={{ width: '100%' }}>
              <RefreshCw size={16} />
              <span>Reset & Re-Seed Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
