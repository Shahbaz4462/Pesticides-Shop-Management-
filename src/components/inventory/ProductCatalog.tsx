import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Product } from '../../types';
import { ProductCard3D } from './ProductCard3D';
import { ProductModal } from './ProductModal';
import { 
  Search, 
  Plus, 
  Grid, 
  List, 
  Package, 
  X, 
  Edit2,
  Trash2,
  PlusCircle, 
  Check, 
  ShieldAlert
} from 'lucide-react';
import { formatPKR, getStockStatus, getExpiryStatus } from '../../utils/formatters';

export const ProductCatalog: React.FC = () => {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Delete confirm modal
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Quick Add Stock Modal
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [addQty, setAddQty] = useState<number>(10);

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    let matchesStock = true;
    if (selectedStockFilter === 'LOW') {
      matchesStock = p.stockQty > 0 && p.stockQty <= p.minStockAlert;
    } else if (selectedStockFilter === 'OUT') {
      matchesStock = p.stockQty <= 0;
    } else if (selectedStockFilter === 'HEALTHY') {
      matchesStock = p.stockQty > p.minStockAlert;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleSaveProduct = async (productData: Partial<Product>) => {
    const now = new Date().toISOString();
    if (editingProduct && editingProduct.id) {
      await db.products.update(editingProduct.id, {
        ...productData,
        updatedAt: now
      });
    } else {
      await db.products.add({
        ...productData as Product,
        createdAt: now,
        updatedAt: now
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingProduct && deletingProduct.id) {
      await db.products.delete(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const handleQuickAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockProduct && stockProduct.id) {
      const newQty = stockProduct.stockQty + addQty;
      await db.products.update(stockProduct.id, {
        stockQty: newQty,
        updatedAt: new Date().toISOString()
      });

      // Log stock movement
      await db.stockLogs.add({
        productId: stockProduct.id,
        productName: stockProduct.name,
        changeQty: addQty,
        type: 'ADD_STOCK',
        newQty: newQty,
        notes: `Quick manual stock increase (+${addQty} ${stockProduct.unit}s)`,
        timestamp: new Date().toISOString()
      });

      setStockProduct(null);
      setAddQty(10);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Catalog Header & Controls Bar */}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Pesticide Inventory Catalog</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Showing {filteredProducts.length} of {products.length} registered products
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          style={{ padding: '10px 18px' }}
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Inputs */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search product name, brand, SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', paddingRight: searchTerm ? '38px' : '14px' }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select 
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Insecticide">Insecticide</option>
            <option value="Fungicide">Fungicide</option>
            <option value="Herbicide">Herbicide</option>
            <option value="Fertilizer">Fertilizer</option>
            <option value="Seeds">Seeds</option>
            <option value="Micro-Nutrient">Micro-Nutrient</option>
            <option value="Pesticide Spray Gear">Spray Gear</option>
          </select>

          {/* Stock Filter Dropdown */}
          <select 
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={selectedStockFilter}
            onChange={e => setSelectedStockFilter(e.target.value)}
          >
            <option value="ALL">All Stock Status</option>
            <option value="HEALTHY">In Stock</option>
            <option value="LOW">Low Stock Alert</option>
            <option value="OUT">Out of Stock</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <button 
            className="btn btn-secondary btn-icon"
            onClick={() => setViewMode('GRID')}
            style={{
              minHeight: '36px',
              height: '36px',
              padding: '6px',
              background: viewMode === 'GRID' ? 'var(--primary-700)' : 'transparent',
              borderColor: 'transparent'
            }}
            title="3D Card Grid View"
          >
            <Grid size={18} color={viewMode === 'GRID' ? '#ffffff' : 'var(--text-muted)'} />
          </button>
          <button 
            className="btn btn-secondary btn-icon"
            onClick={() => setViewMode('TABLE')}
            style={{
              minHeight: '36px',
              height: '36px',
              padding: '6px',
              background: viewMode === 'TABLE' ? 'var(--primary-700)' : 'transparent',
              borderColor: 'transparent'
            }}
            title="Compact Table List View"
          >
            <List size={18} color={viewMode === 'TABLE' ? '#ffffff' : 'var(--text-muted)'} />
          </button>
        </div>
      </div>

      {/* Main Content: 3D Grid or Table */}
      {filteredProducts.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Package size={50} color="var(--primary-500)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Products Found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            No products match your search query or filter parameters.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setSelectedStockFilter('ALL'); }}
            style={{ marginTop: '16px' }}
          >
            Reset Search Filters
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredProducts.map(p => (
            <ProductCard3D
              key={p.id}
              product={p}
              onEdit={prod => { setEditingProduct(prod); setIsProductModalOpen(true); }}
              onDelete={prod => setDeletingProduct(prod)}
              onAddStock={prod => setStockProduct(prod)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Purchase Cost</th>
                <th>Retail Price</th>
                <th>Stock Level</th>
                <th>Expiry</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const stockStatus = getStockStatus(p.stockQty, p.minStockAlert);
                const expiryStatus = getExpiryStatus(p.expiryDate);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku || 'N/A'} • {p.formulation}</div>
                    </td>
                    <td>{p.brand}</td>
                    <td><span className="badge badge-success" style={{ textTransform: 'none' }}>{p.category}</span></td>
                    <td>{formatPKR(p.purchasePrice)}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-400)' }}>{formatPKR(p.sellingPrice)}</td>
                    <td>
                      <span className={`badge ${stockStatus.badgeClass}`}>
                        {p.stockQty} {p.unit}s
                      </span>
                    </td>
                    <td>
                      {expiryStatus.type !== 'NONE' ? (
                        <span className={`badge ${expiryStatus.badgeClass}`}>{expiryStatus.label}</span>
                      ) : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => setStockProduct(p)} title="Add Stock">
                          <PlusCircle size={15} color="var(--primary-400)" />
                        </button>
                        <button className="btn btn-secondary btn-icon" onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} title="Edit">
                          <Edit2 size={15} color="var(--info-500)" />
                        </button>
                        <button className="btn btn-secondary btn-icon" onClick={() => setDeletingProduct(p)} title="Delete">
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

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-500)' }}>
                <ShieldAlert size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Delete Product?</h3>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setDeletingProduct(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                Are you sure you want to delete <strong>"{deletingProduct.name}"</strong>?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                This product will be removed from your catalog. Previous sales records will remain preserved.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingProduct(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                <Trash2 size={16} />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Stock Modal */}
      {stockProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Quick Stock Add</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setStockProduct(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleQuickAddStock}>
              <div className="modal-body">
                <p style={{ fontSize: '0.92rem', marginBottom: '14px' }}>
                  Product: <strong>{stockProduct.name}</strong> ({stockProduct.brand})
                </p>
                <div className="form-group">
                  <label className="form-label">Current Stock</label>
                  <input type="text" className="form-input" disabled value={`${stockProduct.stockQty} ${stockProduct.unit}s`} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity to Add</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1" 
                    required 
                    value={addQty} 
                    onChange={e => setAddQty(parseInt(e.target.value) || 1)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setStockProduct(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} />
                  <span>Update Stock Level</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
