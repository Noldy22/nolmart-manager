// js/db.js - Local-First IndexedDB Engine for NolMart Business Manager
// 100% Client-Side Storage - Perfume Artisan & Dropshipping Architecture

const DB_NAME = 'NolMartBusinessDB';
const DB_VERSION = 2; // Incremented for perfume-only inventory & SOP updates

let dbInstance = null;

export function openDatabase() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Transactions store (Income, Expenses, Capital, Draws)
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        txStore.createIndex('type', 'type', { unique: false });
        txStore.createIndex('category', 'category', { unique: false });
        txStore.createIndex('date', 'date', { unique: false });
        txStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 2. Inventory store (Raw scent oils, ethanol, fixatives, packaging only - NO tech)
      if (!db.objectStoreNames.contains('inventory')) {
        const invStore = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
        invStore.createIndex('category', 'category', { unique: false });
        invStore.createIndex('name', 'name', { unique: false });
      }

      // 3. Batches / Orders store
      if (!db.objectStoreNames.contains('batches')) {
        const batchStore = db.createObjectStore('batches', { keyPath: 'id', autoIncrement: true });
        batchStore.createIndex('date', 'date', { unique: false });
      }

      // 4. Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      checkAndSeedPerfumeInventory(dbInstance).then(() => {
        resolve(dbInstance);
      });
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Seed only physical perfume inventory (oils, ethanol, fixatives, packaging)
async function checkAndSeedPerfumeInventory(db) {
  const count = await getStoreCount(db, 'inventory');
  if (count > 0) return; // already populated

  const initialPerfumeStock = [
    // 1. Concentrated Perfume Oils (tracked in ml)
    { name: 'Coconut Passion Oil', category: 'raw_oil', scentKey: 'coconut_passion', quantity: 100, unit: 'ml', unitCost: 150, sellingPrice: 0, minThreshold: 20 },
    { name: 'Vanilla 28 Oil', category: 'raw_oil', scentKey: 'vanilla_28', quantity: 100, unit: 'ml', unitCost: 160, sellingPrice: 0, minThreshold: 20 },
    { name: 'Pink Chiffon Oil', category: 'raw_oil', scentKey: 'pink_chiffon', quantity: 100, unit: 'ml', unitCost: 150, sellingPrice: 0, minThreshold: 20 },
    { name: 'Now Rave Oil', category: 'raw_oil', scentKey: 'now_rave', quantity: 100, unit: 'ml', unitCost: 160, sellingPrice: 0, minThreshold: 20 },
    { name: 'Tom Ford Noir Extreme Oil', category: 'raw_oil', scentKey: 'noir_extreme', quantity: 100, unit: 'ml', unitCost: 180, sellingPrice: 0, minThreshold: 20 },
    { name: '212 VIP Oil', category: 'raw_oil', scentKey: '212_vip', quantity: 100, unit: 'ml', unitCost: 160, sellingPrice: 0, minThreshold: 20 },
    { name: 'Reef 33 / Obsidian Oil', category: 'raw_oil', scentKey: 'reef_33', quantity: 100, unit: 'ml', unitCost: 170, sellingPrice: 0, minThreshold: 20 },
    { name: 'Coastal Dream Oil', category: 'raw_oil', scentKey: 'coastal_dream', quantity: 100, unit: 'ml', unitCost: 150, sellingPrice: 0, minThreshold: 20 },
    { name: 'Berries Weekend Oil', category: 'raw_oil', scentKey: 'berries_weekend', quantity: 100, unit: 'ml', unitCost: 150, sellingPrice: 0, minThreshold: 20 },

    // 2. Solvents & Fixatives
    { name: 'Cosmetic Grade Ethanol 96%', category: 'raw_solvent', subCategory: 'ethanol', quantity: 2.0, unit: 'L', unitCost: 12000, sellingPrice: 0, minThreshold: 0.5 },
    { name: 'Long-Lasting Perfume Fixative', category: 'raw_solvent', subCategory: 'fixative', quantity: 250, unit: 'ml', unitCost: 180, sellingPrice: 0, minThreshold: 50 },

    // 3. Packaging Materials
    { name: 'Empty 30ml Spray Glass Bottles', category: 'packaging', subCategory: '30ml_bottle', quantity: 24, unit: 'pcs', unitCost: 2000, sellingPrice: 0, minThreshold: 8 },
    { name: 'Empty 10ml Spray Atomizer Bottles', category: 'packaging', subCategory: '10ml_bottle', quantity: 36, unit: 'pcs', unitCost: 1200, sellingPrice: 0, minThreshold: 10 },
    { name: 'Empty 6ml Roller Glass Bottles', category: 'packaging', subCategory: '6ml_bottle', quantity: 48, unit: 'pcs', unitCost: 800, sellingPrice: 0, minThreshold: 12 },
    { name: 'NolMart A6 Velvet/Packaging Bags', category: 'packaging', subCategory: 'bags', quantity: 80, unit: 'pcs', unitCost: 350, sellingPrice: 0, minThreshold: 20 },
    { name: 'NolMart Waterproof Scents Labels', category: 'packaging', subCategory: 'labels', quantity: 120, unit: 'pcs', unitCost: 250, sellingPrice: 0, minThreshold: 25 }
  ];

  const tx = db.transaction('inventory', 'readwrite');
  const store = tx.objectStore('inventory');
  for (const item of initialPerfumeStock) {
    item.lastUpdated = new Date().toISOString();
    store.add(item);
  }
}

