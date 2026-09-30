// js/app.js - Main Application Controller for NolMart Business Manager
import {
  openDatabase,
  addTransaction,
  getAllTransactions,
  deleteTransaction,
  getAllInventory,
  addInventoryItem,
  adjustStock,
  deleteInventoryItem,
  getFinancialSummary,
  clearAllLocalData
} from './db.js';

import {
  calculatePerfumeBatch,
  saveFormulationBatch
} from './calculator.js';

import {
  downloadFullBackup,
  restoreFromFile,
  exportTransactionsToCSV,
  exportInventoryToCSV
} from './export.js';

// App State
let state = {
  currentTab: 'tab-dashboard',
  currentPeriod: 'all',
  currentInvFilter: 'all',
  inventory: [],
  transactions: [],
  deferredInstallPrompt: null
};

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Format TZS
function formatTZS(amount) {
  const num = Math.round(Number(amount) || 0);
  return `${num.toLocaleString('en-TZ')} TZS`;
}

// ==========================================
// PWA INSTALLATION & SERVICE WORKER
// ==========================================
function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('NolMart PWA ServiceWorker registered with scope:', reg.scope))
        .catch(err => console.log('ServiceWorker registration failed:', err));
    });
  }

  const installBtn = document.getElementById('pwaInstallBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstallPrompt = e;
    if (installBtn) installBtn.style.display = 'flex';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (state.deferredInstallPrompt) {
        state.deferredInstallPrompt.prompt();
        const { outcome } = await state.deferredInstallPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        state.deferredInstallPrompt = null;
        installBtn.style.display = 'none';
      }
    });
  }
}

// ==========================================
// NAVIGATION & TABS
// ==========================================
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  const tabViews = document.querySelectorAll('.tab-view');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  const viewAllTxBtn = document.getElementById('viewAllTxBtn');
  if (viewAllTxBtn) {
    viewAllTxBtn.addEventListener('click', () => switchTab('tab-transactions'));
  }

  const goToInvBtn = document.getElementById('goToInventoryFromAlert');
  if (goToInvBtn) {
    goToInvBtn.addEventListener('click', () => switchTab('tab-inventory'));
  }
}

function switchTab(tabId) {
  state.currentTab = tabId;

  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.toggle('active', view.id === tabId);
  });

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-render data for the newly active tab
  if (tabId === 'tab-dashboard') renderDashboard();
  else if (tabId === 'tab-transactions') renderTransactionsTab();
  else if (tabId === 'tab-inventory') renderInventoryTab();
  else if (tabId === 'tab-calculator') updateCalculatorRecipe();
}

// ==========================================
// MODAL CONTROLS
// ==========================================
function initModals() {
  // Open Sale Modal
  document.getElementById('openSaleModalBtn')?.addEventListener('click', () => {
    populateInventorySaleSelect();
    const dateInput = document.getElementById('saleDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    openModal('saleModal');
  });

  // Open Expense Modal
  document.getElementById('openExpenseModalBtn')?.addEventListener('click', () => {
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    openModal('expenseModal');
  });

  // Open Add Inventory Item Modal
  document.getElementById('openNewItemModalBtn')?.addEventListener('click', () => {
    openModal('newItemModal');
  });

  // Close modals
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Click outside modal content to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Populate product dropdown in Sale Modal
function populateInventorySaleSelect() {
  const select = document.getElementById('saleInventorySelect');
  if (!select) return;

  select.innerHTML = '<option value="">-- Manual Item Entry --</option>';
  const finishedItems = state.inventory.filter(i => i.category === 'finished_perfume' || i.category === 'tech_gadget');

  finishedItems.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `${item.name} (Stock: ${item.quantity} | ${formatTZS(item.sellingPrice)})`;
    opt.dataset.price = item.sellingPrice || 0;
    opt.dataset.name = item.name;
    select.appendChild(opt);
  });

  select.onchange = () => {
    const selected = select.options[select.selectedIndex];
    if (selected.value) {
      document.getElementById('saleDescription').value = selected.dataset.name || '';
      const unitPrice = parseFloat(selected.dataset.price) || 0;
      const qty = parseInt(document.getElementById('saleQuantity').value, 10) || 1;
      document.getElementById('saleAmount').value = unitPrice * qty;
    }
  };

  const qtyInput = document.getElementById('saleQuantity');
  qtyInput.oninput = () => {
    const selected = select.options[select.selectedIndex];
    if (selected && selected.value) {
      const unitPrice = parseFloat(selected.dataset.price) || 0;
      const qty = parseInt(qtyInput.value, 10) || 1;
      document.getElementById('saleAmount').value = unitPrice * qty;
    }
  };
}

