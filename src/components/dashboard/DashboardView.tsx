import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { KPICard } from './KPICard';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CalendarX, 
  Users, 
  Building2, 
  ShoppingCart, 
  Plus, 
  Receipt,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatPKR, getExpiryStatus, formatDate } from '../../utils/formatters';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({ setActiveTab }) => {
  // Live reactive queries from Dexie IndexedDB
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];
  const purchases = useLiveQuery(() => db.purchases.toArray(), []) || [];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];

  // Statistics Calculation
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySales = sales.filter(s => s.createdAt.startsWith(todayStr));
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  const todayPurchases = purchases.filter(p => p.createdAt.startsWith(todayStr));
  const todayPurchasesTotal = todayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const lowStockProducts = products.filter(p => p.stockQty > 0 && p.stockQty <= p.minStockAlert);
  const outOfStockProducts = products.filter(p => p.stockQty <= 0);

  const expiringProducts = products.filter(p => {
    const status = getExpiryStatus(p.expiryDate);
    return status.type === 'EXPIRED' || status.type === 'EXPIRING_SOON';
  });

  const totalCustomerUdhar = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
  const totalSupplierPayable = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);

  // Recent 5 sales for dashboard activity
  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="dashboard-screen" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner / Welcome Bar */}
      <div 
        className="card-3d dashboard-overview"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(5, 104, 56, 0.9), rgba(2, 44, 25, 0.95))',
          borderColor: 'var(--primary-400)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-success">Live Business Overview</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-300)' }}>• Live data</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            <span className="desktop-only">🌾 Pakistan Pesticide & Agriculture Dashboard</span>
            <span className="mobile-only" style={{ display: 'none' }}>Business Overview</span>
          </h2>
          <p className="dashboard-overview__description" style={{ color: 'var(--primary-100)', fontSize: '0.92rem', marginTop: '4px' }}>
            Real-time local tracking for inventory, daily sales billing, supplier purchases & farmer udhar ledger.
          </p>
        </div>

        <div className="dashboard-overview__actions" style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('billing')}
            style={{ padding: '12px 20px', fontSize: '0.95rem' }}
          >
            <ShoppingCart size={20} />
            <span>Open POS Counter</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={() => setActiveTab('products')}
            style={{ padding: '12px 18px' }}
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
        <div className="dashboard-overview__stats" aria-label="Today summary">
          <div><strong>{formatPKR(todaySalesTotal)}</strong><span>Sales today</span></div>
          <div><strong>{formatPKR(todayPurchasesTotal)}</strong><span>Purchases</span></div>
          <div><strong>{formatPKR(totalCustomerUdhar)}</strong><span>Customer due</span></div>
          <div><strong>{lowStockProducts.length + expiringProducts.length}</strong><span>Open alerts</span></div>
        </div>
      </div>

      {/* KPI Grid */}
      <div 
        className="dashboard-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px'
        }}
      >
        <KPICard
          title="Today's Sales"
          value={formatPKR(todaySalesTotal)}
          subtitle={`${todaySales.length} Bills • Pur: ${formatPKR(todayPurchasesTotal)}`}
          icon={TrendingUp}
          color="16, 185, 129"
          badgeText="Active"
          badgeType="success"
          onClick={() => setActiveTab('sales-history')}
        />

        <KPICard
          title="Low Stock Alert"
          value={lowStockProducts.length}
          subtitle={`${outOfStockProducts.length} Out of Stock`}
          icon={AlertTriangle}
          color="245, 158, 11"
          badgeText={lowStockProducts.length > 0 ? "Restock Needed" : "Stock Healthy"}
          badgeType={lowStockProducts.length > 0 ? "warning" : "success"}
          onClick={() => setActiveTab('low-stock')}
        />

        <KPICard
          title="Expiring Products"
          value={expiringProducts.length}
          subtitle="Within 60 Days / Expired"
          icon={CalendarX}
          color="239, 68, 68"
          badgeText={expiringProducts.length > 0 ? "Action Req" : "All Clear"}
          badgeType={expiringProducts.length > 0 ? "danger" : "success"}
          onClick={() => setActiveTab('expiry')}
        />

        <KPICard
          title="Total Products"
          value={products.length}
          subtitle="Inventory Catalog"
          icon={Package}
          color="59, 130, 246"
          badgeText="Catalog"
          badgeType="info"
          onClick={() => setActiveTab('products')}
        />

        <KPICard
          title="Customer Udhar Ledger"
          value={formatPKR(totalCustomerUdhar)}
          subtitle={`${customers.length} Registered Farmers`}
          icon={Users}
          color="245, 158, 11"
          badgeText="Credit"
          badgeType="warning"
          onClick={() => setActiveTab('customers')}
        />

        <KPICard
          title="Supplier Payable"
          value={formatPKR(totalSupplierPayable)}
          subtitle={`${suppliers.length} Registered Companies`}
          icon={Building2}
          color="239, 68, 68"
          badgeText="Payable"
          badgeType="danger"
          onClick={() => setActiveTab('suppliers')}
        />
      </div>

      {/* Grid Section: Low Stock Warning + Recent Sales */}
      <div 
        className="dashboard-activity-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Low Stock Items Section */}
        <div className="card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="var(--warning-500)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Low Stock & Restock Alert</h3>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setActiveTab('low-stock')}
              style={{ fontSize: '0.8rem', padding: '4px 10px', minHeight: '32px' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={40} color="var(--emerald-500)" style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>All inventory stock levels are healthy!</p>
              <p style={{ fontSize: '0.82rem' }}>No products are currently below minimum alert thresholds.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStockProducts.slice(0, 5).map((p) => (
                <div 
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{p.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Brand: {p.brand} • Min threshold: {p.minStockAlert} {p.unit}s
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-warning">
                      Remaining: {p.stockQty} {p.unit}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Activity */}
        <div className="card-3d" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} color="var(--primary-400)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent POS Sales Bills</h3>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setActiveTab('sales-history')}
              style={{ fontSize: '0.8rem', padding: '4px 10px', minHeight: '32px' }}
            >
              View History <ArrowRight size={14} />
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <ShoppingCart size={40} style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 600 }}>No sales recorded yet</p>
              <p style={{ fontSize: '0.82rem' }}>Click Open POS Counter to complete your first bill.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentSales.map((sale) => (
                <div 
                  key={sale.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary-300)' }}>
                      {sale.billNumber}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Customer: {sale.customerName} • {formatDate(sale.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                      {formatPKR(sale.totalAmount)}
                    </p>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        background: sale.paymentMethod === 'UDHAR_CREDIT' ? 'var(--warning-100)' : 'var(--emerald-100)',
                        color: sale.paymentMethod === 'UDHAR_CREDIT' ? '#b45309' : '#047857',
                        fontWeight: 700
                      }}
                    >
                      {sale.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
