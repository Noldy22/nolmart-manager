// js/db.js - Local-First IndexedDB Engine for NolMart Business Manager
// 100% Client-Side Storage - Perfume Artisan & Dropshipping Architecture

const DB_NAME = 'NolMartBusinessDB';
const DB_VERSION = 3; // Incremented for Car Air Freshener SOP v1.2 and Gifts tracking engine

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

      // 5. Gifts store (Complimentary give-aways, samples & influencer PR)
      if (!db.objectStoreNames.contains('gifts')) {
        const giftStore = db.createObjectStore('gifts', { keyPath: 'id', autoIncrement: true });
        giftStore.createIndex('date', 'date', { unique: false });
        giftStore.createIndex('productType', 'productType', { unique: false });
        giftStore.createIndex('purpose', 'purpose', { unique: false });
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
    // 1. Core Essential Oils from NolMart SOP v3.1 (tracked in ml)
    { name: 'Now Rave Essential Oil', category: 'raw_oil', scentKey: 'now_rave', quantity: 100, unit: 'ml', unitCost: 160, sellingPrice: 0, minThreshold: 20 },
    { name: 'Coconut Passion Essential Oil', category: 'raw_oil', scentKey: 'coconut_passion', quantity: 100, unit: 'ml', unitCost: 150, sellingPrice: 0, minThreshold: 20 },
    { name: 'Vanilla 28 Essential Oil', category: 'raw_oil', scentKey: 'vanilla_28', quantity: 100, unit: 'ml', unitCost: 160, sellingPrice: 0, minThreshold: 20 },
    { name: 'Pink Chiffon Essential Oil', category: 'raw_oil', scentKey: 'pink_chiffon', quantity: 100, unit: 'ml', unitCost: 150, sellingPrice: 0, minThreshold: 20 },
    { name: 'Tom Ford Noir Extreme Essential Oil', category: 'raw_oil', scentKey: 'noir_extreme', quantity: 100, unit: 'ml', unitCost: 180, sellingPrice: 0, minThreshold: 20 },
    { name: 'Reef Essential Oil', category: 'raw_oil', scentKey: 'reef', quantity: 100, unit: 'ml', unitCost: 170, sellingPrice: 0, minThreshold: 20 },
    { name: 'Burberry Weekend Essential Oil', category: 'raw_oil', scentKey: 'burberry_weekend', quantity: 100, unit: 'ml', unitCost: 160, sellingPrice: 0, minThreshold: 20 },
    { name: 'Marshmallow Essential Oil', category: 'raw_oil', scentKey: 'marshmallow', quantity: 100, unit: 'ml', unitCost: 150, sellingPrice: 0, minThreshold: 20 },
    { name: '212 VIP Men Essential Oil', category: 'raw_oil', scentKey: '212_vip_men', quantity: 100, unit: 'ml', unitCost: 170, sellingPrice: 0, minThreshold: 20 },
    ...NEW_CORE_OILS,

    // 2. Solvents & Fixatives (SOP 60:40 standard)
    { name: 'Perfumery Ethanol (96%)', category: 'raw_solvent', subCategory: 'ethanol', quantity: 2.0, unit: 'L', unitCost: 12000, sellingPrice: 0, minThreshold: 0.5 },
    { name: 'Long-Lasting Perfume Fixative', category: 'raw_solvent', subCategory: 'fixative', quantity: 250, unit: 'ml', unitCost: 180, sellingPrice: 0, minThreshold: 50 },

    // 3. Packaging Materials
    { name: 'Empty 30ml Spray Glass Bottles', category: 'packaging', subCategory: '30ml_bottle', quantity: 24, unit: 'pcs', unitCost: 2000, sellingPrice: 0, minThreshold: 8 },
    { name: 'Empty 10ml Spray Atomizer Bottles', category: 'packaging', subCategory: '10ml_bottle', quantity: 36, unit: 'pcs', unitCost: 1200, sellingPrice: 0, minThreshold: 10 },
    { name: 'Empty 6ml Roller Glass Bottles', category: 'packaging', subCategory: '6ml_bottle', quantity: 48, unit: 'pcs', unitCost: 800, sellingPrice: 0, minThreshold: 12 },
    { name: 'NolMart A6 Packaging Bags', category: 'packaging', subCategory: 'bags', quantity: 80, unit: 'pcs', unitCost: 350, sellingPrice: 0, minThreshold: 20 },
    { name: 'NolMart Waterproof Scents Labels', category: 'packaging', subCategory: 'labels', quantity: 120, unit: 'pcs', unitCost: 250, sellingPrice: 0, minThreshold: 25 },

    // 4. Car Air Fresheners (finished units)
    { name: 'Strawberry Car Air Freshener (finished units)', category: 'car_freshener', subCategory: 'car_freshener_unit', quantity: 0, unit: 'pcs', unitCost: 0, sellingPrice: 10000, minThreshold: 3 }
  ];

  const tx = db.transaction('inventory', 'readwrite');
  const store = tx.objectStore('inventory');
  for (const item of initialPerfumeStock) {
    item.lastUpdated = new Date().toISOString();
    store.add({ ...item });
  }
  return new Promise((resolve) => { tx.oncomplete = () => resolve(); tx.onerror = () => resolve(); });
}

