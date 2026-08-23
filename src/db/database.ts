import Dexie, { type Table } from 'dexie';
import type { Product, Customer, Supplier, Sale, Purchase, StockLog, ShopSettings, Staff, StaffPayment, SaleEditHistory } from '../types';

export class PesticideShopDB extends Dexie {
  products!: Table<Product, number>;
  customers!: Table<Customer, number>;
  suppliers!: Table<Supplier, number>;
  sales!: Table<Sale, number>;
  purchases!: Table<Purchase, number>;
  stockLogs!: Table<StockLog, number>;
  settings!: Table<ShopSettings, number>;
  staff!: Table<Staff, number>;
  staffPayments!: Table<StaffPayment, number>;
  saleEditHistory!: Table<SaleEditHistory, number>;

  constructor() {
    super('PesticideShopDB');
    this.version(1).stores({
      products: '++id, name, brand, category, formulation, stockQty, minStockAlert, expiryDate, sku',
      customers: '++id, name, phone, outstandingBalance',
      suppliers: '++id, name, company, phone, outstandingBalance',
      sales: '++id, billNumber, customerId, customerName, totalAmount, paymentMethod, createdAt',
      purchases: '++id, purchaseNumber, supplierId, supplierName, totalAmount, createdAt',
      stockLogs: '++id, productId, type, timestamp',
      settings: '++id, shopName'
    });
    
    this.version(2).stores({
      products: '++id, name, brand, category, formulation, stockQty, minStockAlert, expiryDate, sku',
      customers: '++id, name, phone, outstandingBalance',
      suppliers: '++id, name, company, phone, outstandingBalance',
      sales: '++id, billNumber, customerId, customerName, totalAmount, paymentMethod, createdAt',
      purchases: '++id, purchaseNumber, supplierId, supplierName, totalAmount, createdAt',
      stockLogs: '++id, productId, type, timestamp',
      settings: '++id, shopName',
      staff: '++id, name, username, phone, isActive, role',
      staffPayments: '++id, staffId, staffName, date, paymentType',
      saleEditHistory: '++id, saleId, billNumber, editedAt, changeType'
    });
  }
}

export const db = new PesticideShopDB();

// Verify offline-first functionality - this app uses IndexedDB (Dexie) which works completely offline
// No network requests are made for data operations
export const verifyOfflineFirst = () => {
  if (typeof indexedDB !== 'undefined') {
    console.log('✓ IndexedDB available - Offline-first storage confirmed');
    return true;
  } else {
    console.warn('✗ IndexedDB not available - Some features may not work offline');
    return false;
  }
};

