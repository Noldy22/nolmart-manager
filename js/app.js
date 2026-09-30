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
  deductIngredientsForBlend,
  getFinancialSummary,
  clearAllLocalData
} from './db.js';

import {
  RECIPES_CATALOG,
  getSOPMeasurements,
  calculateMaxTransactionCost
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
  financialSummary: null,
  selectedRecipeId: RECIPES_CATALOG[0].id,
  selectedBottleSize: 30,
  activeSOPMeasurements: null,
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
// PWA INSTALLATION & SERVICE WORKER
// ==========================================
function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('NolMart PWA ServiceWorker ready:', reg.scope);
          reg.update();
        })
        .catch(err => console.log('ServiceWorker failed:', err));
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
        console.log(`User install outcome: ${outcome}`);
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

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  document.getElementById('viewAllTxBtn')?.addEventListener('click', () => switchTab('tab-transactions'));
  document.getElementById('goToInventoryFromAlert')?.addEventListener('click', () => switchTab('tab-inventory'));
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

  if (tabId === 'tab-dashboard') renderDashboard();
  else if (tabId === 'tab-transactions') renderTransactionsTab();
  else if (tabId === 'tab-inventory') renderInventoryTab();
  else if (tabId === 'tab-calculator') renderSOPLab();
}

// ==========================================
// MODALS
// ==========================================
function initModals() {
  // Open Sale Modal
  document.getElementById('openSaleModalBtn')?.addEventListener('click', () => {
    const dateInput = document.getElementById('saleDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    openModal('saleModal');
  });

  // Open Expense Modal
  document.getElementById('openExpenseModalBtn')?.addEventListener('click', () => {
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    updateExpenseCalculations();
    openModal('expenseModal');
  });

  // Open Rebalance Channel Modal
  document.getElementById('openRebalanceModalBtn')?.addEventListener('click', () => {
    updateRebalanceModalView();
    openModal('rebalanceModal');
  });

  // Open Add Inventory Item Modal
  document.getElementById('openNewItemModalBtn')?.addEventListener('click', () => {
    openModal('newItemModal');
  });

  // Open Fulfill Order Modal from SOP Lab
  document.getElementById('openFulfillOrderBtn')?.addEventListener('click', () => {
    if (!state.activeSOPMeasurements) return;
    const m = state.activeSOPMeasurements;
    document.getElementById('fulfillItemSummary').textContent = `${m.recipe.name} (${m.size}ml)`;
    document.getElementById('fulfillAmountSummary').textContent = `Sale Price: ${formatTZS(m.sellingPrice)}`;
    openModal('fulfillModal');
  });

  // Close modals
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Sale Modal Type selector changes default price & description
  const saleTypeSelect = document.getElementById('saleProductTypeSelect');
  if (saleTypeSelect) {
    saleTypeSelect.addEventListener('change', () => {
      const opt = saleTypeSelect.options[saleTypeSelect.selectedIndex];
      if (opt.value !== 'custom') {
        document.getElementById('saleAmount').value = opt.value;
      }
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
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
          category: 'perfume_sale',
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

  // 2. Submit Expense with Dynamic Max Transaction Cost
  const expenseForm = document.getElementById('expenseForm');
  const expenseAmountEl = document.getElementById('expenseAmount');
  const expenseMethodEl = document.getElementById('expensePaymentMethod');
  const expenseFeeEl = document.getElementById('expenseFee');

  if (expenseAmountEl) {
    expenseAmountEl.addEventListener('input', updateExpenseCalculations);
  }
  if (expenseMethodEl) {
    expenseMethodEl.addEventListener('change', updateExpenseCalculations);
  }
  if (expenseFeeEl) {
    expenseFeeEl.addEventListener('input', () => {
      const amt = parseFloat(expenseAmountEl?.value) || 0;
      const fee = parseFloat(expenseFeeEl.value) || 0;
      const outflowEl = document.getElementById('expenseTotalOutflow');
      if (outflowEl) outflowEl.value = formatTZS(amt + fee);
    });
  }

  if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const category = document.getElementById('expenseCategory').value;
      const description = document.getElementById('expenseDescription').value.trim();
      const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
      const fee = parseFloat(document.getElementById('expenseFee')?.value) || 0;
      const paymentMethod = document.getElementById('expensePaymentMethod').value;
      const date = document.getElementById('expenseDate').value;
      const notes = document.getElementById('expenseNotes').value.trim();
      const totalOutflow = amount + fee;

      try {
        await addTransaction({
          type: 'expense',
          category,
          description,
          amount,
          fee,
          paymentMethod,
          date,
          notes: fee > 0 ? `${notes ? notes + ' | ' : ''}Tariff: ${formatTZS(fee)}` : notes
        });

        closeModal('expenseModal');
        expenseForm.reset();
        showToast(`Expense recorded: -${formatTZS(totalOutflow)} (${paymentMethod.toUpperCase()})`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error recording expense: ' + err.message, 'error');
      }
    });
  }

  // 3. Fulfill Order from SOP Lab (Deducts exact raw materials & records sale)
  const fulfillForm = document.getElementById('fulfillForm');
  if (fulfillForm) {
    fulfillForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!state.activeSOPMeasurements) return;
      const m = state.activeSOPMeasurements;

      const customerName = document.getElementById('fulfillCustomerName').value.trim();
      const customerPhone = document.getElementById('fulfillCustomerPhone').value.trim();
      const paymentMethod = document.getElementById('fulfillPaymentMethod').value;
      const notes = document.getElementById('fulfillNotes').value.trim();

      try {
        // 1. Deduct raw materials from stock based on SOP 60:40 formula
        await deductIngredientsForBlend({
          ingredients: m.ingredients,
          fixativeDrops: m.fixativeDrops,
          ethanolMl: m.ethanolMl,
          bottleSize: m.size,
          bottleCount: 1
        });

        // 2. Record sale into transactions ledger
        await addTransaction({
          type: 'income',
          category: `perfume_${m.size}ml`,
          description: `${m.recipe.name} (${m.size}ml)`,
          quantity: 1,
          amount: m.sellingPrice,
          paymentMethod,
          customerName,
          customerPhone,
          date: new Date().toISOString().split('T')[0],
          notes: `Blended on-demand via SOP. ${notes}`
        });

        closeModal('fulfillModal');
        fulfillForm.reset();
        showToast(`Order blended & stock deducted! +${formatTZS(m.sellingPrice)}`, 'success');
        await loadAllData();
        switchTab('tab-dashboard');
      } catch (err) {
        showToast('Error fulfilling order: ' + err.message, 'error');
      }
    });
  }

  // 4. Add Raw Stock Item
  const newItemForm = document.getElementById('newItemForm');
  if (newItemForm) {
    newItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newItemName').value.trim();
      const category = document.getElementById('newItemCategory').value;
      const unit = document.getElementById('newItemUnit').value.trim();
      const quantity = parseFloat(document.getElementById('newItemQty').value) || 0;
      const minThreshold = parseFloat(document.getElementById('newItemThreshold').value) || 1;

      try {
        await addInventoryItem({
          name,
          category,
          unit,
          quantity,
          minThreshold,
          unitCost: 0,
          sellingPrice: 0
        });

        closeModal('newItemModal');
        newItemForm.reset();
        showToast(`Stock item "${name}" added!`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error adding stock: ' + err.message, 'error');
      }
    });
  }

  // 5. Rebalance Payment Channel Form
  const rebalanceForm = document.getElementById('rebalanceForm');
  const rebalanceChannelSelect = document.getElementById('rebalanceChannelSelect');
  const rebalanceActualAmountInput = document.getElementById('rebalanceActualAmount');

  if (rebalanceChannelSelect) {
    rebalanceChannelSelect.addEventListener('change', updateRebalanceModalView);
  }

  if (rebalanceActualAmountInput) {
    rebalanceActualAmountInput.addEventListener('input', calculateRebalanceDiscrepancy);
  }

  if (rebalanceForm) {
    rebalanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const channel = rebalanceChannelSelect?.value || 'cash';
      const ledgerBalance = state.financialSummary ? (state.financialSummary.paymentBreakdown[channel] || 0) : 0;
      const actualBalance = parseFloat(rebalanceActualAmountInput?.value) || 0;
      const diff = actualBalance - ledgerBalance;
      const reason = (document.getElementById('rebalanceReason')?.value || 'Tariff / Ledger Reconciliation').trim();
      const channelName = rebalanceChannelSelect?.options[rebalanceChannelSelect.selectedIndex]?.text || channel.toUpperCase();

      if (diff === 0) {
        showToast('Channel is already perfectly balanced!', 'info');
        closeModal('rebalanceModal');
        return;
      }

      try {
        const todayStr = new Date().toISOString().split('T')[0];
        if (diff < 0) {
          // Actual < Ledger -> Log shortfall expense adjustment
          await addTransaction({
            type: 'expense',
            category: 'balance_adjustment',
            description: `Ledger Rebalance: ${channel.toUpperCase()}`,
            amount: Math.abs(diff),
            fee: 0,
            paymentMethod: channel,
            date: todayStr,
            notes: `${reason} | Shortfall: ${formatTZS(Math.abs(diff))} adjusted to match phone (${formatTZS(actualBalance)})`
          });
        } else {
          // Actual > Ledger -> Log surplus income adjustment
          await addTransaction({
            type: 'income',
            category: 'balance_adjustment',
            description: `Ledger Rebalance: ${channel.toUpperCase()}`,
            amount: diff,
            fee: 0,
            paymentMethod: channel,
            date: todayStr,
            notes: `${reason} | Surplus: ${formatTZS(diff)} adjusted to match phone (${formatTZS(actualBalance)})`
          });
        }

        closeModal('rebalanceModal');
        rebalanceForm.reset();
        showToast(`⚖️ ${channelName} rebalanced to ${formatTZS(actualBalance)}!`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error rebalancing channel: ' + err.message, 'error');
      }
    });
  }
}