// Oils added after launch (Oct 2026). Quantity starts at 0 — set real stock with "Restock".
const NEW_CORE_OILS = [
  { name: 'Club de Nuit Essential Oil', category: 'raw_oil', scentKey: 'club_de_nuit', quantity: 0, unit: 'ml', unitCost: 0, sellingPrice: 0, minThreshold: 20 },
  { name: 'Sauvage Dior Essential Oil', category: 'raw_oil', scentKey: 'sauvage_dior', quantity: 0, unit: 'ml', unitCost: 0, sellingPrice: 0, minThreshold: 20 },
  { name: 'Strawberry Essential Oil', category: 'raw_oil', scentKey: 'strawberry', quantity: 0, unit: 'ml', unitCost: 0, sellingPrice: 0, minThreshold: 20 }
];

// Idempotent migration: adds any missing core oil / car-freshener rows to existing databases
export async function ensureCoreStock() {
  const db = await openDatabase();
  const inventory = await getAllInventory();
  const missing = NEW_CORE_OILS.filter(o =>
    !inventory.some(i => i.scentKey === o.scentKey || (i.name || '').toLowerCase() === o.name.toLowerCase())
  );
  if (!inventory.some(i => i.category === 'car_freshener')) {
    missing.push({ name: 'Strawberry Car Air Freshener (finished units)', category: 'car_freshener', subCategory: 'car_freshener_unit', quantity: 0, unit: 'pcs', unitCost: 0, sellingPrice: 10000, minThreshold: 3 });
  }
  if (!inventory.some(i => i.subCategory === 'dpg' || (i.name || '').toLowerCase().includes('dipropylene'))) {
    missing.push({ name: 'Dipropylene Glycol (DPG Carrier)', category: 'raw_solvent', subCategory: 'dpg', quantity: 245, unit: 'ml', unitCost: 33, sellingPrice: 0, minThreshold: 50 });
  }
  if (!inventory.some(i => i.subCategory === 'car_diffuser_bottle' || (i.name || '').toLowerCase().includes('diffuser bottle'))) {
    missing.push({ name: 'Empty Car Diffuser Bottles (10ml Glass + Plug + Wooden Cap + Cord)', category: 'packaging', subCategory: 'car_diffuser_bottle', quantity: 20, unit: 'pcs', unitCost: 1000, sellingPrice: 0, minThreshold: 5 });
  }
  if (missing.length === 0) return 0;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    missing.forEach(item => store.add({ ...item, lastUpdated: new Date().toISOString() }));
    tx.oncomplete = () => resolve(missing.length);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// Local calendar date (YYYY-MM-DD) in the device's timezone (EAT), not UTC
export function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
// SETTINGS (key/value)
// ==========================================
export async function getSetting(key, fallback = null) {
  const db = await openDatabase();
  return new Promise((resolve) => {
    const req = db.transaction('settings', 'readonly').objectStore('settings').get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : fallback);
    req.onerror = () => resolve(fallback);
  });
}

