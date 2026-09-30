// js/db.js - Local-First IndexedDB Engine for NolMart Business Manager
// 100% Client-Side Storage - Zero Remote Server Exposure

const DB_NAME = 'NolMartBusinessDB';
const DB_VERSION = 1;

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
        txStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
      }

      // 2. Inventory store (Finished bottles, raw oils, ethanol, packaging, tech)
      if (!db.objectStoreNames.contains('inventory')) {
        const invStore = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
        invStore.createIndex('category', 'category', { unique: false });
        invStore.createIndex('name', 'name', { unique: false });
      }

      // 3. Batches store (Formulation records, blending history)
      if (!db.objectStoreNames.contains('batches')) {
        const batchStore = db.createObjectStore('batches', { keyPath: 'id', autoIncrement: true });
        batchStore.createIndex('date', 'date', { unique: false });
      }

      // 4. Settings store (Preferences, app settings)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      // Auto-seed initial catalog if newly opened
      checkAndSeedInitialData(dbInstance).then(() => {
        resolve(dbInstance);
      });
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Seed default products and raw materials on first launch
async function checkAndSeedInitialData(db) {
  const count = await getStoreCount(db, 'inventory');
  if (count > 0) return; // already seeded

  const defaultInventory = [
    // Finished Perfumes - 30ml Sprays (35,000 TZS)
    { name: 'Coconut Passion + Vanilla 28 (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 8, unit: 'bottles', unitCost: 9500, sellingPrice: 35000, minThreshold: 2 },
    { name: 'Coconut Passion (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 5, unit: 'bottles', unitCost: 9000, sellingPrice: 35000, minThreshold: 2 },
    { name: 'Vanilla 28 (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 6, unit: 'bottles', unitCost: 9500, sellingPrice: 35000, minThreshold: 2 },
    { name: 'Pink Chiffon (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 5, unit: 'bottles', unitCost: 9000, sellingPrice: 35000, minThreshold: 2 },
    { name: 'Now Rave (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 7, unit: 'bottles', unitCost: 9500, sellingPrice: 35000, minThreshold: 2 },
    { name: 'Tom Ford Noir Extreme (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 6, unit: 'bottles', unitCost: 11000, sellingPrice: 35000, minThreshold: 2 },
    { name: '212 VIP (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 4, unit: 'bottles', unitCost: 10000, sellingPrice: 35000, minThreshold: 2 },
    { name: 'Reef 33 / Obsidian (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 5, unit: 'bottles', unitCost: 10500, sellingPrice: 35000, minThreshold: 2 },
    { name: 'Coastal Dream (30ml)', category: 'finished_perfume', subCategory: '30ml', quantity: 4, unit: 'bottles', unitCost: 9000, sellingPrice: 35000, minThreshold: 2 },

    // Finished Perfumes - 10ml Sprays (15,000 TZS)
    { name: 'Coconut Passion + Vanilla 28 (10ml)', category: 'finished_perfume', subCategory: '10ml', quantity: 12, unit: 'bottles', unitCost: 4000, sellingPrice: 15000, minThreshold: 3 },
    { name: 'Now Rave (10ml)', category: 'finished_perfume', subCategory: '10ml', quantity: 10, unit: 'bottles', unitCost: 4000, sellingPrice: 15000, minThreshold: 3 },
    { name: 'Tom Ford Noir Extreme (10ml)', category: 'finished_perfume', subCategory: '10ml', quantity: 8, unit: 'bottles', unitCost: 4500, sellingPrice: 15000, minThreshold: 3 },
    { name: 'Pink Chiffon (10ml)', category: 'finished_perfume', subCategory: '10ml', quantity: 10, unit: 'bottles', unitCost: 4000, sellingPrice: 15000, minThreshold: 3 },
    { name: 'Reef 33 (10ml)', category: 'finished_perfume', subCategory: '10ml', quantity: 8, unit: 'bottles', unitCost: 4500, sellingPrice: 15000, minThreshold: 3 },

    // Finished Perfumes - 6ml Rollers (7,000 TZS)
    { name: 'Coconut Passion (6ml Roller)', category: 'finished_perfume', subCategory: '6ml', quantity: 15, unit: 'bottles', unitCost: 2200, sellingPrice: 7000, minThreshold: 5 },
    { name: 'Vanilla 28 (6ml Roller)', category: 'finished_perfume', subCategory: '6ml', quantity: 15, unit: 'bottles', unitCost: 2200, sellingPrice: 7000, minThreshold: 5 },
    { name: 'Now Rave (6ml Roller)', category: 'finished_perfume', subCategory: '6ml', quantity: 12, unit: 'bottles', unitCost: 2200, sellingPrice: 7000, minThreshold: 5 },
    { name: 'Pink Chiffon (6ml Roller)', category: 'finished_perfume', subCategory: '6ml', quantity: 14, unit: 'bottles', unitCost: 2200, sellingPrice: 7000, minThreshold: 5 },
    { name: 'Reef 33 (6ml Roller)', category: 'finished_perfume', subCategory: '6ml', quantity: 12, unit: 'bottles', unitCost: 2500, sellingPrice: 7000, minThreshold: 5 },

    // Raw Materials
    { name: 'Concentrated Perfume Oils (Assorted)', category: 'raw_material', subCategory: 'oil', quantity: 450, unit: 'ml', unitCost: 150, sellingPrice: 0, minThreshold: 100 },
    { name: 'Cosmetic Grade Ethanol (96%)', category: 'raw_material', subCategory: 'solvent', quantity: 2.5, unit: 'L', unitCost: 12000, sellingPrice: 0, minThreshold: 1.0 },
    { name: 'Long-Lasting Perfume Fixative', category: 'raw_material', subCategory: 'fixative', quantity: 180, unit: 'ml', unitCost: 180, sellingPrice: 0, minThreshold: 50 },

    // Packaging Materials
    { name: 'Empty 30ml Spray Bottles with Caps', category: 'packaging', subCategory: 'bottle', quantity: 24, unit: 'pcs', unitCost: 2000, sellingPrice: 0, minThreshold: 10 },
    { name: 'Empty 10ml Spray Bottles', category: 'packaging', subCategory: 'bottle', quantity: 36, unit: 'pcs', unitCost: 1200, sellingPrice: 0, minThreshold: 15 },
    { name: 'Empty 6ml Roller Bottles with Rollers', category: 'packaging', subCategory: 'bottle', quantity: 48, unit: 'pcs', unitCost: 800, sellingPrice: 0, minThreshold: 20 },
    { name: 'A6 NolMart Branding Packaging Bags', category: 'packaging', subCategory: 'bags', quantity: 80, unit: 'pcs', unitCost: 350, sellingPrice: 0, minThreshold: 25 },
    { name: 'NolMart Waterproof Product Stickers/Labels', category: 'packaging', subCategory: 'labels', quantity: 120, unit: 'pcs', unitCost: 250, sellingPrice: 0, minThreshold: 30 },

    // Electronics & Tech
    { name: 'Oraimo FreePods Neo Earbuds', category: 'tech_gadget', subCategory: 'audio', quantity: 4, unit: 'pcs', unitCost: 45000, sellingPrice: 65000, minThreshold: 2 },
    { name: 'Oraimo Smart Blender', category: 'tech_gadget', subCategory: 'home', quantity: 2, unit: 'pcs', unitCost: 85000, sellingPrice: 125000, minThreshold: 1 },
    { name: 'Oraimo Smart Kettle', category: 'tech_gadget', subCategory: 'home', quantity: 3, unit: 'pcs', unitCost: 60000, sellingPrice: 90000, minThreshold: 1 }
  ];

  const tx = db.transaction('inventory', 'readwrite');
  const store = tx.objectStore('inventory');
  for (const item of defaultInventory) {
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

    // If this transaction is a sale and linked to an inventory item, auto-decrement stock
    if (entry.type === 'income' && entry.inventoryItemId) {
      const invReq = invStore.get(entry.inventoryItemId);
      invReq.onsuccess = () => {
        const item = invReq.result;
        if (item && item.quantity >= entry.quantity) {
          item.quantity -= entry.quantity;
          item.lastUpdated = new Date().toISOString();
          invStore.put(item);
        }
      };
    }

    // If this transaction is a stock purchase restock, auto-increment stock if linked
    if (entry.type === 'expense' && entry.inventoryItemId) {
      const invReq = invStore.get(entry.inventoryItemId);
      invReq.onsuccess = () => {
        const item = invReq.result;
        if (item) {
          item.quantity += entry.quantity;
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
      // Sort newest first
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

export async function updateInventoryItem(id, updates) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const current = getReq.result;
      if (!current) {
        reject(new Error('Item not found'));
        return;
      }
      const updated = {
        ...current,
        ...updates,
        quantity: parseFloat(updates.quantity !== undefined ? updates.quantity : current.quantity),
        unitCost: parseFloat(updates.unitCost !== undefined ? updates.unitCost : current.unitCost),
        sellingPrice: parseFloat(updates.sellingPrice !== undefined ? updates.sellingPrice : current.sellingPrice),
        minThreshold: parseFloat(updates.minThreshold !== undefined ? updates.minThreshold : current.minThreshold),
        lastUpdated: new Date().toISOString()
      };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve(updated);
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

// Adjust quantity by + or - delta
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

// ==========================================
// BATCHES (PERFUME FORMULATION)
// ==========================================

export async function addBatch(batchData) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['batches', 'inventory'], 'readwrite');
    const batchStore = tx.objectStore('batches');
    const invStore = tx.objectStore('inventory');

    const entry = {
      ...batchData,
      date: batchData.date || new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };

    const addReq = batchStore.add(entry);

    // If user opts to deduct raw materials & add finished bottles
    if (batchData.autoUpdateInventory) {
      const allInvReq = invStore.getAll();
      allInvReq.onsuccess = () => {
        const inventory = allInvReq.result;

        // Deduct oil
        const oilItem = inventory.find(i => i.subCategory === 'oil');
        if (oilItem) {
          oilItem.quantity = Math.max(0, oilItem.quantity - (batchData.oilVolume || 0));
          invStore.put(oilItem);
        }

        // Deduct fixative
        const fixItem = inventory.find(i => i.subCategory === 'fixative');
        if (fixItem) {
          fixItem.quantity = Math.max(0, fixItem.quantity - (batchData.fixativeVolume || 0));
          invStore.put(fixItem);
        }

        // Deduct ethanol (in Liters if inventory is in L, or ml)
        const ethItem = inventory.find(i => i.subCategory === 'solvent');
        if (ethItem) {
          const ethLiters = (batchData.ethanolVolume || 0) / 1000;
          ethItem.quantity = Math.max(0, ethItem.quantity - ethLiters);
          invStore.put(ethItem);
        }

        // Deduct empty bottles
        const emptyBottleItem = inventory.find(i => i.category === 'packaging' && i.name.includes(batchData.bottleSize));
        if (emptyBottleItem) {
          emptyBottleItem.quantity = Math.max(0, emptyBottleItem.quantity - (batchData.bottleCount || 0));
          invStore.put(emptyBottleItem);
        }

        // Increment finished perfume
        const finishedItem = inventory.find(i => i.category === 'finished_perfume' && i.name.includes(batchData.scentName) && i.name.includes(batchData.bottleSize));
        if (finishedItem) {
          finishedItem.quantity += (batchData.bottleCount || 0);
          invStore.put(finishedItem);
        }
      };
    }

    tx.oncomplete = () => resolve(addReq.result);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllBatches() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('batches', 'readonly');
    const store = tx.objectStore('batches');
    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

// ==========================================
// FINANCIAL CALCULATIONS & REPORTING
// ==========================================

export async function getFinancialSummary(filterDateRange = 'all') {
  const transactions = await getAllTransactions();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM

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

  const categoryBreakdown = {};

  for (const t of filtered) {
    const amount = Number(t.amount) || 0;
    const method = t.paymentMethod || 'cash';

    if (t.type === 'income') {
      if (t.category === 'capital') {
        capitalInjected += amount;
      } else {
        totalSales += amount;
      }

      if (paymentBreakdown[method] !== undefined) {
        paymentBreakdown[method] += amount;
      }
    } else if (t.type === 'expense') {
      if (t.category === 'owner_draw') {
        ownersDraw += amount;
      } else {
        totalExpenses += amount;
      }

      if (paymentBreakdown[method] !== undefined) {
        paymentBreakdown[method] -= amount;
      }
    }

    // Category tracking
    const cat = t.category || 'other';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amount;
  }

  // All-time Cash in Hand reconciliation (from inception)
  let allTimeMoneyIn = 0;
  let allTimeMoneyOut = 0;

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      allTimeMoneyIn += amt;
    } else if (t.type === 'expense') {
      allTimeMoneyOut += amt;
    }
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
    categoryBreakdown,
    totalTransactions: filtered.length
  };
}

// ==========================================
// BACKUP & RESTORE (PRIVACY PRESERVING)
// ==========================================

export async function exportAllDataJSON() {
  const db = await openDatabase();
  const txs = await getAllTransactions();
  const inv = await getAllInventory();
  const batches = await getAllBatches();

  const backup = {
    version: '1.0',
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

    // Clear existing stores
    txStore.clear();
    invStore.clear();
    batchStore.clear();

    // Import transactions
    for (const item of parsed.data.transactions) {
      delete item.id; // allow new keys or keep clean
      txStore.add(item);
    }

    // Import inventory
    for (const item of parsed.data.inventory) {
      delete item.id;
      invStore.add(item);
    }

    // Import batches if present
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

export async function clearAllLocalData() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['transactions', 'inventory', 'batches'], 'readwrite');
    tx.objectStore('transactions').clear();
    tx.objectStore('inventory').clear();
    tx.objectStore('batches').clear();

    tx.oncomplete = () => {
      // Re-seed with fresh baseline inventory
      checkAndSeedInitialData(db).then(() => resolve(true));
    };
    tx.onerror = (e) => reject(e.target.error);
  });
}
