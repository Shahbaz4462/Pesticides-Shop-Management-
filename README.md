# Pesticide Shop Management System — Android Mobile Application

An **offline-first, mobile-responsive Android application** designed specifically for agricultural pesticide and fertilizer retail shops in Pakistan. Built with React, TypeScript, Capacitor, and IndexedDB (Dexie).

---

## 🌟 Key Features

1. **Admin & Staff Role Panel Separation**:
   - Dedicated login screens for Admin and Staff.
   - Admin access to full system (Inventory, Sales, Customers, Suppliers, Staff Management, Staff Ledger, Reports & Profits, Settings).
   - Staff panel restricted to allowed modules only.

2. **Modern Light & Dark Theme System + 3D UI**:
   - **Light Theme**: High-contrast navy text on crisp white cards with blue/cyan primary and turquoise accents.
   - **Dark Theme**: Deep charcoal background with soft purple/pink glow highlights and green positive indicators.
   - **Subtle 3D Depth**: Layered card elevation, touch micro-animations, fast transitions.

3. **Invoice Printing & Billing Fix**:
   - Fixed thermal receipt printing bug. Uses saved sale records (`billNumber`, items, quantities, prices, discounts, totals, customer info, shop header/footer/tax notes).
   - Supports 80mm POS receipts and A4 invoice formats from POS completion screen and Sales History.

4. **Sales History & Audit Edit Trail**:
   - Full sale editing capability for Admin.
   - Permanent, traceable edit history (`db.saleEditHistory`) logging modified fields, previous vs new values, admin name, and timestamps.

5. **Full Customer Ledger**:
   - Full-page customer details screen.
   - Customer profile, financial summary (purchases, paid, udhar due), purchase history, and Udhar collection notes.

6. **Full Supplier Ledger**:
   - Full-page supplier profile screen.
   - Company details, financial summary (purchased, paid, payable due), stock intake history, and debt payment tracking.

7. **Reports & Profit Margin Analytics**:
   - Dynamic 7-day sales trend bar chart accurately plotted from local sales data.
   - Revenue by category pie chart and breakdown table.

8. **Bill Printing Configuration**:
   - Admin can configure shop name, tagline, phone, address, NTN, tax info, invoice headers, and invoice footers.

9. **Staff Ledger & Management**:
   - Create staff credentials, manage roles, toggle activation, and record salary/advance payments with notes.

10. **100% Offline-First Architecture**:
    - All data stored locally in IndexedDB using Dexie. No cloud or internet connection required.

---

## 🚀 Building & Running

### Web Development Mode
```bash
npm install
npm run dev
```

### Production Web Build
```bash
npm run build
```

### Capacitor Android Sync & Build
```bash
npx cap sync
npx cap open android
```
In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
