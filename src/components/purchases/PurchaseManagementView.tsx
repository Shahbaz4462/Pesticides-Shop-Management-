import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { NewPurchaseModal } from './NewPurchaseModal';
import { Truck, Plus } from 'lucide-react';
import { formatPKR, formatDate } from '../../utils/formatters';

export const PurchaseManagementView: React.FC = () => {
  const purchases = useLiveQuery(() => db.purchases.toArray(), []) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm] = useState('');

  const filteredPurchases = purchases.filter(p => 
    p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.invoiceNo && p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Supplier Purchases Intake</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Record product stock intake batches directly from pesticide manufacturers & distributor depots
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Record New Purchase</span>
        </button>
      </div>

      {filteredPurchases.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Truck size={48} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Purchases Recorded Yet</h3>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Purchase #</th>
                <th>Supplier / Company</th>
                <th>Invoice Ref</th>
                <th>Date</th>
                <th>Items Qty</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map(pur => (
                <tr key={pur.id}>
                  <td style={{ fontWeight: 800, color: 'var(--primary-400)' }}>
                    {pur.purchaseNumber}
                  </td>
                  <td>{pur.supplierName}</td>
                  <td><code>{pur.invoiceNo || 'N/A'}</code></td>
                  <td>{formatDate(pur.createdAt)}</td>
                  <td>{pur.items.reduce((sum, i) => sum + i.qty, 0)} Units</td>
                  <td style={{ fontWeight: 800, color: '#ffffff' }}>
                    {formatPKR(pur.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
