# NolMart Ops — Business, Cashflow & Stock Manager

A private, high-speed, local-first Progressive Web App (PWA) designed to manage **NolMart's** daily transactions, cash reconciliation, stock inventory, and perfume batch formulation compounding directly from your smartphone or desktop.

[![Live Web App](https://img.shields.io/badge/Live%20App-noldy22.github.io%2Fnolmart--manager-emerald?style=for-the-badge&logo=googlechrome&logoColor=white)](https://noldy22.github.io/nolmart-manager/)

### 📱 Scan to Open on Your Phone:
<p align="left">
  <img src="icons/qr-code.png" alt="Scan QR Code to Open on Phone" width="220" />
</p>

**Live URL**: [https://noldy22.github.io/nolmart-manager/](https://noldy22.github.io/nolmart-manager/)

---

## 🔒 100% Privacy Guarantee (Local-First Architecture)

- **Zero Cloud Exposure**: All transaction amounts, customer names, profits, and stock numbers are stored strictly inside your device's private browser database (**IndexedDB**).
- **Public Code, Private Data**: Even though the source code lives on GitHub (or GitHub Pages), **your financial data is never transmitted to GitHub or any remote server**. 
- **Offline Capable**: Works 100% offline with zero internet connection via service workers.
- **Portable Backups**: One-click private JSON backup and restore, plus Excel/CSV exports for your records.

---

## 🚀 Key Features

1. **Dashboard & Cash Reconciliation**:
   - **Expected Cash in Hand (Pesa Mkononi)**: Real-time calculation of total money in vs. money out.
   - **Sales Revenue & Net Profit**: Auto-computed net margin (%) based on sales minus operating expenses.
   - **Channel Breakdown**: Real-time tracking of money in M-Pesa, Cash, Airtel Money, Tigo Pesa, and Bank.
   - **Owner's Draw Tracking**: Track personal salary withdrawals separately from business operational costs.

2. **Sales & Expense Ledger**:
   - Fast "+ Record Sale" and "- Record Expense" with payment method, date, and customer info.
   - Auto-decrements inventory stock when a finished perfume or tech item is sold!
   - Full search and filtering by category, date, and type.
   - One-click export to CSV / Excel.

3. **Inventory & Low Stock Alerts**:
   - Pre-loaded with NolMart's 6ml, 10ml, and 30ml scent collection (*Coconut Passion*, *Vanilla 28*, *Now Rave*, *Pink Chiffon*, *Tom Ford Noir Extreme*, *Reef 33*, etc.).
   - Tracks raw materials (concentrated oils, cosmetic ethanol, fixatives, empty bottles, packaging bags).
   - Real-time stock warnings when items fall below your custom threshold.
   - Quick one-tap stock adjustments (+ / -).

4. **Perfume Compounding & Batch Lab**:
   - Built specifically for handcrafted oil perfume blending!
   - Enter bottle size (6ml, 10ml, 30ml) and quantity of bottles to produce.
   - Specify concentration (default 25% Oil, 5% Fixative, 70% Cosmetic Ethanol).
   - Instantly calculates:
     - Exact ml of concentrated perfume oil needed.
     - Exact ml of fixative needed.
     - Exact ml of cosmetic ethanol needed.
     - Cost per bottle, expected revenue, and net profit per batch!
   - "Produce Batch & Add to Stock" button updates raw materials and finished bottle inventory with one tap.

---

## 📲 How to Install as an App on Your Phone

### On Android (Chrome / Brave / Edge):
1. Open the website URL in Google Chrome.
2. Tap the **"Install App"** icon in the app header, or tap Chrome's three dots (`⋮`) at the top right.
3. Select **"Add to Home screen"** or **"Install app"**.
4. The NolMart icon will now sit on your phone's home screen alongside your normal mobile apps, opening full-screen without browser address bars!

### On iPhone / iPad (Safari):
1. Open the website URL in Safari.
2. Tap the **Share** button (box with an upward arrow at the bottom of the screen).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. NolMart Ops will now appear on your iPhone home screen as an app.

---

## 🌐 Deploying to GitHub Pages (Free Hosting)

1. Create a new repository on your GitHub: `nolmart-manager`.
2. Push this project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of NolMart Ops PWA"
   git branch -M main
   git remote add origin https://github.com/Noldy22/nolmart-manager.git
   git push -u origin main
   ```
3. In your GitHub repository settings:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** > **Branch**, select `main` and `/ (root)`.
   - Click **Save**.
4. Within 1-2 minutes, your app will be live at:
   `https://noldy22.github.io/nolmart-manager/`