// ==========================================
// DYNAMIC EXPENSE & REBALANCE HELPERS
// ==========================================
function updateExpenseCalculations() {
  const expenseAmountEl = document.getElementById('expenseAmount');
  const expenseMethodEl = document.getElementById('expensePaymentMethod');
  const expenseFeeEl = document.getElementById('expenseFee');
  const feeNoticeEl = document.getElementById('feeNotice');
  const expenseOutflowEl = document.getElementById('expenseTotalOutflow');

  if (!expenseAmountEl || !expenseMethodEl || !expenseFeeEl) return;
  const amt = parseFloat(expenseAmountEl.value) || 0;
  const method = expenseMethodEl.value;

  const maxFee = calculateMaxTransactionCost(amt, method);
  expenseFeeEl.value = maxFee;

  const totalOutflow = amt + maxFee;
  if (expenseOutflowEl) expenseOutflowEl.value = formatTZS(totalOutflow);

  if (feeNoticeEl) {
    if (method === 'cash') {
      feeNoticeEl.textContent = 'Cash expense — 0 TZS fee.';
      feeNoticeEl.style.color = 'var(--text-muted)';
    } else {
      feeNoticeEl.textContent = `🛡️ Max tariff auto-added (+${formatTZS(maxFee)}) to protect cash reserves.`;
      feeNoticeEl.style.color = 'var(--amber)';
    }
  }
}

