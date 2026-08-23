import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Sale, ShopSettings } from '../../types';
import { InvoiceModal } from '../billing/InvoiceModal';
import { SaleEditModal } from './SaleEditModal';
import { SaleEditHistoryView } from './SaleEditHistoryView';
import { Search, Receipt, Printer, Edit2, History } from 'lucide-react';
import { formatPKR, formatDateTime } from '../../utils/formatters';

interface Props {
  settings?: ShopSettings;
}

export const SalesHistoryView: React.FC<Props> = ({ settings }) => {
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryViewOpen, setIsHistoryViewOpen] = useState(false);

  // Sort newest first
  const sortedSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredSales = sortedSales.filter(s => 
    s.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = settings?.activeUserRole === 'ADMIN';

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsEditModalOpen(true);
  };

  const handleViewHistory = (sale: Sale) => {
    setSelectedSale(sale);
    setIsHistoryViewOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setSelectedSale(null);
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Sales Billing History</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Total {sales.length} completed transactions recorded offline
          </p>
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search bill # or customer name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Table */}
      {filteredSales.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Receipt size={48} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Sales History Found</h3>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Payment Method</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td style={{ fontWeight: 800, color: 'var(--primary-400)' }}>
                    {sale.billNumber}
                  </td>
                  <td>{formatDateTime(sale.createdAt)}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{sale.customerName}</div>
                    {sale.customerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sale.customerPhone}</div>}
                  </td>
                  <td>
                    <span 
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: sale.paymentMethod === 'UDHAR_CREDIT' ? 'var(--warning-100)' : 'var(--emerald-100)',
                        color: sale.paymentMethod === 'UDHAR_CREDIT' ? '#b45309' : '#047857'
                      }}
                    >
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '1rem' }}>
                    {formatPKR(sale.totalAmount)}
                  </td>
                  <td>
                    <span className={`badge ${sale.dueAmount > 0 ? 'badge-warning' : 'badge-success'}`}>
                      {sale.dueAmount > 0 ? `Due: ${formatPKR(sale.dueAmount)}` : 'PAID'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button 
                        className="btn btn-secondary btn-icon"
                        onClick={() => {
                          setSelectedSale(sale);
                          setIsInvoiceOpen(true);
                        }}
                        title="Reprint Bill Invoice"
                      >
                        <Printer size={16} color="var(--primary-400)" />
                      </button>
                      {canEdit && (
                        <>
                          <button 
                            className="btn btn-secondary btn-icon"
                            onClick={() => handleEditSale(sale)}
                            title="Edit Sale"
                          >
                            <Edit2 size={16} color="var(--info-500)" />
                          </button>
                          <button 
                            className="btn btn-secondary btn-icon"
                            onClick={() => handleViewHistory(sale)}
                            title="View Edit History"
                          >
                            <History size={16} color="var(--accent-gold)" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        sale={selectedSale}
        settings={settings}
      />

      {/* Edit Modal */}
      <SaleEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sale={selectedSale}
        settings={settings}
        onSave={handleEditComplete}
      />

      {/* Edit History View */}
      {isHistoryViewOpen && selectedSale && (
        <SaleEditHistoryView
          saleId={selectedSale.id!}
          billNumber={selectedSale.billNumber}
          onClose={() => setIsHistoryViewOpen(false)}
        />
      )}
    </div>
  );
};
