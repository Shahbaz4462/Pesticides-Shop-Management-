import type { Product, Sale, Purchase, Customer, Supplier, StockLog, ShopSettings } from '../types';
import { db } from '../db/database';

export function formatPKR(amount: number): string {
  if (isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateString;
  }
}

export function getStockStatus(stockQty: number, minStockAlert: number = 10) {
  if (stockQty <= 0) {
    return {
      type: 'OUT_OF_STOCK' as const,
      label: 'Out of Stock',
      badgeClass: 'badge-danger',
      iconColor: 'var(--danger-500)'
    };
  }
  if (stockQty <= minStockAlert) {
    return {
      type: 'LOW_STOCK' as const,
      label: 'Low Stock',
      badgeClass: 'badge-warning',
      iconColor: 'var(--warning-500)'
    };
  }
  return {
    type: 'IN_STOCK' as const,
    label: 'In Stock',
    badgeClass: 'badge-success',
    iconColor: 'var(--emerald-500)'
  };
}

export function getExpiryStatus(expiryDateStr?: string) {
  if (!expiryDateStr) return { type: 'NONE' as const, label: 'No Expiry', daysLeft: 9999 };
  
  const expiry = new Date(expiryDateStr).getTime();
  const today = new Date().setHours(0,0,0,0);
  const diffTime = expiry - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { type: 'EXPIRED' as const, label: 'EXPIRED', daysLeft, badgeClass: 'badge-danger' };
  }
  if (daysLeft <= 60) {
    return { type: 'EXPIRING_SOON' as const, label: `Expires in ${daysLeft} days`, daysLeft, badgeClass: 'badge-warning' };
  }
  return { type: 'OK' as const, label: 'Valid Stock', daysLeft, badgeClass: 'badge-success' };
}

export async function generateBillNumber(): Promise<string> {
  const count = await db.sales.count();
  const year = new Date().getFullYear();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `PEST-${year}-${nextNum}`;
}

export async function generatePurchaseNumber(): Promise<string> {
  const count = await db.purchases.count();
  const year = new Date().getFullYear();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `PUR-${year}-${nextNum}`;
}

// Backup & Restore
export interface BackupData {
  version: string;
  exportedAt: string;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  stockLogs: StockLog[];
  settings: ShopSettings[];
}

export async function exportDatabaseBackup(): Promise<string> {
  const products = await db.products.toArray();
  const customers = await db.customers.toArray();
  const suppliers = await db.suppliers.toArray();
  const sales = await db.sales.toArray();
  const purchases = await db.purchases.toArray();
  const stockLogs = await db.stockLogs.toArray();
  const settings = await db.settings.toArray();

  const data: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    products,
    customers,
    suppliers,
    sales,
    purchases,
    stockLogs,
    settings
  };

  return JSON.stringify(data, null, 2);
}

export async function restoreDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const data: BackupData = JSON.parse(jsonString);
    if (!data.products || !data.sales || !Array.isArray(data.products)) {
      throw new Error('Invalid backup file structure.');
    }

    await db.transaction('rw', [db.products, db.customers, db.suppliers, db.sales, db.purchases, db.stockLogs, db.settings], async () => {
      await db.products.clear();
      await db.customers.clear();
      await db.suppliers.clear();
      await db.sales.clear();
      await db.purchases.clear();
      await db.stockLogs.clear();
      await db.settings.clear();

      if (data.products.length) await db.products.bulkAdd(data.products);
      if (data.customers.length) await db.customers.bulkAdd(data.customers);
      if (data.suppliers.length) await db.suppliers.bulkAdd(data.suppliers);
      if (data.sales.length) await db.sales.bulkAdd(data.sales);
      if (data.purchases.length) await db.purchases.bulkAdd(data.purchases);
      if (data.stockLogs.length) await db.stockLogs.bulkAdd(data.stockLogs);
      if (data.settings.length) await db.settings.bulkAdd(data.settings);
    });

    return true;
  } catch (err) {
    console.error('Failed to restore backup:', err);
    return false;
  }
}