function updateRebalanceModalView() {
  const rebalanceChannelSelect = document.getElementById('rebalanceChannelSelect');
  const rebalanceCurrentLedgerInput = document.getElementById('rebalanceCurrentLedger');
  const rebalanceActualAmountInput = document.getElementById('rebalanceActualAmount');

  if (!rebalanceChannelSelect || !state.financialSummary) return;
  const channel = rebalanceChannelSelect.value;
  const ledgerBalance = state.financialSummary.paymentBreakdown[channel] || 0;

  if (rebalanceCurrentLedgerInput) {
    rebalanceCurrentLedgerInput.value = formatTZS(ledgerBalance);
  }
  if (rebalanceActualAmountInput) {
    rebalanceActualAmountInput.value = '';
  }

  calculateRebalanceDiscrepancy();
}

function calculateRebalanceDiscrepancy() {
  const rebalanceChannelSelect = document.getElementById('rebalanceChannelSelect');
  const rebalanceActualAmountInput = document.getElementById('rebalanceActualAmount');
  const rebalanceDiscrepancyText = document.getElementById('rebalanceDiscrepancyText');
  const rebalanceExplanation = document.getElementById('rebalanceExplanation');

  if (!rebalanceChannelSelect || !state.financialSummary || !rebalanceDiscrepancyText) return;
  const channel = rebalanceChannelSelect.value;
  const ledgerBalance = state.financialSummary.paymentBreakdown[channel] || 0;
  const actualVal = rebalanceActualAmountInput ? rebalanceActualAmountInput.value.trim() : '';

  if (actualVal === '') {
    rebalanceDiscrepancyText.textContent = '0 TZS';
    rebalanceDiscrepancyText.style.color = 'var(--text-primary)';
    if (rebalanceExplanation) rebalanceExplanation.textContent = 'Type your physical phone/cash balance to compare with the ledger.';
    return;
  }

  const actualBalance = parseFloat(actualVal) || 0;
  const diff = actualBalance - ledgerBalance;

  if (diff === 0) {
    rebalanceDiscrepancyText.textContent = '0 TZS (Balanced)';
    rebalanceDiscrepancyText.style.color = 'var(--emerald)';
    if (rebalanceExplanation) rebalanceExplanation.textContent = 'Physical phone balance matches ledger exactly. No adjustment needed.';
  } else if (diff < 0) {
    const shortfall = Math.abs(diff);
    rebalanceDiscrepancyText.textContent = `-${formatTZS(shortfall)} (Shortfall)`;
    rebalanceDiscrepancyText.style.color = 'var(--rose)';
    if (rebalanceExplanation) rebalanceExplanation.textContent = `Phone balance is less by ${formatTZS(shortfall)} (unrecorded tariff/fee). Confirming logs an adjustment expense to reconcile.`;
  } else {
    rebalanceDiscrepancyText.textContent = `+${formatTZS(diff)} (Surplus)`;
    rebalanceDiscrepancyText.style.color = 'var(--emerald)';
    if (rebalanceExplanation) rebalanceExplanation.textContent = `Phone balance has an extra ${formatTZS(diff)}. Confirming logs an adjustment income to reconcile.`;
  }
}