// ==========================================
// FORM SUBMISSIONS
// ==========================================
function initForms() {
  // 1. Submit Sale
  const saleForm = document.getElementById('saleForm');
  if (saleForm) {
    saleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const invSelect = document.getElementById('saleInventorySelect');
      const invItemId = invSelect.value ? parseInt(invSelect.value, 10) : null;
      const description = document.getElementById('saleDescription').value.trim();
      const quantity = parseInt(document.getElementById('saleQuantity').value, 10) || 1;
      const amount = parseFloat(document.getElementById('saleAmount').value) || 0;
      const paymentMethod = document.getElementById('salePaymentMethod').value;
      const customerName = document.getElementById('saleCustomerName').value.trim();
      const customerPhone = document.getElementById('saleCustomerPhone').value.trim();
      const date = document.getElementById('saleDate').value;
      const notes = document.getElementById('saleNotes').value.trim();

      try {
        await addTransaction({
          type: 'income',
          category: invItemId ? 'perfume_sale' : 'manual_sale',
          inventoryItemId: invItemId,
          description,
          quantity,
          amount,
          paymentMethod,
          customerName,
          customerPhone,
          date,
          notes
        });

        closeModal('saleModal');
        saleForm.reset();
        showToast(`Sale recorded: +${formatTZS(amount)} (${paymentMethod.toUpperCase()})`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error recording sale: ' + err.message, 'error');
      }
    });
  }

  // 2. Submit Expense
  const expenseForm = document.getElementById('expenseForm');
  if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const category = document.getElementById('expenseCategory').value;
      const description = document.getElementById('expenseDescription').value.trim();
      const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
      const paymentMethod = document.getElementById('expensePaymentMethod').value;
      const date = document.getElementById('expenseDate').value;
      const notes = document.getElementById('expenseNotes').value.trim();

      try {
        await addTransaction({
          type: 'expense',
          category,
          description,
          amount,
          paymentMethod,
          date,
          notes
        });

        closeModal('expenseModal');
        expenseForm.reset();
        showToast(`Expense recorded: -${formatTZS(amount)}`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error recording expense: ' + err.message, 'error');
      }
    });
  }

  // 3. Submit New Inventory Item
  const newItemForm = document.getElementById('newItemForm');
  if (newItemForm) {
    newItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newItemName').value.trim();
      const category = document.getElementById('newItemCategory').value;
      const unit = document.getElementById('newItemUnit').value.trim();
      const quantity = parseFloat(document.getElementById('newItemQty').value) || 0;
      const minThreshold = parseFloat(document.getElementById('newItemThreshold').value) || 1;
      const unitCost = parseFloat(document.getElementById('newItemCost').value) || 0;
      const sellingPrice = parseFloat(document.getElementById('newItemPrice').value) || 0;

      try {
        await addInventoryItem({
          name,
          category,
          unit,
          quantity,
          minThreshold,
          unitCost,
          sellingPrice
        });

        closeModal('newItemModal');
        newItemForm.reset();
        showToast(`Item "${name}" added to stock!`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error adding item: ' + err.message, 'error');
      }
    });
  }
}