export async function setSetting(key, value) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put({ key, value });
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
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
      fee: parseFloat(transactionData.fee) || 0,
      quantity: parseInt(transactionData.quantity, 10) || 1,
      date: transactionData.date || localDateStr(),
      timestamp: Date.now()
    };

    // If deductions metadata is provided, save it on the entry so deletion can reverse it
    if (transactionData.deductions && Array.isArray(transactionData.deductions)) {
      entry.deductions = transactionData.deductions;
    }

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
    const tx = db.transaction(['transactions', 'inventory'], 'readwrite');
    const txStore = tx.objectStore('transactions');
    const invStore = tx.objectStore('inventory');

    const getReq = txStore.get(id);
    getReq.onsuccess = () => {
      const txData = getReq.result;
      if (!txData) {
        txStore.delete(id);
        return;
      }

      // 1. Revert deductions if any (e.g. SOP blend ingredients or car freshener units)
      if (txData.deductions && Array.isArray(txData.deductions)) {
        for (const d of txData.deductions) {
          if (d.id && d.qty) {
            const itemReq = invStore.get(d.id);
            itemReq.onsuccess = () => {
              const item = itemReq.result;
              if (item) {
                item.quantity = +(item.quantity + Number(d.qty)).toFixed(2);
                item.lastUpdated = new Date().toISOString();
                invStore.put(item);
              }
            };
          }
        }
      }

      // 2. Revert single-item linked inventory if inventoryItemId was recorded
      if (txData.inventoryItemId) {
        const itemReq = invStore.get(txData.inventoryItemId);
        itemReq.onsuccess = () => {
          const item = itemReq.result;
          if (item) {
            if (txData.type === 'income') {
              // Was a sale that decremented stock -> restore it
              item.quantity = +(item.quantity + (txData.quantity || 1)).toFixed(2);
            } else if (txData.type === 'expense') {
              // Was a restock that incremented stock -> deduct it back
              const deductQty = txData.restockQty || txData.quantity || 1;
              item.quantity = Math.max(0, +(item.quantity - deductQty).toFixed(2));
            }
            item.lastUpdated = new Date().toISOString();
            invStore.put(item);
          }
        };
      }

      // 3. Delete the transaction record
      txStore.delete(id);
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
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
// RESTOCK INVENTORY (ONE-STEP RESTOCK + EXPENSE LOGGING)
// ==========================================
export async function restockInventoryItem({ itemId, quantity, totalCost = 0, paymentMethod = 'cash', date = null, notes = '' }) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['inventory', 'transactions'], 'readwrite');
    const invStore = tx.objectStore('inventory');
    const txStore = tx.objectStore('transactions');

    const getReq = invStore.get(itemId);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (!item) return reject(new Error('Item not found'));
      const addQty = parseFloat(quantity) || 0;
      item.quantity = +(item.quantity + addQty).toFixed(2);
      item.lastUpdated = new Date().toISOString();
      invStore.put(item);

      const cost = parseFloat(totalCost) || 0;
      let txId = null;
      if (cost > 0) {
        const txEntry = {
          type: 'expense',
          category: 'raw_materials',
          description: `Restock: ${item.name} (+${addQty} ${item.unit || 'units'})`,
          amount: cost,
          fee: 0,
          quantity: 1,
          restockQty: addQty,
          paymentMethod: paymentMethod || 'cash',
          inventoryItemId: item.id,
          date: date || localDateStr(),
          timestamp: Date.now(),
          notes: notes || `Restocked ${addQty} ${item.unit || 'units'}`
        };
        const addTxReq = txStore.add(txEntry);
        addTxReq.onsuccess = () => { txId = addTxReq.result; };
      }
      tx.oncomplete = () => resolve({ item, txId });
    };
    getReq.onerror = () => reject(getReq.error);
    tx.onerror = (e) => reject(e.target.error);
  });
}