function getStoreCount(db, storeName) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const countReq = store.count();
    countReq.onsuccess = () => resolve(countReq.result);
    countReq.onerror = () => resolve(0);
  });
}

// ==========================================
// TRANSACTIONS CRUD
// ==========================================

export async function addTransaction(transactionData) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['transactions', 'inventory'], 'readwrite');
    const txStore = tx.objectStore('transactions');
    const invStore = tx.objectStore('inventory');

    const entry = {
      ...transactionData,
      amount: parseFloat(transactionData.amount) || 0,
      quantity: parseInt(transactionData.quantity, 10) || 1,
      date: transactionData.date || new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };

    const addReq = txStore.add(entry);

    // If an inventory item is directly linked (e.g. stock replenishment or pre-made item)
    if (entry.inventoryItemId) {
      const invReq = invStore.get(entry.inventoryItemId);
      invReq.onsuccess = () => {
        const item = invReq.result;
        if (item) {
          if (entry.type === 'income') {
            item.quantity = Math.max(0, item.quantity - entry.quantity);
          } else if (entry.type === 'expense') {
            item.quantity += entry.quantity;
          }
          item.lastUpdated = new Date().toISOString();
          invStore.put(item);
        }
      };
    }

    tx.oncomplete = () => resolve(addReq.result);
    tx.onerror = (event) => reject(event.target.error);
  });
}