// ==========================================
// DATA RENDERING (DASHBOARD)
// ==========================================
async function renderDashboard() {
  const summary = await getFinancialSummary(state.currentPeriod);

  // Update Hero Card & Stats
  document.getElementById('statCashInHand').textContent = formatTZS(summary.expectedCashInHand);
  document.getElementById('statTotalSales').textContent = formatTZS(summary.totalSales);
  document.getElementById('statSalesCount').textContent = `${summary.totalTransactions} transactions in period`;
  document.getElementById('statTotalExpenses').textContent = formatTZS(summary.totalExpenses);
  document.getElementById('statNetProfit').textContent = formatTZS(summary.netProfit);
  document.getElementById('statOwnersDraw').textContent = formatTZS(summary.ownersDraw);
  document.getElementById('statProfitBadge').textContent = `${summary.profitMargin}% Margin`;

  // Net Profit coloring
  const netProfitEl = document.getElementById('statNetProfit');
  if (summary.netProfit >= 0) {
    netProfitEl.className = 'stat-value text-emerald';
  } else {
    netProfitEl.className = 'stat-value text-rose';
  }

  // Money Channels
  document.getElementById('methodCash').textContent = formatTZS(summary.paymentBreakdown.cash);
  document.getElementById('methodMpesa').textContent = formatTZS(summary.paymentBreakdown.mpesa);
  document.getElementById('methodAirtel').textContent = formatTZS(summary.paymentBreakdown.airtel);
  document.getElementById('methodTigo').textContent = formatTZS(summary.paymentBreakdown.tigo);
  document.getElementById('methodBank').textContent = formatTZS(summary.paymentBreakdown.bank);

  // Low Stock Banner Check
  const lowStockItems = state.inventory.filter(i => (i.quantity || 0) <= (i.minThreshold || 0));
  const banner = document.getElementById('lowStockBanner');
  if (lowStockItems.length > 0) {
    banner.classList.remove('hidden');
    document.getElementById('lowStockCountText').textContent =
      `${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} running low on stock (${lowStockItems.map(i => i.name).slice(0, 2).join(', ')}${lowStockItems.length > 2 ? '...' : ''})!`;
  } else {
    banner.classList.add('hidden');
  }

  // Recent Transactions (Last 5)
  const recentList = document.getElementById('recentTxList');
  if (recentList) {
    const recent = state.transactions.slice(0, 5);
    if (recent.length === 0) {
      recentList.innerHTML = '<div class="empty-state">No transactions recorded yet. Tap "+ Record Sale" or "- Record Expense" above!</div>';
    } else {
      recentList.innerHTML = recent.map(t => renderTxItemHTML(t)).join('');
      attachTxDeleteListeners();
    }
  }
}

function renderTxItemHTML(t) {
  const isIncome = t.type === 'income';
  const sign = isIncome ? '+' : '-';
  const icon = isIncome ? '↑' : '↓';

  return `
    <div class="tx-item ${isIncome ? 'tx-income' : 'tx-expense'}">
      <div class="tx-left">
        <div class="tx-icon">${icon}</div>
        <div class="tx-details">
          <span class="tx-name">${escapeHTML(t.description || 'Transaction')}</span>
          <span class="tx-meta">
            <span>${t.date}</span>
            <span>•</span>
            <span class="tx-payment-badge">${(t.paymentMethod || 'cash').toUpperCase()}</span>
            ${t.customerName ? `<span>• ${escapeHTML(t.customerName)}</span>` : ''}
          </span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="tx-amount">${sign}${formatTZS(t.amount)}</span>
        <button class="btn-stock-adjust delete-tx-btn" data-tx-id="${t.id}" title="Delete Transaction" style="color: var(--text-muted);">&times;</button>
      </div>
    </div>
  `;
}

function attachTxDeleteListeners() {
  document.querySelectorAll('.delete-tx-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.txId, 10);
      if (confirm('Delete this transaction record?')) {
        await deleteTransaction(id);
        showToast('Transaction deleted', 'info');
        await loadAllData();
      }
    };
  });
}

// ==========================================
// TRANSACTIONS TAB
// ==========================================
function renderTransactionsTab() {
  const container = document.getElementById('fullTxList');
  if (!container) return;

  const searchTerm = (document.getElementById('txSearchInput')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('txTypeFilter')?.value || 'all';

  let list = state.transactions;

  if (typeFilter !== 'all') {
    list = list.filter(t => t.type === typeFilter);
  }

  if (searchTerm) {
    list = list.filter(t =>
      (t.description || '').toLowerCase().includes(searchTerm) ||
      (t.customerName || '').toLowerCase().includes(searchTerm) ||
      (t.notes || '').toLowerCase().includes(searchTerm)
    );
  }

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state">No matching transactions found.</div>';
    return;
  }

  container.innerHTML = list.map(t => renderTxItemHTML(t)).join('');
  attachTxDeleteListeners();
}