// ==========================================
// DEDUCT RAW INGREDIENTS FOR ON-DEMAND BLEND (SOP 60:40)
// ==========================================
export async function deductIngredientsForBlend({
  ingredients = [],
  primaryOilKey = null,
  primaryOilMl = 0,
  secondaryOilKey = null,
  secondaryOilMl = 0,
  fixativeDrops = 3,
  fixativeMl = 0,
  ethanolMl = 0,
  dpgMl = 0,
  isCarFreshener = false,
  bottleSize = 30,
  bottleCount = 1
}) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    const req = store.getAll();

    req.onsuccess = () => {
      const inventory = req.result;
      const deductions = [];

      // 1. Deduct Oils from Ingredients Array (multi-oil blends like 2-scent or 3-scent Paradise Mist)
      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          if (ing.ml > 0) {
            const item = inventory.find(i => 
              (ing.key && i.scentKey === ing.key) || 
              i.name.toLowerCase().includes(ing.name.toLowerCase().replace(' essential oil', '').trim())
            );
            if (item) {
              const qtyDeduct = +(ing.ml * bottleCount).toFixed(2);
              item.quantity = Math.max(0, +(item.quantity - qtyDeduct).toFixed(2));
              item.lastUpdated = new Date().toISOString();
              store.put(item);
              deductions.push({ id: item.id, name: item.name, qty: qtyDeduct, unit: item.unit });
            }
          }
        }
      } else {
        // Fallback for direct key arguments
        if (primaryOilKey && primaryOilMl > 0) {
          const item = inventory.find(i => i.scentKey === primaryOilKey || i.name.toLowerCase().includes(primaryOilKey.toLowerCase()));
          if (item) {
            const qtyDeduct = +(primaryOilMl * bottleCount).toFixed(2);
            item.quantity = Math.max(0, +(item.quantity - qtyDeduct).toFixed(2));
            item.lastUpdated = new Date().toISOString();
            store.put(item);
            deductions.push({ id: item.id, name: item.name, qty: qtyDeduct, unit: item.unit });
          }
        }
        if (secondaryOilKey && secondaryOilMl > 0) {
          const item = inventory.find(i => i.scentKey === secondaryOilKey || i.name.toLowerCase().includes(secondaryOilKey.toLowerCase()));
          if (item) {
            const qtyDeduct = +(secondaryOilMl * bottleCount).toFixed(2);
            item.quantity = Math.max(0, +(item.quantity - qtyDeduct).toFixed(2));
            item.lastUpdated = new Date().toISOString();
            store.put(item);
            deductions.push({ id: item.id, name: item.name, qty: qtyDeduct, unit: item.unit });
          }
        }
      }

      // 2. Deduct Fixative (3 drops per bottle ~ 0.15ml)
      const fixativeDeductMl = fixativeMl > 0 ? fixativeMl : ((fixativeDrops || 3) * 0.05);
      const fixativeItem = inventory.find(i => i.subCategory === 'fixative' || i.name.toLowerCase().includes('fixative'));
      if (fixativeItem) {
        const qtyDeduct = +(fixativeDeductMl * bottleCount).toFixed(2);
        fixativeItem.quantity = Math.max(0, +(fixativeItem.quantity - qtyDeduct).toFixed(2));
        fixativeItem.lastUpdated = new Date().toISOString();
        store.put(fixativeItem);
        deductions.push({ id: fixativeItem.id, name: fixativeItem.name, qty: qtyDeduct, unit: fixativeItem.unit });
      }

      // 3. Deduct Ethanol (convert ml to Liters if stored in L)
      if (ethanolMl > 0) {
        const ethanolItem = inventory.find(i => i.subCategory === 'ethanol' || i.name.toLowerCase().includes('ethanol'));
        if (ethanolItem) {
          const litersNeeded = +((ethanolMl * bottleCount) / 1000).toFixed(3);
          ethanolItem.quantity = Math.max(0, +(ethanolItem.quantity - litersNeeded).toFixed(3));
          ethanolItem.lastUpdated = new Date().toISOString();
          store.put(ethanolItem);
          deductions.push({ id: ethanolItem.id, name: ethanolItem.name, qty: litersNeeded, unit: ethanolItem.unit });
        }
      }

      // 4. Deduct DPG Carrier if present
      if (dpgMl > 0) {
        const dpgItem = inventory.find(i => i.subCategory === 'dpg' || i.name.toLowerCase().includes('dipropylene'));
        if (dpgItem) {
          const qtyDeduct = +(dpgMl * bottleCount).toFixed(2);
          dpgItem.quantity = Math.max(0, +(dpgItem.quantity - qtyDeduct).toFixed(2));
          dpgItem.lastUpdated = new Date().toISOString();
          store.put(dpgItem);
          deductions.push({ id: dpgItem.id, name: dpgItem.name, qty: qtyDeduct, unit: dpgItem.unit });
        }
      }

      // 5. Deduct Empty Bottle / Container
      if (isCarFreshener) {
        const carBottleItem = inventory.find(i => i.subCategory === 'car_diffuser_bottle' || i.subCategory === 'car_freshener_unit' || i.category === 'car_freshener');
        if (carBottleItem) {
          carBottleItem.quantity = Math.max(0, carBottleItem.quantity - bottleCount);
          carBottleItem.lastUpdated = new Date().toISOString();
          store.put(carBottleItem);
          deductions.push({ id: carBottleItem.id, name: carBottleItem.name, qty: bottleCount, unit: carBottleItem.unit });
        }
      } else {
        const bottleSubCat = `${bottleSize}ml_bottle`;
        const bottleItem = inventory.find(i => i.subCategory === bottleSubCat || i.name.includes(`${bottleSize}ml`));
        if (bottleItem) {
          bottleItem.quantity = Math.max(0, bottleItem.quantity - bottleCount);
          bottleItem.lastUpdated = new Date().toISOString();
          store.put(bottleItem);
          deductions.push({ id: bottleItem.id, name: bottleItem.name, qty: bottleCount, unit: bottleItem.unit });
        }
      }

      // 5. Deduct Packaging Bag & Scent Label
      const bagItem = inventory.find(i => i.subCategory === 'bags' || i.name.toLowerCase().includes('bag'));
      if (bagItem) {
        bagItem.quantity = Math.max(0, bagItem.quantity - bottleCount);
        bagItem.lastUpdated = new Date().toISOString();
        store.put(bagItem);
        deductions.push({ id: bagItem.id, name: bagItem.name, qty: bottleCount, unit: bagItem.unit });
      }
      const labelItem = inventory.find(i => i.subCategory === 'labels' || i.name.toLowerCase().includes('label'));
      if (labelItem) {
        labelItem.quantity = Math.max(0, labelItem.quantity - bottleCount);
        labelItem.lastUpdated = new Date().toISOString();
        store.put(labelItem);
        deductions.push({ id: labelItem.id, name: labelItem.name, qty: bottleCount, unit: labelItem.unit });
      }

      tx.oncomplete = () => resolve(deductions);
    };

    tx.onerror = (e) => reject(e.target.error);
  });
}