// ==========================================
// DASHBOARD RENDERING
// ==========================================
async function renderDashboard() {
  const summary = await getFinancialSummary(state.currentPeriod);
  state.financialSummary = summary;

  document.getElementById('statCashInHand').textContent = formatTZS(summary.expectedCashInHand);
  document.getElementById('statTotalSales').textContent = formatTZS(summary.totalSales);
  document.getElementById('statSalesCount').textContent = `${summary.totalTransactions} transactions in period`;
  document.getElementById('statTotalExpenses').textContent = formatTZS(summary.totalExpenses);
  document.getElementById('statNetProfit').textContent = formatTZS(summary.netProfit);
  document.getElementById('statOwnersDraw').textContent = formatTZS(summary.ownersDraw);
  document.getElementById('statProfitBadge').textContent = `${summary.profitMargin}% Margin`;

  const netProfitEl = document.getElementById('statNetProfit');
  if (summary.netProfit >= 0) {
    netProfitEl.className = 'stat-value text-emerald';
  } else {
    netProfitEl.className = 'stat-value text-rose';
  }

  document.getElementById('methodCash').textContent = formatTZS(summary.paymentBreakdown.cash);
  document.getElementById('methodMpesa').textContent = formatTZS(summary.paymentBreakdown.mpesa);
  document.getElementById('methodAirtel').textContent = formatTZS(summary.paymentBreakdown.airtel);
  document.getElementById('methodTigo').textContent = formatTZS(summary.paymentBreakdown.tigo);
  document.getElementById('methodBank').textContent = formatTZS(summary.paymentBreakdown.bank);

  // Low stock banner
  const lowStock = state.inventory.filter(i => (i.quantity || 0) <= (i.minThreshold || 0));
  const banner = document.getElementById('lowStockBanner');
  if (lowStock.length > 0) {
    banner.classList.remove('hidden');
    document.getElementById('lowStockCountText').textContent =
      `${lowStock.length} raw item${lowStock.length > 1 ? 's' : ''} running low (${lowStock.map(i => i.name).slice(0, 2).join(', ')})!`;
  } else {
    banner.classList.add('hidden');
  }

  // Recent transactions
  const recentList = document.getElementById('recentTxList');
  if (recentList) {
    const recent = state.transactions.slice(0, 5);
    if (recent.length === 0) {
      recentList.innerHTML = '<div class="empty-state" style="padding: 16px; font-size: 0.8rem; text-align: center; color: var(--text-muted);">No transactions recorded yet. Tap "+ Record Sale" above!</div>';
    } else {
      recentList.innerHTML = recent.map(t => renderTxItemHTML(t)).join('');
      attachTxDeleteListeners();
    }
  }
}