// Realistic initial sample data for Pakistan Pesticide Shop
export async function seedInitialDataIfEmpty() {
  const productCount = await db.products.count();
  if (productCount === 0) {
    console.log('Seeding initial Pakistani pesticide & agriculture shop data...');

    // 1. Initial Settings
    await db.settings.add({
      shopName: 'Kisan Dost Agriculture & Pesticide Center',
      tagline: 'Quality Pesticides, Fertilizers & Certified Seeds',
      phone: '+92 300 1234567',
      address: 'Main Grain Market, Multan Road, Vehari, Punjab',
      city: 'Vehari',
      ntn: '3456789-1',
      invoiceNote: 'Thank you for buying from Kisan Dost! Open bottles cannot be returned.',
      currencySymbol: 'Rs.',
      enable3DEffects: true,
      enableSoundEffects: true,
      thermalPrinterMode: true,
      activeUserRole: 'ADMIN',
      activeUserName: 'Chaudhry Shahbaz (Owner)',
      billWidth: '80mm',
      invoiceHeader: 'Welcome to Kisan Dost Agro Center',
      invoiceFooter: 'Certified Agriculture Products • Quality Guaranteed',
      taxInfo: 'NTN: 3456789-1'
    });

    // 2. Initial Suppliers
    await db.suppliers.bulkAdd([
      {
        name: 'Tariq Mehmood',
        company: 'Syngenta Pakistan Ltd',
        phone: '0300-8654321',
        address: 'Industrial Estate, Multan',
        outstandingBalance: 45000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Muhammad Aslam',
        company: 'Bayer CropScience Pakistan',
        phone: '0301-7654321',
        address: 'Gulberg III, Lahore',
        outstandingBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Rashid Ali',
        company: 'FMC Chemicals (Pvt) Ltd',
        phone: '0302-9876543',
        address: 'Khanewal Road, Multan',
        outstandingBalance: 125000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Engro Fertilizer Regional Depot',
        company: 'Engro Fertilizers Ltd',
        phone: '0300-5554433',
        address: 'Burewala Depot',
        outstandingBalance: 200000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ], { allKeys: true });

    // 3. Initial Customers (Pakistani Farmers / Agronomists)
    await db.customers.bulkAdd([
      {
        name: 'Malik Zahid Hussain',
        phone: '0300-9112233',
        address: 'Chak 114/WB',
        city: 'Vehari',
        outstandingBalance: 18500, // Udhar balance
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Rana Nisar Ahmad',
        phone: '0303-4455667',
        address: 'Tibba Sultan Pur',
        city: 'Vehari',
        outstandingBalance: 42000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Sardar Allah Ditta',
        phone: '0306-7788990',
        address: 'Chak 89/EB',
        city: 'Burewala',
        outstandingBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Mian Imran Latif',
        phone: '0308-1122334',
        address: 'Luddan Road',
        city: 'Vehari',
        outstandingBalance: 5500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    // 4. Initial Products
    const productsData: Product[] = [
      {
        name: 'Chlorpyrifos 40% EC',
        brand: 'Target',
        category: 'Insecticide',
        formulation: 'EC',
        unit: 'Liter',
        purchasePrice: 1850,
        sellingPrice: 2200,
        stockQty: 45,
        minStockAlert: 10,
        expiryDate: '2027-05-15',
        batchNo: 'CH-2025-09',
        sku: 'INS-CHP-1L',
        description: 'Broad-spectrum organophosphate insecticide for Termites, Cotton Bollworms and Rice Stem Borers.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Emamectin Benzoate 1.9% EC',
        brand: 'Syngenta',
        category: 'Insecticide',
        formulation: 'EC',
        unit: 'Bottle',
        purchasePrice: 850,
        sellingPrice: 1100,
        stockQty: 8, // LOW STOCK
        minStockAlert: 15,
        expiryDate: '2026-11-20',
        batchNo: 'EM-8821',
        sku: 'INS-EMA-200ML',
        description: 'Highly effective against Armyworm, American Bollworm & Caterpillar on Maize and Cotton.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Confidor 200 SL (Imidacloprid)',
        brand: 'Bayer',
        category: 'Insecticide',
        formulation: 'SL',
        unit: 'Bottle',
        purchasePrice: 1400,
        sellingPrice: 1750,
        stockQty: 22,
        minStockAlert: 8,
        expiryDate: '2027-08-10',
        batchNo: 'BAY-CON-40',
        sku: 'INS-IMI-250ML',
        description: 'Systemic insecticide for Sucking Pests, Whitefly, Jassid, Thrips in Vegetables & Cotton.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Glyphosate 41% SL (Roundup)',
        brand: 'Bayer',
        category: 'Herbicide',
        formulation: 'SL',
        unit: 'Liter',
        purchasePrice: 1600,
        sellingPrice: 1950,
        stockQty: 0, // OUT OF STOCK
        minStockAlert: 10,
        expiryDate: '2027-03-30',
        batchNo: 'GLY-7731',
        sku: 'HERB-GLY-1L',
        description: 'Non-selective systemic herbicide for complete weed clearance in uncultivated fields & orchards.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Nativo 75 WG (Tebuconazole + Trifloxystrobin)',
        brand: 'Bayer',
        category: 'Fungicide',
        formulation: 'WDG',
        unit: 'Pack',
        purchasePrice: 1250,
        sellingPrice: 1500,
        stockQty: 18,
        minStockAlert: 5,
        expiryDate: '2026-09-12', // EXPIRING SOON
        batchNo: 'NAT-2024-B',
        sku: 'FUNG-NAT-100G',
        description: 'Premium broad-spectrum fungicide for Rice Blast, Wheat Rust & Powdery Mildew.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Engro DAP Fertilizer (50 Kg)',
        brand: 'Engro',
        category: 'Fertilizer',
        formulation: 'Granules',
        unit: 'Bag',
        purchasePrice: 12200,
        sellingPrice: 12800,
        stockQty: 120,
        minStockAlert: 20,
        expiryDate: '2029-12-31',
        batchNo: 'DAP-2025-ENG',
        sku: 'FERT-DAP-50KG',
        description: 'High Quality Di-Ammonium Phosphate fertilizer for root growth and crop yield enhancement.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Engro Sona Urea (50 Kg)',
        brand: 'Engro',
        category: 'Fertilizer',
        formulation: 'Granules',
        unit: 'Bag',
        purchasePrice: 4400,
        sellingPrice: 4650,
        stockQty: 250,
        minStockAlert: 30,
        expiryDate: '2030-01-01',
        batchNo: 'UREA-2026-A',
        sku: 'FERT-UREA-50KG',
        description: '46% Nitrogen content fertilizer essential for vegetative crop growth.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Zinc Sulphate 33% (Zincol)',
        brand: 'Guard',
        category: 'Micro-Nutrient',
        formulation: 'Powder',
        unit: 'Kg',
        purchasePrice: 380,
        sellingPrice: 500,
        stockQty: 40,
        minStockAlert: 10,
        expiryDate: '2028-02-15',
        batchNo: 'ZN-33-88',
        sku: 'NUT-ZN-1KG',
        description: 'Essential micronutrient for paddy rice zinc deficiency and wheat growth booster.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Bt Cotton Seed FK-37 (Certified)',
        brand: 'FMC',
        category: 'Seeds',
        formulation: 'N/A',
        unit: 'Pack',
        purchasePrice: 3200,
        sellingPrice: 3800,
        stockQty: 35,
        minStockAlert: 10,
        expiryDate: '2026-10-01',
        batchNo: 'FK37-SEED-26',
        sku: 'SEED-COT-FK37',
        description: 'High-yielding Pink Bollworm resistant certified cotton seed variety for Southern Punjab.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: '20 Liter Battery Operated Knapsack Sprayer',
        brand: 'Target',
        category: 'Pesticide Spray Gear',
        formulation: 'N/A',
        unit: 'Piece',
        purchasePrice: 6500,
        sellingPrice: 7800,
        stockQty: 6,
        minStockAlert: 2,
        expiryDate: '2035-01-01',
        batchNo: 'PUMP-2025',
        sku: 'GEAR-PUMP-20L',
        description: 'Rechargeable 12V dual motor sprayer pump with stainless steel telescopic lance.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await db.products.bulkAdd(productsData);

    // 5. Initial Sample Sales spanning the last 7 days
    const nowMs = Date.now();
    const dayMs = 86400000;

    await db.sales.bulkAdd([
      {
        billNumber: 'PEST-2026-0001',
        customerId: 1,
        customerName: 'Malik Zahid Hussain',
        customerPhone: '0300-9112233',
        items: [
          { productId: 1, productName: 'Chlorpyrifos 40% EC', unit: 'Liter', qty: 2, purchasePrice: 1850, unitPrice: 2200, subtotal: 4400 },
          { productId: 6, productName: 'Engro DAP Fertilizer (50 Kg)', unit: 'Bag', qty: 5, purchasePrice: 12200, unitPrice: 12800, subtotal: 64000 }
        ],
        subtotal: 68400,
        discount: 400,
        tax: 0,
        totalAmount: 68000,
        paidAmount: 50000,
        dueAmount: 18000,
        paymentMethod: 'UDHAR_CREDIT',
        cashierName: 'Chaudhry Shahbaz',
        createdAt: new Date(nowMs - dayMs * 5).toISOString()
      },
      {
        billNumber: 'PEST-2026-0002',
        customerId: 3,
        customerName: 'Sardar Allah Ditta',
        customerPhone: '0306-7788990',
        items: [
          { productId: 3, productName: 'Confidor 200 SL (Imidacloprid)', unit: 'Bottle', qty: 4, purchasePrice: 1400, unitPrice: 1750, subtotal: 7000 },
          { productId: 8, productName: 'Zinc Sulphate 33% (Zincol)', unit: 'Kg', qty: 10, purchasePrice: 380, unitPrice: 500, subtotal: 5000 }
        ],
        subtotal: 12000,
        discount: 0,
        tax: 0,
        totalAmount: 12000,
        paidAmount: 12000,
        dueAmount: 0,
        paymentMethod: 'CASH',
        cashierName: 'Chaudhry Shahbaz',
        createdAt: new Date(nowMs - dayMs * 3).toISOString()
      },
      {
        billNumber: 'PEST-2026-0003',
        customerId: 2,
        customerName: 'Rana Nisar Ahmad',
        customerPhone: '0303-4455667',
        items: [
          { productId: 5, productName: 'Nativo 75 WG', unit: 'Pack', qty: 3, purchasePrice: 1250, unitPrice: 1500, subtotal: 4500 },
          { productId: 9, productName: 'Bt Cotton Seed FK-37', unit: 'Pack', qty: 2, purchasePrice: 3200, unitPrice: 3800, subtotal: 7600 }
        ],
        subtotal: 12100,
        discount: 100,
        tax: 0,
        totalAmount: 12000,
        paidAmount: 12000,
        dueAmount: 0,
        paymentMethod: 'EASYPAISA',
        cashierName: 'Ahmad Khan (Manager)',
        createdAt: new Date(nowMs - dayMs * 1).toISOString()
      },
      {
        billNumber: 'PEST-2026-0004',
        customerId: 4,
        customerName: 'Mian Imran Latif',
        customerPhone: '0308-1122334',
        items: [
          { productId: 7, productName: 'Engro Sona Urea (50 Kg)', unit: 'Bag', qty: 10, purchasePrice: 4400, unitPrice: 4650, subtotal: 46500 },
          { productId: 2, productName: 'Emamectin Benzoate 1.9% EC', unit: 'Bottle', qty: 2, purchasePrice: 850, unitPrice: 1100, subtotal: 2200 }
        ],
        subtotal: 48700,
        discount: 700,
        tax: 0,
        totalAmount: 48000,
        paidAmount: 48000,
        dueAmount: 0,
        paymentMethod: 'JAZZCASH',
        cashierName: 'Chaudhry Shahbaz',
        createdAt: new Date(nowMs).toISOString()
      }
    ]);

    // 6. Initial Purchases
    await db.purchases.bulkAdd([
      {
        purchaseNumber: 'PUR-2026-0001',
        supplierId: 4,
        supplierName: 'Engro Fertilizer Regional Depot',
        invoiceNo: 'ENG-INV-9921',
        items: [
          { productId: 6, productName: 'Engro DAP Fertilizer (50 Kg)', qty: 100, purchasePrice: 12200, total: 1220000 },
          { productId: 7, productName: 'Engro Sona Urea (50 Kg)', qty: 200, purchasePrice: 4400, total: 880000 }
        ],
        totalAmount: 2100000,
        paidAmount: 1900000,
        paymentStatus: 'PARTIAL',
        notes: 'Stock received at Vehari warehouse.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]);

    // 7. Initial Staff
    await db.staff.bulkAdd([
      {
        name: 'Ahmad Khan',
        phone: '0300-5556677',
        address: 'Chak 45/WB, Vehari',
        role: 'MANAGER',
        username: 'ahmad_khan',
        password: 'staff123',
        isActive: true,
        joiningDate: '2025-01-15',
        salary: 35000,
        outstandingBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Rashid Mahmood',
        phone: '0301-9988776',
        address: 'Tibba Sultan Pur',
        role: 'SALES',
        username: 'rashid_sales',
        password: 'staff123',
        isActive: true,
        joiningDate: '2025-03-20',
        salary: 25000,
        outstandingBalance: 15000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Imran Ali',
        phone: '0302-4455667',
        address: 'Luddan Road',
        role: 'WAREHOUSE',
        username: 'imran_warehouse',
        password: 'staff123',
        isActive: true,
        joiningDate: '2025-06-10',
        salary: 22000,
        outstandingBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    console.log('Seeding completed successfully!');
  }
}
