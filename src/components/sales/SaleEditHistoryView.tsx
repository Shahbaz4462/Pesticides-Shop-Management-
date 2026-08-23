import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { SaleEditHistory } from '../../types';
import { Clock, ArrowRight, X, Edit3 } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface Props {
  saleId: number;
  billNumber: string;
  onClose: () => void;
}

export const SaleEditHistoryView: React.FC<Props> = ({ saleId, billNumber, onClose }) => {
  const editHistory = useLiveQuery(() => 
    db.saleEditHistory
      .where('saleId')
      .equals(saleId)
      .sortBy('editedAt'), 
    []
  ) || [];

  const getChangeTypeLabel = (type: SaleEditHistory['changeType']) => {
    switch (type) {
      case 'ITEM_ADDED': return 'Item Added';
      case 'ITEM_REMOVED': return 'Item Removed';
      case 'ITEM_MODIFIED': return 'Item Modified';
      case 'CUSTOMER_CHANGED': return 'Customer Changed';
      case 'PAYMENT_CHANGED': return 'Payment Changed';
      case 'DISCOUNT_CHANGED': return 'Discount Changed';
      default: return 'Other Change';
    }
  };

  const getChangeTypeColor = (type: SaleEditHistory['changeType']) => {
    switch (type) {
      case 'ITEM_ADDED': return 'var(--emerald-500)';
      case 'ITEM_REMOVED': return 'var(--danger-500)';
      case 'ITEM_MODIFIED': return 'var(--warning-500)';
      case 'CUSTOMER_CHANGED': return 'var(--info-500)';
      case 'PAYMENT_CHANGED': return 'var(--accent-gold)';
      case 'DISCOUNT_CHANGED': return 'var(--primary-500)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '85vh' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Edit History: {billNumber}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Complete audit trail of all modifications
            </p>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto' }}>
          {editHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Edit3 size={32} style={{ marginBottom: '8px' }} />
              <p>No edit history found for this sale</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {editHistory.map((history) => (
                <div
                  key={history.id}
                  className="card-3d"
                  style={{
                    padding: '16px',
                    borderLeft: `4px solid ${getChangeTypeColor(history.changeType)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {formatDateTime(history.editedAt)}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: 'var(--bg-surface)',
                        color: getChangeTypeColor(history.changeType)
                      }}
                    >
                      {getChangeTypeLabel(history.changeType)}
                    </span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Edited by: <strong>{history.editedBy}</strong>
                    </span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Field: <strong>{history.fieldChanged}</strong>
                    </span>
                  </div>

                  {history.previousValue && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Previous: <span style={{ color: 'var(--danger-500)' }}>{history.previousValue}</span>
                      </span>
                    </div>
                  )}

                  {history.newValue && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        New: <span style={{ color: 'var(--emerald-500)' }}>{history.newValue}</span>
                      </span>
                    </div>
                  )}

                  {(history.previousValue || history.newValue) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};