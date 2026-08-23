import React, { useState } from 'react';
import type { Sale, ShopSettings } from '../../types';
import { formatPKR, formatDateTime } from '../../utils/formatters';
import { X, Printer, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  settings?: ShopSettings;
}

export const InvoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sale,
  settings
}) => {
  const [printFormat, setPrintFormat] = useState<'THERMAL' | 'A4'>('THERMAL');

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Modal Header */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={22} color="var(--primary-400)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Sale Completed — {sale.billNumber}
            </h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Print Format Switcher inside Modal */}
        <div 
          className="no-print" 
          style={{ 
            padding: '12px 24px', 
            background: 'rgba(0,0,0,0.2)', 
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Print Format Preview:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${printFormat === 'THERMAL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPrintFormat('THERMAL')}
              style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
            >
              80mm POS Receipt
            </button>
            <button 
              className={`btn ${printFormat === 'A4' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPrintFormat('A4')}
              style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
            >
              A4 Invoice Format
            </button>
          </div>
        </div>

        {/* Invoice Receipt Body (Formatted for screen preview and print output) */}
        <div className="modal-body" style={{ background: printFormat === 'A4' ? '#ffffff' : '#fcfcfc', color: '#000000', padding: '24px' }}>
          <div className="printable-receipt" style={{ width: printFormat === 'A4' ? '100%' : '320px', margin: '0 auto', fontFamily: 'Courier New, Courier, monospace, sans-serif' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '12px' }}>
              {settings?.invoiceHeader && (
                <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
                  {settings.invoiceHeader}
                </p>
              )}
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', color: '#000000' }}>
                {settings?.shopName || 'KISAN DOST PESTICIDE CENTER'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#333333' }}>{settings?.tagline || 'Quality Pesticides & Fertilizers'}</p>
              <p style={{ fontSize: '0.8rem', color: '#333333' }}>{settings?.address || 'Vehari Road, Punjab'}</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000000' }}>Phone: {settings?.phone || '+92 300 1234567'}</p>
              {settings?.ntn && <p style={{ fontSize: '0.75rem' }}>NTN: {settings.ntn}</p>}
              {settings?.taxInfo && <p style={{ fontSize: '0.75rem' }}>{settings.taxInfo}</p>}
            </div>

            {/* Bill Info */}
            <div style={{ fontSize: '0.82rem', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p><strong>Bill No:</strong> {sale.billNumber}</p>
                <p><strong>Customer:</strong> {sale.customerName}</p>
                {sale.customerPhone && <p><strong>Phone:</strong> {sale.customerPhone}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p><strong>Date:</strong> {formatDateTime(sale.createdAt)}</p>
                <p><strong>Pay Method:</strong> {sale.paymentMethod}</p>
                <p><strong>Cashier:</strong> {sale.cashierName}</p>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '4px 0' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px dashed #ddd' }}>
                    <td style={{ padding: '6px 0', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700 }}>{item.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>({item.unit})</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '6px 0' }}>{item.qty}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0' }}>{item.unitPrice}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700 }}>{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div style={{ borderTop: '2px dashed #000', paddingTop: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>Subtotal:</span>
                <span>{formatPKR(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#c0392b' }}>
                  <span>Discount:</span>
                  <span>- {formatPKR(sale.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px solid #000', borderBottom: '1px solid #000', margin: '4px 0' }}>
                <span>Net Total:</span>
                <span>{formatPKR(sale.totalAmount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>Paid Amount:</span>
                <span>{formatPKR(sale.paidAmount)}</span>
              </div>
              {sale.dueAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#d35400', fontWeight: 700 }}>
                  <span>Udhar / Balance Due:</span>
                  <span>{formatPKR(sale.dueAmount)}</span>
                </div>
              )}
            </div>

            {/* Terms Footer */}
            <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '0.75rem', color: '#444' }}>
              <p style={{ fontWeight: 700 }}>{settings?.invoiceNote || 'Open pesticide bottles/packs cannot be returned.'}</p>
              {settings?.invoiceFooter && <p style={{ marginTop: '4px', fontWeight: 600 }}>{settings.invoiceFooter}</p>}
              <p style={{ marginTop: '4px' }}>Software System • Kisan Dost Agro Pakistan</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
