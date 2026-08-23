export type UserRole = 'ADMIN' | 'STAFF' | 'EMPLOYEE';

export type ProductCategory = 
  | 'Insecticide' 
  | 'Fungicide' 
  | 'Herbicide' 
  | 'Fertilizer' 
  | 'Seeds' 
  | 'Micro-Nutrient'
  | 'Pesticide Spray Gear'
  | 'Other';

export type ProductFormulation = 'EC' | 'SC' | 'WDG' | 'SL' | 'Granules' | 'Powder' | 'Liquid' | 'N/A';

export type ProductUnit = 'Liter' | 'Bottle' | 'Pack' | 'Kg' | 'Bag' | 'Gram' | 'Ml' | 'Piece';

export interface Product {
  id?: number;
  name: string;
  brand: string; // e.g. Bayer, Syngenta, FMC, Engro, Fauji, Guard, Target
  category: ProductCategory;
  formulation: ProductFormulation;
  unit: ProductUnit;
  purchasePrice: number; // in PKR Rs.
  sellingPrice: number;  // in PKR Rs.
  stockQty: number;
  minStockAlert: number;
  expiryDate?: string;   // YYYY-MM-DD
  batchNo?: string;
  sku?: string;
  image?: string;        // Base64 or icon key
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address?: string;
  city?: string;
  outstandingBalance: number; // Credit / Udhar balance in Rs.
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id?: number;
  name: string;
  company: string;
  phone: string;
  address?: string;
  outstandingBalance: number; // Payable balance in Rs.
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'CASH' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'UDHAR_CREDIT';

export interface SaleItem {
  productId: number;
  productName: string;
  unit: string;
  qty: number;
  purchasePrice: number; // Stored to compute exact profit accurately
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id?: number;
  billNumber: string; // e.g., PEST-2026-0001
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number; // Discount in Rs.
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  createdAt: string; // ISO date string
  updatedAt?: string;
}

export interface PurchaseItem {
  productId: number;
  productName: string;
  qty: number;
  purchasePrice: number;
  total: number;
}

export interface Purchase {
  id?: number;
  purchaseNumber: string; // e.g. PUR-2026-0001
  supplierId?: number;
  supplierName: string;
  invoiceNo?: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  notes?: string;
  createdAt: string;
}

export interface StockLog {
  id?: number;
  productId: number;
  productName: string;
  changeQty: number;
  type: 'INITIAL' | 'ADD_STOCK' | 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'RETURN';
  newQty: number;
  notes?: string;
  timestamp: string;
}

export interface ShopSettings {
  id?: number;
  shopName: string;
  logoDataUrl?: string;
  tagline: string;
  phone: string;
  address: string;
  city: string;
  ntn?: string;
  strn?: string;
  invoiceNote: string;
  currencySymbol: string;
  enable3DEffects: boolean;
  enableSoundEffects: boolean;
  thermalPrinterMode: boolean; // default true for 80mm POS
  activeUserRole: UserRole;
  activeUserName: string;
  // Bill printing configuration
  invoiceHeader?: string;
  invoiceFooter?: string;
  taxInfo?: string;
  billWidth?: '58mm' | '80mm' | 'A4';
}

export interface Staff {
  id?: number;
  name: string;
  phone: string;
  address?: string;
  role: 'MANAGER' | 'SALES' | 'WAREHOUSE' | 'ADMIN_ASSISTANT';
  username: string;
  password: string; // In production, this should be hashed
  isActive: boolean;
  joiningDate?: string;
  salary?: number;
  outstandingBalance: number; // Salary advances/payments
  createdAt: string;
  updatedAt: string;
}

export interface StaffPayment {
  id?: number;
  staffId: number;
  staffName: string;
  amount: number;
  paymentType: 'SALARY' | 'ADVANCE' | 'BONUS' | 'DEDUCTION';
  comment?: string;
  date: string;
  createdAt: string;
}

export interface SaleEditHistory {
  id?: number;
  saleId: number;
  billNumber: string;
  editedBy: string;
  editedAt: string;
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  changeType: 'ITEM_ADDED' | 'ITEM_REMOVED' | 'ITEM_MODIFIED' | 'CUSTOMER_CHANGED' | 'PAYMENT_CHANGED' | 'DISCOUNT_CHANGED' | 'OTHER';
}
