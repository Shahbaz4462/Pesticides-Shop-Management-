import React, { useState, useEffect } from 'react';
import type { Product, ProductCategory, ProductFormulation, ProductUnit } from '../../types';
import { X, Upload, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { compressImage, validateImageFile } from '../../utils/imageCompression';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  editingProduct?: Product | null;
}

const CATEGORIES: ProductCategory[] = [
  'Insecticide', 'Fungicide', 'Herbicide', 'Fertilizer', 'Seeds', 'Micro-Nutrient', 'Pesticide Spray Gear', 'Other'
];

const FORMULATIONS: ProductFormulation[] = ['EC', 'SC', 'WDG', 'SL', 'Granules', 'Powder', 'Liquid', 'N/A'];

const UNITS: ProductUnit[] = ['Liter', 'Bottle', 'Pack', 'Kg', 'Bag', 'Gram', 'Ml', 'Piece'];

export const ProductModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: 'Insecticide',
    formulation: 'EC',
    unit: 'Liter',
    purchasePrice: 0,
    sellingPrice: 0,
    stockQty: 0,
    minStockAlert: 10,
    expiryDate: '',
    batchNo: '',
    sku: '',
    image: '',
    description: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
      setImagePreview(editingProduct.image || '');
    } else {
      setFormData({
        name: '',
        brand: 'Syngenta',
        category: 'Insecticide',
        formulation: 'EC',
        unit: 'Liter',
        purchasePrice: 0,
        sellingPrice: 0,
        stockQty: 0,
        minStockAlert: 10,
        expiryDate: '',
        batchNo: '',
        sku: '',
        image: '',
        description: ''
      });
      setImagePreview('');
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      try {
        setImageUploading(true);
        const compressedBase64 = await compressImage(file, 400, 400, 0.7);
        setImagePreview(compressedBase64);
        setFormData(prev => ({ ...prev, image: compressedBase64 }));
      } catch (error) {
        alert('Failed to process image. Please try a different file.');
        console.error('Image compression error:', error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.sellingPrice === undefined) {
      alert('Please fill in required fields (Product Name & Selling Price)');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      alert('Error saving product: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {editingProduct ? 'Edit Product' : 'Add New Agricultural Product'}
          </h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {/* Image Upload Row */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '12px',
                  border: '2px dashed var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <ImageIcon size={32} color="var(--text-muted)" />
                )}
              </div>

              <div>
                <label className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer', opacity: imageUploading ? 0.6 : 1 }}>
                  <Upload size={16} />
                  <span>{imageUploading ? 'Processing...' : 'Upload Product Image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} style={{ display: 'none' }} />
                </label>
                {imagePreview && (
                  <button type="button" className="btn btn-secondary" onClick={handleRemoveImage} style={{ marginLeft: '8px', padding: '8px', color: 'var(--danger-500)' }} disabled={imageUploading}>
                    <Trash2 size={16} />
                  </button>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Optional product photo / bottle label preview (Auto-compressed to save storage).
                </p>
              </div>
            </div>

            {/* Grid 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="e.g. Chlorpyrifos 40% EC"
                  value={formData.name || ''} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand / Manufacturer</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Bayer, Syngenta, FMC, Engro"
                  value={formData.brand || ''} 
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select 
                  className="form-select"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Formulation Type</label>
                <select 
                  className="form-select"
                  value={formData.formulation}
                  onChange={e => setFormData({ ...formData, formulation: e.target.value as ProductFormulation })}
                >
                  {FORMULATIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <select 
                  className="form-select"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">SKU / Barcode</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. INS-CHP-1L"
                  value={formData.sku || ''} 
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Cost (Rs.)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="0"
                  placeholder="1850"
                  value={formData.purchasePrice ?? 0} 
                  onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Retail Selling Price (Rs.) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  min="0"
                  placeholder="2200"
                  value={formData.sellingPrice ?? 0} 
                  onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock Qty</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="0"
                  placeholder="50"
                  value={formData.stockQty ?? 0} 
                  onChange={e => setFormData({ ...formData, stockQty: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min Stock Alert Level</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1"
                  placeholder="10"
                  value={formData.minStockAlert ?? 10} 
                  onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 10 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.expiryDate || ''} 
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. BATCH-2026-A"
                  value={formData.batchNo || ''} 
                  onChange={e => setFormData({ ...formData, batchNo: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label className="form-label">Product Notes / Application Guidance</label>
              <textarea 
                className="form-textarea" 
                rows={2}
                placeholder="e.g. Recommended dosage: 500ml per acre for cotton bollworm spray."
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Product Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