function renderTxItemHTML(t) {
  const isIncome = t.type === 'income';
  const isRebalance = t.category === 'balance_adjustment';
  const fee = Number(t.fee) || 0;
  const totalAmount = t.amount + fee;
  const sign = isIncome ? '+' : '-';
  const icon = isRebalance ? '⚖️' : (isIncome ? '↑' : '↓');

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
            ${fee > 0 ? `<span style="color: var(--amber); font-weight: 600;">• Fee: ${formatTZS(fee)}</span>` : ''}
            ${t.customerName ? `<span>• ${escapeHTML(t.customerName)}</span>` : ''}
          </span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="tx-amount">${sign}${formatTZS(totalAmount)}</span>
        <button class="btn-stock-adjust delete-tx-btn" data-tx-id="${t.id}" title="Delete" style="color: var(--text-muted); width: 26px; height: 26px; font-size: 0.85rem;">&times;</button>
      </div>
    </div>
  `;
}

function attachTxDeleteListeners() {
  document.querySelectorAll('.delete-tx-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.txId, 10);
      if (confirm('Delete this transaction?')) {
        await deleteTransaction(id);
        showToast('Transaction deleted', 'info');
        await loadAllData();
      }
    };
  });
}

// ==========================================
// TRANSACTIONS (LEDGER) TAB
// ==========================================
function renderTransactionsTab() {
  const container = document.getElementById('fullTxList');
  if (!container) return;

  const searchTerm = (document.getElementById('txSearchInput')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('txTypeFilter')?.value || 'all';

  let list = state.transactions;
  if (typeFilter !== 'all') list = list.filter(t => t.type === typeFilter);

  if (searchTerm) {
    list = list.filter(t =>
      (t.description || '').toLowerCase().includes(searchTerm) ||
      (t.customerName || '').toLowerCase().includes(searchTerm) ||
      (t.notes || '').toLowerCase().includes(searchTerm)
    );
  }

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: 20px; font-size: 0.82rem; text-align: center; color: var(--text-muted);">No matching transactions found.</div>';
    return;
  }

  container.innerHTML = list.map(t => renderTxItemHTML(t)).join('');
  attachTxDeleteListeners();
}

// ==========================================
// INVENTORY TAB (PERFUME ONLY)
// ==========================================
function renderInventoryTab() {
  const grid = document.getElementById('inventoryGrid');
  if (!grid) return;

  let items = state.inventory;
  if (state.currentInvFilter !== 'all') {
    items = items.filter(i => i.category === state.currentInvFilter);
  }

  if (items.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="padding: 20px; font-size: 0.82rem; text-align: center; color: var(--text-muted); grid-column: 1/-1;">No stock items in this category. Tap "+ Add Item" above.</div>';
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
            ${item.quantity} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">${item.unit || 'units'}</span>
          </div>
        </div>
        <div class="inv-footer">
          <span>Min Alert: ${item.minThreshold || 1} ${item.unit || ''}</span>
          <div class="inv-actions">
            <button class="btn-stock-adjust btn-decrement-stock" data-id="${item.id}" title="Decrease">-</button>
            <button class="btn-stock-adjust btn-increment-stock" data-id="${item.id}" title="Increase">+</button>
            <button class="btn-stock-adjust btn-delete-stock" data-id="${item.id}" title="Delete" style="color: var(--rose); font-size: 0.9rem;">&times;</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

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
      if (confirm('Delete this item from stock?')) {
        await deleteInventoryItem(id);
        showToast('Stock item deleted', 'info');
        await loadAllData();
      }
    };
  });
}

// ==========================================
// SOP LAB (ON-DEMAND FORMULATION GUIDE)
// ==========================================
function initSOPLab() {
  const recipeSelect = document.getElementById('sopRecipeSelect');
  const sizeSelect = document.getElementById('sopSizeSelect');

  if (recipeSelect) {
    const flagshipScents = RECIPES_CATALOG.filter(r => r.group === 'Flagship Scents');
    const signatureBlends = RECIPES_CATALOG.filter(r => r.group === 'Signature Blends');
    const pureScents = RECIPES_CATALOG.filter(r => r.group === 'Pure Scents');
    const customBlends = RECIPES_CATALOG.filter(r => r.group === 'Custom Blends');

    let html = '';
    if (flagshipScents.length > 0) {
      html += `<optgroup label="🏆 Flagship Signature Scents (Proprietary)">` +
        flagshipScents.map(r => `<option value="${r.id}">${r.name} — ${r.category}</option>`).join('') +
        `</optgroup>`;
    }
    if (signatureBlends.length > 0) {
      html += `<optgroup label="🌟 Finalized Signature Blends (SOP)">` +
        signatureBlends.map(r => `<option value="${r.id}">${r.name}</option>`).join('') +
        `</optgroup>`;
    }
    if (pureScents.length > 0) {
      html += `<optgroup label="💎 Pure Scents (The 9 Core Scents)">` +
        pureScents.map(r => `<option value="${r.id}">${r.name} — ${r.category}</option>`).join('') +
        `</optgroup>`;
    }
    if (customBlends.length > 0) {
      html += `<optgroup label="🧪 Custom Bespoke Blends">` +
        customBlends.map(r => `<option value="${r.id}">${r.name}</option>`).join('') +
        `</optgroup>`;
    }

    recipeSelect.innerHTML = html;

    recipeSelect.addEventListener('change', () => {
      state.selectedRecipeId = recipeSelect.value;
      renderSOPLab();
    });
  }

  if (sizeSelect) {
    sizeSelect.addEventListener('change', () => {
      state.selectedBottleSize = parseInt(sizeSelect.value, 10);
      renderSOPLab();
    });
  }
}

function renderSOPLab() {
  const m = getSOPMeasurements(state.selectedRecipeId, state.selectedBottleSize);
  state.activeSOPMeasurements = m;

  // Header badges
  document.getElementById('sopCardTitle').textContent = m.recipe.name;
  document.getElementById('sopCardCategory').textContent = `${m.recipe.category} • ${m.recipe.description}`;
  document.getElementById('sopPackageBadge').textContent = m.size === 6 ? '6ml Roller' : `${m.size}ml Spray`;
  document.getElementById('sopPriceBadge').textContent = formatTZS(m.sellingPrice);
  document.getElementById('sopSyringeSpec').textContent = m.syringeSpec;

  const restBadgeEl = document.getElementById('sopRestBadge');
  if (restBadgeEl) {
    restBadgeEl.textContent = `⏳ Rest: ${m.restTime}`;
  }

  // Render Measurements Grid based strictly on 60:40 formula (or 83:17 for 6ml)
  const measGrid = document.getElementById('sopMeasurementsGrid');
  if (measGrid) {
    let rows = '';
    m.ingredients.forEach((ing, idx) => {
      rows += `
        <div class="meas-card">
          <span class="meas-label">${idx + 1}. ${ing.name} (${ing.percentage}%)</span>
          <span class="meas-value text-amber">${ing.ml} ml</span>
        </div>
      `;
    });

    const carrierLabel = m.size === 6 ? 'Ethanol (17% Carrier)' : 'Perfumery Ethanol (40% Carrier)';
    rows += `
      <div class="meas-card">
        <span class="meas-label">${carrierLabel}</span>
        <span class="meas-value text-emerald">${m.ethanolMl} ml</span>
      </div>
      <div class="meas-card">
        <span class="meas-label">Fixative (Long-Lasting Anchor)</span>
        <span class="meas-value text-cyan">${m.fixativeDrops} drops</span>
      </div>
    `;
    measGrid.innerHTML = rows;
  }

  // Render authoritative step-by-step SOP compounding list from NolMart SOP v3.1
  const stepsList = document.getElementById('sopStepsList');
  if (stepsList) {
    let stepCount = 1;
    let steps = `
      <div class="sop-step-item">
        <div class="sop-step-num">${stepCount++}</div>
        <div><strong>Clean Work Area & Bottle Inspection:</strong> Work on a dry, sanitized flat surface. Inspect ${m.packagingName} for micro-cracks or dust. Verify syringe and needle are completely dry.</div>
      </div>
      <div class="sop-step-item">
        <div class="sop-step-num">${stepCount++}</div>
        <div><strong>Syringe Allocation:</strong> Use dedicated syringes for pure oils and a separate clean syringe for ethanol to prevent cross-contamination.</div>
      </div>
    `;

    if (m.ingredients.length === 1) {
      steps += `
        <div class="sop-step-item">
          <div class="sop-step-num">${stepCount++}</div>
          <div><strong>Draw Pure Essential Oil (${m.size === 6 ? '83%' : '60%'}):</strong> Draw exactly <strong>${m.ingredients[0].ml} ml</strong> of ${m.ingredients[0].name} using the calibrated oil syringe and inject into the bottle.</div>
        </div>
      `;
    } else {
      m.ingredients.forEach(ing => {
        steps += `
          <div class="sop-step-item">
            <div class="sop-step-num">${stepCount++}</div>
            <div><strong>Draw ${ing.name} (${ing.percentage}% of oil volume):</strong> Draw exactly <strong>${ing.ml} ml</strong> and inject into the mixing bottle.</div>
          </div>
        `;
      });
      steps += `
        <div class="sop-step-item">
          <div class="sop-step-num">${stepCount++}</div>
          <div><strong>Pre-Blend Oils:</strong> Swirl the combined pure oils gently for 1–2 minutes to fully integrate fragrance molecules before carrier addition.</div>
        </div>
      `;
    }

    steps += `
      <div class="sop-step-item">
        <div class="sop-step-num">${stepCount++}</div>
        <div><strong>Add Perfumery Ethanol (${m.size === 6 ? '17%' : '40%'}):</strong> Using the dedicated ethanol syringe, measure and slowly inject exactly <strong>${m.ethanolMl} ml</strong> of Ethanol into the bottle while swirling gently.</div>
      </div>
      <div class="sop-step-item">
        <div class="sop-step-num">${stepCount++}</div>
        <div><strong>Maceration & Marriage Period (${m.restTime}):</strong> Allow the solution to rest undisturbed for <strong>${m.restTime}</strong> so the carrier and aromatic oils marry properly.</div>
      </div>
      <div class="sop-step-item">
        <div class="sop-step-num">${stepCount++}</div>
        <div><strong>Add Fixative Drops LAST:</strong> Using the precision dropper, add <strong>exactly ${m.fixativeDrops} drops</strong> of Long-Lasting Fixative directly into the bottle. (Never add fixative before oils and ethanol are combined).</div>
      </div>
      <div class="sop-step-item">
        <div class="sop-step-num">${stepCount++}</div>
        <div><strong>Cap & Homogenize (30 seconds):</strong> Cap tightly and shake gently for 30 seconds. Conduct an inner-wrist skin-patch test before releasing to the client.</div>
      </div>
      <div class="sop-step-item">
        <div class="sop-step-num">${stepCount++}</div>
        <div><strong>Label & Deliver:</strong> Affix waterproof NolMart label (${m.recipe.name}, ${m.size}ml) and package into a Mifuko A6 bag for the client.</div>
      </div>
    `;

    stepsList.innerHTML = steps;
  }
}

// ==========================================
// SETTINGS, BACKUP & EXPORTS
// ==========================================
function initSettingsAndExports() {
  document.getElementById('downloadBackupBtn')?.addEventListener('click', async () => {
    try {
      await downloadFullBackup();
      showToast('Private backup downloaded!', 'success');
    } catch (e) {
      showToast('Backup failed: ' + e.message, 'error');
    }
  });

  const restoreInput = document.getElementById('restoreFileInput');
  if (restoreInput) {
    restoreInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (confirm('Restore records from backup file? Current data will be replaced.')) {
        try {
          await restoreFromFile(file);
          showToast('Records restored successfully!', 'success');
          await loadAllData();
          switchTab('tab-dashboard');
        } catch (err) {
          showToast('Restore error: ' + err.message, 'error');
        }
      }
    });
  }

  document.getElementById('exportTxCSVBtn')?.addEventListener('click', exportTransactionsToCSV);
  document.getElementById('exportAllTxCSV')?.addEventListener('click', exportTransactionsToCSV);
  document.getElementById('exportInvCSVBtn')?.addEventListener('click', exportInventoryToCSV);
  document.getElementById('exportAllInvCSV')?.addEventListener('click', exportInventoryToCSV);

  document.getElementById('clearDataBtn')?.addEventListener('click', async () => {
    if (confirm('WARNING: Reset all records to clean baseline? Make sure you have downloaded a backup first!')) {
      await clearAllLocalData();
      showToast('Records reset to baseline.', 'info');
      await loadAllData();
      switchTab('tab-dashboard');
    }
  });

  document.querySelectorAll('.filter-tab[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-period]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentPeriod = btn.dataset.period;
      renderDashboard();
    });
  });

  document.querySelectorAll('.filter-tab[data-inv-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-inv-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentInvFilter = btn.dataset.invFilter;
      renderInventoryTab();
    });
  });

  document.getElementById('txSearchInput')?.addEventListener('input', renderTransactionsTab);
  document.getElementById('txTypeFilter')?.addEventListener('change', renderTransactionsTab);
}

// Load data into memory & refresh
async function loadAllData() {
  await openDatabase();
  state.inventory = await getAllInventory();
  state.transactions = await getAllTransactions();
  state.financialSummary = await getFinancialSummary(state.currentPeriod);

  if (state.currentTab === 'tab-dashboard') renderDashboard();
  else if (state.currentTab === 'tab-transactions') renderTransactionsTab();
  else if (state.currentTab === 'tab-inventory') renderInventoryTab();
  else if (state.currentTab === 'tab-calculator') renderSOPLab();
}

// ==========================================
// INITIALIZATION
// ==========================================
async function startApp() {
  initPWA();
  initNavigation();
  initModals();
  initForms();
  initSOPLab();
  initSettingsAndExports();

  await loadAllData();
  renderSOPLab();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
