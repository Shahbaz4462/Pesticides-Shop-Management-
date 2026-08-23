import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { Download, TrendingUp, Package, DollarSign } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const ReportsView: React.FC = () => {
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'MONTH'>('ALL');

  // Filter Sales
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const filteredSales = sales.filter(s => {
    if (dateFilter === 'TODAY') return s.createdAt.startsWith(todayStr);
    if (dateFilter === 'MONTH') return s.createdAt.startsWith(currentMonthStr);
    return true;
  });

  // Calculate Metrics
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Profit calculation: sum of (item.unitPrice - item.purchasePrice) * item.qty - sale.discount
  let totalCost = 0;
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      totalCost += (item.purchasePrice || 0) * item.qty;
    });
  });

  const netProfit = Math.max(0, totalRevenue - totalCost);
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Total Stock Valuation
  const totalStockValuation = products.reduce((sum, p) => sum + (p.stockQty * (p.purchasePrice || p.sellingPrice)), 0);

  // Helper to check if two dates are on the same calendar day (local time)
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Category Breakdown - computed from filtered sales
  const categoryStats: Record<string, { count: number, revenue: number }> = {};
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      // Find category from product catalog or match by product name
      const prod = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
      const cat = prod?.category || 'Insecticide';
      if (!categoryStats[cat]) categoryStats[cat] = { count: 0, revenue: 0 };
      categoryStats[cat].count += item.qty;
      categoryStats[cat].revenue += item.subtotal;
    });
  });

  // Prepare category chart data
  const categoryChartData = Object.entries(categoryStats).map(([cat, stats]) => ({
    name: cat,
    value: stats.revenue,
    count: stats.count
  }));

  // Daily sales trend (always last 7 days from all sales)
  const dailySalesData: Array<{ date: string; revenue: number; bills: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - i);
    
    const daySales = sales.filter(s => isSameDay(new Date(s.createdAt), targetDate));
    const dayRevenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
    dailySalesData.push({
      date: targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      revenue: dayRevenue,
      bills: daySales.length
    });
  }

  // Pie chart colors
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Bill Number,Date,Customer,Total Amount (PKR),Payment Method\n";
    filteredSales.forEach(s => {
      csvContent += `"${s.billNumber}","${s.createdAt}","${s.customerName}","${s.totalAmount}","${s.paymentMethod}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Pesticide_Sales_Report_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Business Performance & Profit Reports</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Financial analytics for revenue, net profit margin, and stock valuation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="form-select" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as any)}
          >
            <option value="ALL">All Time History</option>
            <option value="TODAY">Today's Report</option>
            <option value="MONTH">This Month</option>
          </select>

          <button className="btn btn-primary" onClick={handleExportCSV}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card-3d" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SALES REVENUE</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-400)', marginTop: '4px' }}>
            {formatPKR(totalRevenue)}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{filteredSales.length} Bills Completed</span>
        </div>

        <div className="card-3d" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET PROFIT MARGIN</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--emerald-500)', marginTop: '4px' }}>
            {formatPKR(netProfit)}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--primary-300)', fontWeight: 700 }}>
            Margin: {profitMarginPercent}%
          </span>
        </div>

        <div className="card-3d" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL STOCK VALUATION</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-gold)', marginTop: '4px' }}>
            {formatPKR(totalStockValuation)}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Capital Tied in Products</span>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Daily Sales Trend Chart */}
        <div className="card-3d" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--primary-400)" />
            Sales Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-muted)"
                fontSize={12}
                tick={{ fill: 'var(--text-muted)' }}
              />
              <YAxis 
                stroke="var(--text-muted)"
                fontSize={12}
                tick={{ fill: 'var(--text-muted)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-surface-elevated)', 
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: 'var(--text-main)'
                }}
                formatter={(value: any) => typeof value === 'number' ? formatPKR(value) : value?.toString() || ''}
              />
              <Bar dataKey="revenue" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="card-3d" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--accent-gold)" />
            Revenue by Category
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-surface-elevated)', 
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: 'var(--text-main)'
                }}
                formatter={(value: any) => typeof value === 'number' ? formatPKR(value) : value?.toString() || ''}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Sales Breakdown Table */}
      <div className="card-3d" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={20} color="var(--emerald-500)" />
          Category Wise Sales Revenue
        </h3>
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Units Sold</th>
                <th>Total Revenue (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryStats).map(([cat, stats]) => (
                <tr key={cat}>
                  <td style={{ fontWeight: 700 }}>{cat}</td>
                  <td>{stats.count} Units</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary-400)' }}>{formatPKR(stats.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