// ==========================================
// FINANCIAL CALCULATIONS & REPORTING
// ==========================================
export async function getFinancialSummary(filterDateRange = 'all') {
  const transactions = await getAllTransactions();
  const todayStr = localDateStr();
  const currentYearMonth = todayStr.substring(0, 7);

  let filtered = transactions;
  if (filterDateRange === 'today') {
    filtered = transactions.filter(t => t.date === todayStr);
  } else if (filterDateRange === 'this_month') {
    filtered = transactions.filter(t => t.date && t.date.startsWith(currentYearMonth));
  } else if (filterDateRange === 'last_30_days') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = localDateStr(thirtyDaysAgo);
    filtered = transactions.filter(t => (t.date || '') >= thirtyDaysStr);
  }

  let totalSales = 0;
  let totalExpenses = 0;
  let capitalInjected = 0;
  let ownersDraw = 0;
  let carFreshenerSales = 0;
  let carFreshenerUnits = 0;
  let carFreshenerCount = 0;
  let salesCount = 0;

  const paymentBreakdown = {
    cash: 0,
    mpesa: 0,
    airtel: 0,
    selcom: 0,
    bank: 0,
    tigo: 0
  };

  let allTimeMoneyIn = 0;
  let allTimeMoneyOut = 0;

  // Calculate cumulative balances per payment channel across all-time
  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    const fee = Number(t.fee) || 0;
    const method = (t.paymentMethod || 'cash').toLowerCase();

    if (t.type === 'income') {
      allTimeMoneyIn += amt;
      if (paymentBreakdown[method] !== undefined) {
        paymentBreakdown[method] += amt;
      }
    } else if (t.type === 'expense') {
      const totalOut = amt + fee;
      allTimeMoneyOut += totalOut;
      if (paymentBreakdown[method] !== undefined) {
        paymentBreakdown[method] -= totalOut;
      }
    } else if (t.type === 'transfer') {
      const fromMethod = (t.fromMethod || t.paymentMethod || 'cash').toLowerCase();
      const toMethod = (t.toMethod || '').toLowerCase();
      const totalOut = amt + fee;

      // Only the transaction fee leaves the total business cash in hand
      allTimeMoneyOut += fee;

      // Source account loses principal + fee
      if (paymentBreakdown[fromMethod] !== undefined) {
        paymentBreakdown[fromMethod] -= totalOut;
      }
      // Destination account gains principal
      if (paymentBreakdown[toMethod] !== undefined) {
        paymentBreakdown[toMethod] += amt;
      }
    }
  }

  // Calculate period-filtered income, expenses, and net profit
  for (const t of filtered) {
    const amount = Number(t.amount) || 0;
    const fee = Number(t.fee) || 0;
    const totalOutflow = amount + fee;

    if (t.type === 'income') {
      if (t.category === 'capital') {
        capitalInjected += amount;
      } else if (t.category === 'balance_adjustment') {
        // Exclude balance_adjustment surplus from operating sales revenue!
      } else {
        totalSales += amount;
        salesCount += 1;
        if (t.category === 'car_freshener_sale') {
          carFreshenerSales += amount;
          carFreshenerUnits += Number(t.quantity) || 1;
          carFreshenerCount += 1;
        }
      }
    } else if (t.type === 'expense') {
      if (t.category === 'owner_draw') {
        ownersDraw += totalOutflow;
      } else if (t.category === 'balance_adjustment') {
        // Exclude balance_adjustment shortfall from operating expenses!
      } else {
        totalExpenses += totalOutflow;
      }
    } else if (t.type === 'transfer') {
      // The moved principal is not an expense, but the transfer fee IS a financial transaction expense
      if (fee > 0) {
        totalExpenses += fee;
      }
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
    carFreshenerSales,
    carFreshenerUnits,
    carFreshenerCount,
    salesCount,
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

// ==========================================
// GIFTS & COMPLIMENTARY SAMPLES (MARKETING ENGINE)
// ==========================================
export async function getAllGifts() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('gifts', 'readonly');
    const store = tx.objectStore('gifts');
    const req = store.getAll();
    req.onsuccess = () => {
      const list = req.result || [];
      list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id - a.id));
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function addGift(gift) {
  const db = await openDatabase();
  const fullGift = {
    ...gift,
    date: gift.date || localDateStr(),
    timestamp: Date.now()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('gifts', 'readwrite');
    const store = tx.objectStore('gifts');
    const req = store.add(fullGift);
    req.onsuccess = () => resolve({ id: req.result, ...fullGift });
    req.onerror = () => reject(req.error);
  });
}