export async function getAllTransactions() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const req = store.getAll();

    req.onsuccess = () => {
      const items = req.result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteTransaction(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ==========================================
// INVENTORY CRUD
// ==========================================

export async function getAllInventory() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventory', 'readonly');
    const store = tx.objectStore('inventory');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addInventoryItem(item) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    const fullItem = {
      ...item,
      quantity: parseFloat(item.quantity) || 0,
      unitCost: parseFloat(item.unitCost) || 0,
      sellingPrice: parseFloat(item.sellingPrice) || 0,
      minThreshold: parseFloat(item.minThreshold) || 1,
      lastUpdated: new Date().toISOString()
    };
    const req = store.add(fullItem);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function adjustStock(id, delta) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result;
      if (!item) return reject(new Error('Item not found'));
      item.quantity = Math.max(0, item.quantity + delta);
      item.lastUpdated = new Date().toISOString();
      const putReq = store.put(item);
      putReq.onsuccess = () => resolve(item);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteInventoryItem(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ==========================================
// DEDUCT RAW INGREDIENTS FOR ON-DEMAND BLEND
// ==========================================
export async function deductIngredientsForBlend({
  primaryOilKey,
  primaryOilMl,
  secondaryOilKey = null,
  secondaryOilMl = 0,
  fixativeMl,
  ethanolMl,
  bottleSize,
  bottleCount = 1
}) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    const req = store.getAll();

    req.onsuccess = () => {
      const inventory = req.result;

      // 1. Deduct Primary Oil
      if (primaryOilKey && primaryOilMl > 0) {
        const item = inventory.find(i => i.scentKey === primaryOilKey || i.name.toLowerCase().includes(primaryOilKey.toLowerCase()));
        if (item) {
          item.quantity = Math.max(0, item.quantity - (primaryOilMl * bottleCount));
          store.put(item);
        }
      }

      // 2. Deduct Secondary Oil (if layered blend)
      if (secondaryOilKey && secondaryOilMl > 0) {
        const item = inventory.find(i => i.scentKey === secondaryOilKey || i.name.toLowerCase().includes(secondaryOilKey.toLowerCase()));
        if (item) {
          item.quantity = Math.max(0, item.quantity - (secondaryOilMl * bottleCount));
          store.put(item);
        }
      }

      // 3. Deduct Fixative
      if (fixativeMl > 0) {
        const item = inventory.find(i => i.subCategory === 'fixative' || i.name.toLowerCase().includes('fixative'));
        if (item) {
          item.quantity = Math.max(0, item.quantity - (fixativeMl * bottleCount));
          store.put(item);
        }
      }

      // 4. Deduct Ethanol (convert ml to Liters if stored in L)
      if (ethanolMl > 0) {
        const item = inventory.find(i => i.subCategory === 'ethanol' || i.name.toLowerCase().includes('ethanol'));
        if (item) {
          const litersNeeded = (ethanolMl * bottleCount) / 1000;
          item.quantity = Math.max(0, item.quantity - litersNeeded);
          store.put(item);
        }
      }

      // 5. Deduct Empty Bottle
      const bottleSubCat = `${bottleSize}ml_bottle`;
      const bottleItem = inventory.find(i => i.subCategory === bottleSubCat || i.name.includes(`${bottleSize}ml`));
      if (bottleItem) {
        bottleItem.quantity = Math.max(0, bottleItem.quantity - bottleCount);
        store.put(bottleItem);
      }

      // 6. Deduct Label & Bag
      const bagItem = inventory.find(i => i.subCategory === 'bags');
      if (bagItem) {
        bagItem.quantity = Math.max(0, bagItem.quantity - bottleCount);
        store.put(bagItem);
      }
      const labelItem = inventory.find(i => i.subCategory === 'labels');
      if (labelItem) {
        labelItem.quantity = Math.max(0, labelItem.quantity - bottleCount);
        store.put(labelItem);
      }
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// ==========================================
// FINANCIAL CALCULATIONS & REPORTING
// ==========================================
export async function getFinancialSummary(filterDateRange = 'all') {
  const transactions = await getAllTransactions();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYearMonth = todayStr.substring(0, 7);

  let filtered = transactions;
  if (filterDateRange === 'today') {
    filtered = transactions.filter(t => t.date === todayStr);
  } else if (filterDateRange === 'this_month') {
    filtered = transactions.filter(t => t.date.startsWith(currentYearMonth));
  } else if (filterDateRange === 'last_30_days') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filtered = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
  }

  let totalSales = 0;
  let totalExpenses = 0;
  let capitalInjected = 0;
  let ownersDraw = 0;

  const paymentBreakdown = {
    cash: 0,
    mpesa: 0,
    airtel: 0,
    tigo: 0,
    bank: 0
  };

  for (const t of filtered) {
    const amount = Number(t.amount) || 0;
    const method = t.paymentMethod || 'cash';

    if (t.type === 'income') {
      if (t.category === 'capital') {
        capitalInjected += amount;
      } else {
        totalSales += amount;
      }
      if (paymentBreakdown[method] !== undefined) paymentBreakdown[method] += amount;
    } else if (t.type === 'expense') {
      if (t.category === 'owner_draw') {
        ownersDraw += amount;
      } else {
        totalExpenses += amount;
      }
      if (paymentBreakdown[method] !== undefined) paymentBreakdown[method] -= amount;
    }
  }

  let allTimeMoneyIn = 0;
  let allTimeMoneyOut = 0;
  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') allTimeMoneyIn += amt;
    else if (t.type === 'expense') allTimeMoneyOut += amt;
  }

  const expectedCashInHand = allTimeMoneyIn - allTimeMoneyOut;
  const netProfit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0;

  return {
    totalSales,
    totalExpenses,
    netProfit,
    profitMargin,
    capitalInjected,
    ownersDraw,
    expectedCashInHand,
    paymentBreakdown,
    totalTransactions: filtered.length
  };
}

export async function getAllBatches() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('batches', 'readonly');
    const store = tx.objectStore('batches');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
    req.onerror = () => reject(req.error);
  });
}

export async function exportAllDataJSON() {
  const txs = await getAllTransactions();
  const inv = await getAllInventory();
  const batches = await getAllBatches();

  const backup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    appName: 'NolMart Business Manager',
    data: {
      transactions: txs,
      inventory: inv,
      batches: batches
    }
  };

  return JSON.stringify(backup, null, 2);
}

export async function importAllDataJSON(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!parsed.data || !parsed.data.transactions || !parsed.data.inventory) {
    throw new Error('Invalid NolMart backup file format.');
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['transactions', 'inventory', 'batches'], 'readwrite');
    const txStore = tx.objectStore('transactions');
    const invStore = tx.objectStore('inventory');
    const batchStore = tx.objectStore('batches');

    txStore.clear();
    invStore.clear();
    batchStore.clear();

    for (const item of parsed.data.transactions) {
      delete item.id;
      txStore.add(item);
    }
    for (const item of parsed.data.inventory) {
      delete item.id;
      invStore.add(item);
    }
    if (parsed.data.batches) {
      for (const item of parsed.data.batches) {
        delete item.id;
        batchStore.add(item);
      }
    }

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