// ==========================================
// INVENTORY TAB
// ==========================================
function renderInventoryTab() {
  const grid = document.getElementById('inventoryGrid');
  if (!grid) return;

  let items = state.inventory;
  if (state.currentInvFilter !== 'all') {
    items = items.filter(i => i.category === state.currentInvFilter);
  }

  if (items.length === 0) {
    grid.innerHTML = '<div class="empty-state">No inventory items in this category. Tap "+ Add Item" above.</div>';
    return;
  }

  grid.innerHTML = items.map(item => {
    const isLow = (item.quantity || 0) <= (item.minThreshold || 0);
    return `
      <div class="inv-card ${isLow ? 'low-stock' : ''}">
        <div>
          <div class="inv-header">
            <span class="inv-title">${escapeHTML(item.name)}</span>
            <span class="inv-badge ${isLow ? 'badge-low' : 'badge-ok'}">${isLow ? 'LOW STOCK' : 'IN STOCK'}</span>
          </div>
          <div class="inv-stock-number ${isLow ? 'text-amber' : ''}">
            ${item.quantity} <span style="font-size: 0.85rem; color: var(--text-muted);">${item.unit || 'units'}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">
            ${item.sellingPrice > 0 ? `Selling: <strong class="text-emerald">${formatTZS(item.sellingPrice)}</strong>` : ''}
            ${item.unitCost > 0 ? ` | Cost: ${formatTZS(item.unitCost)}` : ''}
          </div>
        </div>
        <div class="inv-footer">
          <span>Min Alert: ${item.minThreshold || 1}</span>
          <div class="inv-actions">
            <button class="btn-stock-adjust btn-decrement-stock" data-id="${item.id}" title="Decrease 1">-</button>
            <button class="btn-stock-adjust btn-increment-stock" data-id="${item.id}" title="Increase 1">+</button>
            <button class="btn-stock-adjust btn-delete-stock" data-id="${item.id}" title="Delete Item" style="color: var(--rose);">&times;</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Stock action listeners
  document.querySelectorAll('.btn-increment-stock').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      await adjustStock(id, 1);
      await loadAllData();
    };
  });

  document.querySelectorAll('.btn-decrement-stock').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      await adjustStock(id, -1);
      await loadAllData();
    };
  });

  document.querySelectorAll('.btn-delete-stock').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id, 10);
      if (confirm('Delete this item from inventory?')) {
        await deleteInventoryItem(id);
        showToast('Item deleted', 'info');
        await loadAllData();
      }
    };
  });
}

// ==========================================
// PERFUME CALCULATOR LAB
// ==========================================
function initCalculator() {
  const bottleSizeSelect = document.getElementById('calcBottleSize');
  const countInput = document.getElementById('calcBottleCount');
  const oilPercentInput = document.getElementById('calcOilPercent');
  const fixativePercentInput = document.getElementById('calcFixativePercent');

  const inputs = [bottleSizeSelect, countInput, oilPercentInput, fixativePercentInput];
  inputs.forEach(input => {
    if (input) input.addEventListener('input', updateCalculatorRecipe);
  });

  const saveBatchBtn = document.getElementById('saveBatchToStockBtn');
  if (saveBatchBtn) {
    saveBatchBtn.addEventListener('click', async () => {
      const scentName = document.getElementById('calcScentName').value.trim();
      const bottleSize = parseInt(bottleSizeSelect.value, 10) || 30;
      const count = parseInt(countInput.value, 10) || 1;
      const oilPercent = parseFloat(oilPercentInput.value) || 25;
      const fixativePercent = parseFloat(fixativePercentInput.value) || 5;

      const calc = calculatePerfumeBatch({
        bottleSizeMl: bottleSize,
        bottleCount: count,
        oilPercentage: oilPercent,
        fixativePercentage: fixativePercent
      });

      try {
        await saveFormulationBatch({
          scentName,
          bottleSize: `${bottleSize}ml`,
          bottleCount: count,
          totalVolume: calc.totalVolumeMl,
          oilVolume: calc.oilVolumeMl,
          fixativeVolume: calc.fixativeVolumeMl,
          ethanolVolume: calc.ethanolVolumeMl,
          oilPercentage: oilPercent,
          fixativePercentage: fixativePercent,
          costPerBottle: calc.costPerBottle
        }, true);

        showToast(`Batch of ${count}x ${bottleSize}ml "${scentName}" added to stock!`, 'success');
        await loadAllData();
        switchTab('tab-inventory');
      } catch (err) {
        showToast('Error saving batch: ' + err.message, 'error');
      }
    });
  }
}

function updateCalculatorRecipe() {
  const bottleSize = parseInt(document.getElementById('calcBottleSize')?.value, 10) || 30;
  const count = parseInt(document.getElementById('calcBottleCount')?.value, 10) || 10;
  const oilPercent = parseFloat(document.getElementById('calcOilPercent')?.value) || 25;
  const fixativePercent = parseFloat(document.getElementById('calcFixativePercent')?.value) || 5;

  const ethanolPercent = Math.max(0, 100 - oilPercent - fixativePercent);
  const ethanolEl = document.getElementById('calcEthanolPercent');
  if (ethanolEl) ethanolEl.value = `${ethanolPercent}%`;

  const calc = calculatePerfumeBatch({
    bottleSizeMl: bottleSize,
    bottleCount: count,
    oilPercentage: oilPercent,
    fixativePercentage: fixativePercent
  });

  // Update UI Elements
  document.getElementById('resTotalVolume').textContent = `${calc.totalVolumeMl} ml`;
  document.getElementById('resOilVolume').textContent = `${calc.oilVolumeMl} ml`;
  document.getElementById('resFixativeVolume').textContent = `${calc.fixativeVolumeMl} ml`;
  document.getElementById('resEthanolVolume').textContent = `${calc.ethanolVolumeMl} ml`;

  document.getElementById('resTotalCost').textContent = formatTZS(calc.totalBatchCost);
  document.getElementById('resCostPerBottle').textContent = formatTZS(calc.costPerBottle);
  document.getElementById('resTotalRevenue').textContent = formatTZS(calc.totalRevenue);
  document.getElementById('resNetProfit').textContent = `${formatTZS(calc.totalNetProfit)} (${calc.profitMarginPercent}% Margin)`;
}

// ==========================================
// SETTINGS, BACKUP & EXPORTS
// ==========================================
function initSettingsAndExports() {
  // Download JSON Backup
  document.getElementById('downloadBackupBtn')?.addEventListener('click', async () => {
    try {
      await downloadFullBackup();
      showToast('Private backup downloaded successfully!', 'success');
    } catch (e) {
      showToast('Backup failed: ' + e.message, 'error');
    }
  });

  // Restore from File
  const restoreInput = document.getElementById('restoreFileInput');
  if (restoreInput) {
    restoreInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (confirm('Restore data from this file? This will overwrite your current local records.')) {
        try {
          await restoreFromFile(file);
          showToast('Data restored successfully!', 'success');
          await loadAllData();
          switchTab('tab-dashboard');
        } catch (err) {
          showToast('Restore error: ' + err.message, 'error');
        }
      }
    });
  }

  // Export CSVs
  document.getElementById('exportTxCSVBtn')?.addEventListener('click', exportTransactionsToCSV);
  document.getElementById('exportAllTxCSV')?.addEventListener('click', exportTransactionsToCSV);
  document.getElementById('exportInvCSVBtn')?.addEventListener('click', exportInventoryToCSV);
  document.getElementById('exportAllInvCSV')?.addEventListener('click', exportInventoryToCSV);

  // Clear data
  document.getElementById('clearDataBtn')?.addEventListener('click', async () => {
    if (confirm('WARNING: Are you sure you want to reset all records to default baseline? Make sure you have downloaded a backup first!')) {
      await clearAllLocalData();
      showToast('All local records reset to clean baseline.', 'info');
      await loadAllData();
      switchTab('tab-dashboard');
    }
  });

  // Filter Period Tabs in Dashboard
  document.querySelectorAll('.filter-tab[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-period]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentPeriod = btn.dataset.period;
      renderDashboard();
    });
  });

  // Inventory Filter Tabs
  document.querySelectorAll('.filter-tab[data-inv-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-inv-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentInvFilter = btn.dataset.invFilter;
      renderInventoryTab();
    });
  });

  // Search & Type Filter in Transactions
  document.getElementById('txSearchInput')?.addEventListener('input', renderTransactionsTab);
  document.getElementById('txTypeFilter')?.addEventListener('change', renderTransactionsTab);
}

// Load all data from IndexedDB into memory & refresh active tab
async function loadAllData() {
  await openDatabase();
  state.inventory = await getAllInventory();
  state.transactions = await getAllTransactions();

  if (state.currentTab === 'tab-dashboard') renderDashboard();
  else if (state.currentTab === 'tab-transactions') renderTransactionsTab();
  else if (state.currentTab === 'tab-inventory') renderInventoryTab();
  else if (state.currentTab === 'tab-calculator') updateCalculatorRecipe();
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ==========================================
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  initPWA();
  initNavigation();
  initModals();
  initForms();
  initCalculator();
  initSettingsAndExports();

  await loadAllData();
  updateCalculatorRecipe();
});