export async function deleteGift(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['gifts', 'inventory'], 'readwrite');
    const giftStore = tx.objectStore('gifts');
    const invStore = tx.objectStore('inventory');

    const getReq = giftStore.get(id);
    getReq.onsuccess = () => {
      const g = getReq.result;
      if (g && Array.isArray(g.deductions)) {
        // Restore deducted inventory items
        g.deductions.forEach(d => {
          if (d && d.id && d.qty) {
            const invReq = invStore.get(d.id);
            invReq.onsuccess = () => {
              const item = invReq.result;
              if (item) {
                item.quantity = +(Number(item.quantity || 0) + Number(d.qty)).toFixed(2);
                item.lastUpdated = new Date().toISOString();
                invStore.put(item);
              }
            };
          }
        });
      }
      giftStore.delete(id);
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getGiftsSummary(period = 'all') {
  const gifts = await getAllGifts();
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const todayStr = localDateStr(now);

  const filtered = gifts.filter(g => {
    if (period === 'this_month') return g.date && g.date.startsWith(currentMonth);
    if (period === 'last_30_days') return g.date && g.date >= thirtyDaysAgo;
    if (period === 'today') return g.date && g.date === todayStr;
    return true;
  });

  let totalRetailValue = 0;
  let totalProductionCost = 0;
  let totalUnits = 0;
  const byPurpose = {};
  const byProduct = {};

  for (const g of filtered) {
    const qty = Number(g.quantity) || 1;
    const retail = Number(g.retailPrice) || 0;
    const cost = Number(g.productionCost) || 0;

    totalUnits += qty;
    totalRetailValue += retail * qty;
    totalProductionCost += cost * qty;

    const pur = g.purpose || 'promotion';
    byPurpose[pur] = (byPurpose[pur] || 0) + qty;

    const prod = g.productType || 'other';
    byProduct[prod] = (byProduct[prod] || 0) + qty;
  }

  return {
    count: filtered.length,
    totalUnits,
    totalRetailValue,
    totalProductionCost,
    byPurpose,
    byProduct,
    items: filtered
  };
}

export async function exportAllDataJSON() {
  const txs = await getAllTransactions();
  const inv = await getAllInventory();
  const batches = await getAllBatches();
  const gifts = await getAllGifts();

  const backup = {
    version: '3.0',
    exportDate: new Date().toISOString(),
    appName: 'NolMart Business Manager',
    data: {
      transactions: txs,
      inventory: inv,
      batches: batches,
      gifts: gifts
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
    const tx = db.transaction(['transactions', 'inventory', 'batches', 'gifts'], 'readwrite');
    const txStore = tx.objectStore('transactions');
    const invStore = tx.objectStore('inventory');
    const batchStore = tx.objectStore('batches');
    const giftStore = tx.objectStore('gifts');

    txStore.clear();
    invStore.clear();
    batchStore.clear();
    giftStore.clear();

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
    if (parsed.data.gifts) {
      for (const item of parsed.data.gifts) {
        delete item.id;
        giftStore.add(item);
      }
    }

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function clearAllLocalData() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['transactions', 'inventory', 'batches', 'gifts'], 'readwrite');
    tx.objectStore('transactions').clear();
    tx.objectStore('inventory').clear();
    tx.objectStore('batches').clear();
    tx.objectStore('gifts').clear();

    tx.oncomplete = () => {
      checkAndSeedPerfumeInventory(db).then(() => resolve(true));
    };
    tx.onerror = (e) => reject(e.target.error);
  });
}


