import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Product, CartItem, PaymentMethod, Customer, Sale, ShopSettings } from '../../types';
import { CartItemRow } from './CartItemRow';
import { InvoiceModal } from './InvoiceModal';
import confetti from 'canvas-confetti';
import { 
  Search, 
  ShoppingCart, 
  User, 
  CreditCard, 
  CheckCircle2, 
  Trash2, 
  Package
} from 'lucide-react';
import { formatPKR, generateBillNumber } from '../../utils/formatters';

interface Props {
  settings?: ShopSettings;
}

export const POSBillingView: React.FC<Props> = ({ settings }) => {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];

  // Search & Cart State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer & Payment State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('WALK_IN');
  const [customCustomerName, setCustomCustomerName] = useState<string>('Walk-in Customer');
  const [customCustomerPhone] = useState<string>('');
  
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Invoice Modal State
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Search-first product discovery: do not render the full catalog until the user searches.
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean);
  const billingProducts = searchTokens.length === 0
    ? []
    : products.filter(p => {
        const searchableText = `${p.name} ${p.brand} ${p.sku || ''}`.toLowerCase();
        const matchesSearch = searchTokens.every(token => searchableText.includes(token));
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }).slice(0, 24);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const dueAmount = Math.max(0, finalTotal - paidAmount);

  // Add Item to Cart
  const handleAddToCart = (product: Product) => {
    if (product.stockQty <= 0) {
      alert(`"${product.name}" is currently Out of Stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) {
          alert(`Cannot add more. Available stock limit reached (${product.stockQty} ${product.unit}s).`);
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        return [...prev, {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          subtotal: product.sellingPrice
        }];
      }
    });
  };

  // Update Cart Quantity
  const handleUpdateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const safeQty = Math.min(qty, item.product.stockQty);
        return { ...item, quantity: safeQty, subtotal: safeQty * item.unitPrice };
      }
      return item;
    }));
  };

  // Remove Item
  const handleRemoveItem = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setPaidAmount(0);
  };

  // Complete Sale Action
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please select products to complete sale.');
      return;
    }

    // Customer setup
    let custName = customCustomerName;
    let custPhone = customCustomerPhone;
    let customerObj: Customer | undefined;

    if (selectedCustomerId !== 'WALK_IN') {
      customerObj = customers.find(c => c.id === parseInt(selectedCustomerId));
      if (customerObj) {
        custName = customerObj.name;
        custPhone = customerObj.phone;
      }
    }

    const billNo = await generateBillNumber();
    const now = new Date().toISOString();

    const saleRecord: Sale = {
      billNumber: billNo,
      customerId: customerObj?.id,
      customerName: custName,
      customerPhone: custPhone,
      items: cart.map(item => ({
        productId: item.product.id!,
        productName: item.product.name,
        unit: item.product.unit,
        qty: item.quantity,
        purchasePrice: item.product.purchasePrice || 0,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal
      })),
      subtotal,
      discount: discountAmount,
      tax: 0,
      totalAmount: finalTotal,
      paidAmount: paymentMethod === 'UDHAR_CREDIT' ? paidAmount : finalTotal,
      dueAmount: paymentMethod === 'UDHAR_CREDIT' ? dueAmount : 0,
      paymentMethod,
      cashierName: settings?.activeUserName || 'Chaudhry Shahbaz',
      createdAt: now
    };

    // Execute atomic Dexie transaction: Save Sale + Deduct Product Stock + Update Customer Udhar + Log Stock
    await db.transaction('rw', [db.sales, db.products, db.customers, db.stockLogs], async () => {
      // 1. Add Sale Record
      const saleId = await db.sales.add(saleRecord);
      saleRecord.id = saleId;

      // 2. Deduct Inventory Stock
      for (const item of cart) {
        const prod = await db.products.get(item.product.id!);
        if (prod) {
          const newQty = Math.max(0, prod.stockQty - item.quantity);
          await db.products.update(prod.id!, {
            stockQty: newQty,
            updatedAt: now
          });

          // Stock Log
          await db.stockLogs.add({
            productId: prod.id!,
            productName: prod.name,
            changeQty: -item.quantity,
            type: 'SALE',
            newQty: newQty,
            notes: `Sold in Bill #${billNo}`,
            timestamp: now
          });
        }
      }

      // 3. Update Customer Udhar Ledger if credit sale
      if (customerObj && customerObj.id && paymentMethod === 'UDHAR_CREDIT' && dueAmount > 0) {
        const newBalance = (customerObj.outstandingBalance || 0) + dueAmount;
        await db.customers.update(customerObj.id, {
          outstandingBalance: newBalance,
          updatedAt: now
        });
      }
    });

    // Fire Confetti Animation!
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}

    setCompletedSale(saleRecord);
    setIsInvoiceModalOpen(true);
    handleClearCart();
  };

  return (
    <div className="billing-screen" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)', gap: '20px', alignItems: 'start' }}>
      {/* LEFT PANE: Product Selection Catalog */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search & Category Filter */}
        <div className="card-3d" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search product for instant billing..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['ALL', 'Insecticide', 'Fungicide', 'Herbicide', 'Fertilizer', 'Seeds', 'Micro-Nutrient'].map((cat) => (
              <button 
                key={cat}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ padding: '6px 12px', fontSize: '0.78rem', minHeight: '32px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div 
          className="billing-product-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '12px',
            maxHeight: 'calc(100dvh - 240px)',
            overflowY: 'auto',
            paddingRight: '4px'
          }}
        >
          {searchTokens.length === 0 ? (
            <div className="billing-search-empty">
              <Search size={28} aria-hidden="true" />
              <strong>Search products to add to the sale</strong>
              <span>Use any part of a product name, brand, or SKU.</span>
            </div>
          ) : billingProducts.length === 0 ? (
            <div className="billing-search-empty">
              <Package size={28} aria-hidden="true" />
              <strong>No matching products</strong>
              <span>Try another word or clear the category filter.</span>
            </div>
          ) : billingProducts.map(p => {
            const isOutOfStock = p.stockQty <= 0;
            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && handleAddToCart(p)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: isOutOfStock ? 'rgba(0,0,0,0.4)' : 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isOutOfStock ? 0.5 : 1,
                  transition: 'transform var(--transition-fast)'
                }}
                className={!isOutOfStock ? 'card-3d' : ''}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                    {p.brand}
                  </span>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginTop: '2px', lineHeight: 1.2 }}>
                    {p.name}
                  </h4>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary-300)', fontSize: '0.92rem' }}>
                    {formatPKR(p.sellingPrice)}
                  </span>
                  <span 
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: isOutOfStock ? 'var(--danger-500)' : 'var(--text-muted)'
                    }}
                  >
                    {isOutOfStock ? 'Out of Stock' : `${p.stockQty} ${p.unit}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANE: Cart & Checkout Summary */}
      <div 
        className="card-3d billing-cart-panel"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 'calc(100dvh - 160px)'
        }}
      >
        <div>
          {/* Cart Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={22} color="var(--primary-400)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Active Sale Cart ({cart.length})</h3>
            </div>
            {cart.length > 0 && (
              <button className="btn btn-secondary" onClick={handleClearCart} style={{ padding: '4px 8px', fontSize: '0.78rem', minHeight: '30px', color: 'var(--danger-500)' }}>
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 10px', color: 'var(--text-muted)' }}>
              <Package size={44} style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 600 }}>Cart is empty</p>
              <p style={{ fontSize: '0.8rem' }}>Tap or click any product from the left catalog to add.</p>
            </div>
          ) : (
            <div className="billing-cart-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
              {cart.map(item => (
                <CartItemRow 
                  key={item.product.id}
                  item={item}
                  onUpdateQty={handleUpdateQty}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}

          {/* Customer Selector */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">
              <User size={15} /> Select Customer / Farmer
            </label>
            <select 
              className="form-select"
              value={selectedCustomerId}
              onChange={e => {
                setSelectedCustomerId(e.target.value);
                if (e.target.value === 'WALK_IN') setCustomCustomerName('Walk-in Customer');
              }}
            >
              <option value="WALK_IN">Walk-in Customer (Cash)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) — Udhar: {formatPKR(c.outstandingBalance || 0)}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">
              <CreditCard size={15} /> Payment Method
            </label>
            <select 
              className="form-select"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="CASH">Cash Payment</option>
              <option value="JAZZCASH">JazzCash</option>
              <option value="EASYPAISA">EasyPaisa</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UDHAR_CREDIT">Udhar / Farmer Credit</option>
            </select>
          </div>
        </div>

        {/* Financial Calculation & Checkout Button */}
        <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '14px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
            <span style={{ fontWeight: 700 }}>{formatPKR(subtotal)}</span>
          </div>

          {/* Discount Input Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Discount (Rs.):</span>
            <input 
              type="number" 
              className="form-input" 
              style={{ width: '110px', minHeight: '34px', padding: '4px 8px', textAlign: 'right' }}
              min="0"
              value={discountAmount}
              onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Total Payable */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--primary-400)',
              marginBottom: '14px'
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>Net Total:</span>
            <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary-400)' }}>
              {formatPKR(finalTotal)}
            </span>
          </div>

          {/* Complete Sale Trigger */}
          <button 
            className="btn btn-primary"
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
            style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
          >
            <CheckCircle2 size={22} />
            <span>Complete Sale & Print Bill</span>
          </button>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        sale={completedSale}
        settings={settings}
      />
    </div>
  );
};
