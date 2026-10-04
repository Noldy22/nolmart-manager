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
  clearAllLocalData,
  ensureCoreStock,
  localDateStr,
  getSetting,
  setSetting,
  restockInventoryItem,
  getAllGifts,
  addGift,
  deleteGift,
  getGiftsSummary
} from './db.js';

import {
  RECIPES_CATALOG,
  getSOPMeasurements,
  calculateMaxTransactionCost,
  calculateTransferFee,
  CAR_AIR_FRESHENER_RECIPES,
  CAR_AIR_FRESHENER_FORMATS,
  getCarAirFreshenerMeasurements
} from './calculator.js';

import {
  downloadFullBackup,
  restoreFromFile,
  exportTransactionsToCSV,
  exportInventoryToCSV,
  exportGiftsToCSV
} from './export.js';

import { initCustomSelects } from './custom-select.js';

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
  activeLabMode: 'perfume',
  selectedCarRecipeId: CAR_AIR_FRESHENER_RECIPES[0].id,
  selectedCarFormat: 'hanging_bottle',
  gifts: [],
  giftPeriod: 'all',
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

// Payment Channel Display Label Mapping
function getChannelLabel(key) {
  const map = {
    cash: 'Cash',
    mpesa: 'M-Pesa',
    airtel: 'Airtel Money',
    selcom: 'Selcom',
    bank: 'Bank / CRDB',
    tigo: 'Mixx by Yas (Tigo)'
  };
  return map[(key || '').toLowerCase()] || (key ? key.toUpperCase() : 'Cash');
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
  document.getElementById('viewGiftsTabBtn')?.addEventListener('click', () => switchTab('tab-gifts'));
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
  else if (tabId === 'tab-gifts') renderGiftsTab();
}

// ==========================================
// MODALS
// ==========================================
function initModals() {
  // Open Sale Modal
  document.getElementById('openSaleModalBtn')?.addEventListener('click', () => {
    const dateInput = document.getElementById('saleDate');
    if (dateInput) dateInput.value = localDateStr();
    openModal('saleModal');
  });

  // Open Expense Modal
  document.getElementById('openExpenseModalBtn')?.addEventListener('click', () => {
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) dateInput.value = localDateStr();
    updateExpenseCalculations();
    openModal('expenseModal');
  });

  // Open Transfer Modal
  const openTransferHandler = () => {
    const dateInput = document.getElementById('transferDate');
    if (dateInput) dateInput.value = localDateStr();
    updateTransferCalculations();
    openModal('transferModal');
  };
  document.getElementById('openTransferModalBtn')?.addEventListener('click', openTransferHandler);
  document.getElementById('openTransferFromChannelsBtn')?.addEventListener('click', openTransferHandler);

  // Open Capital Modal
  document.getElementById('openCapitalModalBtn')?.addEventListener('click', () => {
    const dateInput = document.getElementById('capitalDate');
    if (dateInput) dateInput.value = localDateStr();
    openModal('capitalModal');
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

  // Open Gift / Complimentary Modal
  const openGiftHandler = () => {
    const dateInput = document.getElementById('giftDate');
    if (dateInput) dateInput.value = localDateStr();
    updateGiftModalDefaults();
    openModal('giftModal');
  };
  document.getElementById('openGiftModalBtn')?.addEventListener('click', openGiftHandler);
  document.getElementById('openGiftModalFromTabBtn')?.addEventListener('click', openGiftHandler);

  const giftProductSelect = document.getElementById('giftProductTypeSelect');
  giftProductSelect?.addEventListener('change', updateGiftModalDefaults);
  const giftDescInput = document.getElementById('giftDescription');
  giftDescInput?.addEventListener('input', () => {
    giftDescInput.dataset.autoFilled = 'false';
  });

  // Open Fulfill Order Modal from SOP Lab
  document.getElementById('openFulfillOrderBtn')?.addEventListener('click', () => {
    if (!state.activeSOPMeasurements) return;
    const m = state.activeSOPMeasurements;
    const itemTitle = m.isCarFreshener ? `${m.recipe.name} (${m.format.name})` : `${m.recipe.name} (${m.size}ml)`;
    document.getElementById('fulfillItemSummary').textContent = itemTitle;
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
  const saleQtyEl = document.getElementById('saleQuantity');
  const saleDescEl = document.getElementById('saleDescription');
  const saleFormEl = document.getElementById('saleForm');
  const saleAmountEl = document.getElementById('saleAmount');

  function updateSaleDiscountNotice() {
    const noticeEl = document.getElementById('saleDiscountNotice');
    if (!saleAmountEl || !noticeEl) return;
    const defaultPrice = parseFloat(saleAmountEl.dataset.defaultPrice || 35000);
    const entered = parseFloat(saleAmountEl.value) || 0;
    if (entered < defaultPrice && entered > 0) {
      const discount = defaultPrice - entered;
      const pct = Math.round((discount / defaultPrice) * 100);
      noticeEl.textContent = `Discount: -${formatTZS(discount)} (${pct}% off standard ${formatTZS(defaultPrice)})`;
      noticeEl.style.display = 'block';
    } else {
      noticeEl.style.display = 'none';
    }
  }

  const applySaleType = () => {
    const opt = saleTypeSelect.options[saleTypeSelect.selectedIndex];
    const qty = Math.max(1, parseInt(saleQtyEl.value, 10) || 1);
    if (opt.value !== 'custom') {
      const stdPrice = Number(opt.value) * qty;
      saleAmountEl.value = stdPrice;
      saleAmountEl.dataset.defaultPrice = stdPrice;
    }
    // Auto-fill description for car fresheners (only if empty or previously auto-filled)
    if (opt.dataset.category === 'car_freshener_sale') {
      if (!saleDescEl.value.trim() || saleDescEl.value === saleFormEl.dataset.autoDesc) {
        saleDescEl.value = opt.dataset.desc;
        saleFormEl.dataset.autoDesc = opt.dataset.desc;
      }
    } else if (saleDescEl.value === saleFormEl.dataset.autoDesc) {
      saleDescEl.value = '';
      saleFormEl.dataset.autoDesc = '';
    }
    updateSaleDiscountNotice();
  };

  if (saleTypeSelect) {
    saleTypeSelect.addEventListener('change', applySaleType);
    saleQtyEl?.addEventListener('input', applySaleType);
  }
  if (saleAmountEl) {
    saleAmountEl.addEventListener('input', updateSaleDiscountNotice);
  }

  // Quick preset pills in Sale modal
  const pillBtns = document.querySelectorAll('#saleModal .btn-size-pill');
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255,255,255,0.06)';
        b.style.borderColor = 'var(--border)';
        b.style.color = '#fff';
      });
      btn.classList.add('active');
      btn.style.background = 'rgba(16, 185, 129, 0.2)';
      btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      btn.style.color = 'var(--emerald)';

      const price = parseFloat(btn.dataset.price) || 0;
      const desc = btn.dataset.desc || '';
      const cat = btn.dataset.category || 'perfume_sale';

      const qty = Math.max(1, parseInt(saleQtyEl?.value, 10) || 1);
      const totalStd = price * qty;

      if (saleAmountEl) {
        saleAmountEl.value = totalStd;
        saleAmountEl.dataset.defaultPrice = totalStd;
      }
      if (saleDescEl && (!saleDescEl.value || saleDescEl.value === saleFormEl.dataset.autoDesc)) {
        saleDescEl.value = desc;
        saleFormEl.dataset.autoDesc = desc;
      }

      if (saleTypeSelect) {
        for (let i = 0; i < saleTypeSelect.options.length; i++) {
          const opt = saleTypeSelect.options[i];
          if (opt.value === String(price) && (!btn.dataset.category || opt.dataset.category === btn.dataset.category)) {
            saleTypeSelect.selectedIndex = i;
            break;
          }
        }
      }
      updateSaleDiscountNotice();
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

function updateGiftModalDefaults() {
  const select = document.getElementById('giftProductTypeSelect');
  if (!select) return;
  const opt = select.options[select.selectedIndex];
  if (!opt) return;

  const cost = opt.dataset.cost;
  const retail = opt.dataset.retail;
  const desc = opt.dataset.desc;

  const costEl = document.getElementById('giftProductionCost');
  const retailEl = document.getElementById('giftRetailValue');
  const descEl = document.getElementById('giftDescription');

  if (costEl && cost !== undefined) costEl.value = cost;
  if (retailEl && retail !== undefined) retailEl.value = retail;
  if (descEl && desc && (!descEl.value || descEl.dataset.autoFilled === 'true')) {
    descEl.value = desc;
    descEl.dataset.autoFilled = 'true';
  }
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
      const date = document.getElementById('saleDate').value || localDateStr();
      const rawNotes = document.getElementById('saleNotes').value.trim();
      const source = document.getElementById('saleSource')?.value || '';
      const notes = source ? `[${source}] ${rawNotes}`.trim() : rawNotes;

      const typeSel = document.getElementById('saleProductTypeSelect');
      const selOpt = typeSel.options[typeSel.selectedIndex];
      const saleCategory = (selOpt && selOpt.dataset.category) || 'perfume_sale';
      const isCarSale = saleCategory === 'car_freshener_sale';

      try {
        let deductions = [];
        let stockNote = '';
        if (isCarSale) {
          const unitItem = (await getAllInventory()).find(i => i.category === 'car_freshener' && i.subCategory === 'car_freshener_unit');
          if (unitItem) {
            await adjustStock(unitItem.id, -quantity);
            deductions.push({ id: unitItem.id, name: unitItem.name, qty: quantity, unit: unitItem.unit });
            stockNote = ` • stock ${Math.max(0, (unitItem.quantity || 0) - quantity)} left`;
          }
        }

        await addTransaction({
          type: 'income',
          category: saleCategory,
          description,
          quantity,
          amount,
          paymentMethod,
          customerName,
          customerPhone,
          date,
          source,
          notes,
          deductions
        });

        closeModal('saleModal');
        saleForm.reset();
        saleForm.dataset.autoDesc = '';
        const discNotice = document.getElementById('saleDiscountNotice');
        if (discNotice) discNotice.style.display = 'none';

        showToast(`${isCarSale ? '🚗 Car freshener sale' : 'Sale'} recorded: +${formatTZS(amount)} (${getChannelLabel(paymentMethod)})${stockNote}`, 'success');
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
      const rawNotes = document.getElementById('fulfillNotes').value.trim();
      const source = document.getElementById('fulfillSource')?.value || '';
      const notes = source ? `[${source}] Blended on-demand via SOP. ${rawNotes}`.trim() : `Blended on-demand via SOP. ${rawNotes}`.trim();

      try {
        let deductions = [];
        let category = '';
        let description = '';

        if (m.isCarFreshener) {
          category = 'car_freshener_sale';
          description = `${m.recipe.name} (${m.format.name})`;
          if (m.formatKey === 'hanging_bottle') {
            deductions = await deductIngredientsForBlend({
              ingredients: [{ key: m.recipe.scentKey, name: m.recipe.oilName, ml: m.format.oilMl }],
              fixativeDrops: m.format.fixativeDrops,
              ethanolMl: 0,
              dpgMl: m.format.dpgMl,
              bottleSize: 'car_diffuser_bottle',
              bottleCount: 1,
              isCarFreshener: true
            });
          } else {
            const unitItem = (await getAllInventory()).find(i => i.category === 'car_freshener');
            if (unitItem) {
              await adjustStock(unitItem.id, -1);
              deductions.push({ id: unitItem.id, name: unitItem.name, qty: 1, unit: unitItem.unit });
            }
          }
        } else {
          category = `perfume_${m.size}ml`;
          description = `${m.recipe.name} (${m.size}ml)`;
          deductions = await deductIngredientsForBlend({
            ingredients: m.ingredients,
            fixativeDrops: m.fixativeDrops,
            ethanolMl: m.ethanolMl,
            bottleSize: m.size,
            bottleCount: 1
          });
        }

        // 2. Record sale into transactions ledger
        await addTransaction({
          type: 'income',
          category,
          description,
          quantity: 1,
          amount: m.sellingPrice,
          paymentMethod,
          customerName,
          customerPhone,
          date: localDateStr(),
          source,
          notes,
          deductions: deductions || []
        });

        closeModal('fulfillModal');
        fulfillForm.reset();
        showToast(`${m.isCarFreshener ? '🚗 Car freshener' : 'Perfume'} compounded & stock deducted! +${formatTZS(m.sellingPrice)}`, 'success');
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
        const todayStr = localDateStr();
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

  // 6. Transfer / Money Movement Form
  const transferForm = document.getElementById('transferForm');
  const transferFromEl = document.getElementById('transferFromMethod');
  const transferToEl = document.getElementById('transferToMethod');
  const transferAmountEl = document.getElementById('transferAmount');
  const transferFeeEl = document.getElementById('transferFee');

  if (transferFromEl) {
    transferFromEl.addEventListener('change', () => {
      if (transferToEl && transferToEl.value === transferFromEl.value) {
        const options = Array.from(transferToEl.options).map(o => o.value);
        const alt = options.find(val => val !== transferFromEl.value) || 'airtel';
        transferToEl.value = alt;
      }
      updateTransferCalculations();
    });
  }

  if (transferToEl) {
    transferToEl.addEventListener('change', () => {
      if (transferFromEl && transferFromEl.value === transferToEl.value) {
        const options = Array.from(transferFromEl.options).map(o => o.value);
        const alt = options.find(val => val !== transferToEl.value) || 'cash';
        transferFromEl.value = alt;
      }
      updateTransferCalculations();
    });
  }

  if (transferAmountEl) {
    transferAmountEl.addEventListener('input', updateTransferCalculations);
  }

  if (transferFeeEl) {
    transferFeeEl.addEventListener('input', () => {
      const amt = Math.max(0, parseFloat(transferAmountEl?.value) || 0);
      const fee = Math.max(0, parseFloat(transferFeeEl.value) || 0);
      const sourceOutflowEl = document.getElementById('transferSourceOutflow');
      if (sourceOutflowEl) sourceOutflowEl.textContent = `-${formatTZS(amt + fee)}`;
    });
  }

  if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fromMethod = transferFromEl.value;
      const toMethod = transferToEl.value;
      const amount = parseFloat(transferAmountEl.value) || 0;
      let fee = parseFloat(transferFeeEl.value) || 0;
      if (fromMethod === 'cash') fee = 0; // Enforce cash transfers have 0 fee
      const date = document.getElementById('transferDate').value;
      const notes = (document.getElementById('transferNotes')?.value || '').trim();

      if (fromMethod === toMethod) {
        showToast('Source and destination accounts must be different.', 'error');
        return;
      }

      if (amount <= 0) {
        showToast('Transfer amount must be greater than 0 TZS.', 'error');
        return;
      }

      try {
        const fromName = getChannelLabel(fromMethod);
        const toName = getChannelLabel(toMethod);

        await addTransaction({
          type: 'transfer',
          category: 'account_transfer',
          description: `Transfer: ${fromName} → ${toName}`,
          amount,
          fee,
          fromMethod,
          toMethod,
          paymentMethod: fromMethod,
          date,
          notes: fee > 0 ? `${notes ? notes + ' | ' : ''}Tariff: ${formatTZS(fee)}` : notes
        });

        closeModal('transferModal');
        transferForm.reset();
        showToast(`⇄ Moved ${formatTZS(amount)}: ${fromName} → ${toName}${fee > 0 ? ` (Fee: ${formatTZS(fee)})` : ' (0 Fee)'}`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error recording transfer: ' + err.message, 'error');
      }
    });
  }

  // 7. Restock Inventory Form
  const restockForm = document.getElementById('restockForm');
  if (restockForm) {
    restockForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const itemId = parseInt(document.getElementById('restockItemId').value, 10);
      const quantity = parseFloat(document.getElementById('restockQtyToAdd').value) || 0;
      const totalCost = parseFloat(document.getElementById('restockTotalCost').value) || 0;
      const paymentMethod = document.getElementById('restockPaymentMethod').value;
      const notes = document.getElementById('restockNotes').value.trim();

      try {
        await restockInventoryItem({ itemId, quantity, totalCost, paymentMethod, notes });
        closeModal('restockModal');
        restockForm.reset();
        showToast(`📦 Restocked (+${quantity})${totalCost > 0 ? ` & expense logged (-${formatTZS(totalCost)})` : ''}`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error restocking: ' + err.message, 'error');
      }
    });
  }

  // 8. Capital Injection Form
  const capitalForm = document.getElementById('capitalForm');
  if (capitalForm) {
    capitalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const paymentMethod = document.getElementById('capitalPaymentMethod').value;
      const amount = parseFloat(document.getElementById('capitalAmount').value) || 0;
      const description = document.getElementById('capitalDescription').value.trim() || 'Capital Injection';
      const date = document.getElementById('capitalDate').value || localDateStr();

      try {
        await addTransaction({
          type: 'income',
          category: 'capital',
          description,
          amount,
          paymentMethod,
          date,
          fee: 0,
          notes: 'Capital / Opening balance'
        });
        closeModal('capitalModal');
        capitalForm.reset();
        showToast(`💰 Capital added: +${formatTZS(amount)} (${getChannelLabel(paymentMethod)})`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error recording capital: ' + err.message, 'error');
      }
    });
  }

  // 9. Gift / Complimentary Handout Form
  const giftForm = document.getElementById('giftForm');
  if (giftForm) {
    giftForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const productTypeSel = document.getElementById('giftProductTypeSelect');
      const opt = productTypeSel.options[productTypeSel.selectedIndex];
      const productTypeKey = productTypeSel.value;
      const productTypeName = opt ? opt.text.split('(')[0].trim() : productTypeKey;

      const description = document.getElementById('giftDescription').value.trim();
      const quantity = parseInt(document.getElementById('giftQuantity').value, 10) || 1;
      const purpose = document.getElementById('giftPurpose').value;
      const recipientName = document.getElementById('giftRecipientName').value.trim();
      const recipientContact = document.getElementById('giftRecipientContact').value.trim();
      const productionCost = parseFloat(document.getElementById('giftProductionCost').value) || 0;
      const retailPrice = parseFloat(document.getElementById('giftRetailValue').value) || 0;
      const date = document.getElementById('giftDate').value || localDateStr();
      const deductStock = document.getElementById('giftDeductStock')?.checked ?? true;
      const notes = document.getElementById('giftNotes').value.trim();

      try {
        let deductions = [];
        if (deductStock) {
          if (productTypeKey === 'car_hanging') {
            deductions = await deductIngredientsForBlend({
              ingredients: [{ key: 'strawberry', name: description || 'Fragrance Oil', ml: 2.5 }],
              fixativeDrops: 4,
              ethanolMl: 0,
              dpgMl: 5.5,
              bottleSize: 'car_diffuser_bottle',
              bottleCount: quantity,
              isCarFreshener: true
            });
          } else if (productTypeKey === 'car_gel') {
            const unitItem = (await getAllInventory()).find(i => i.category === 'car_freshener');
            if (unitItem) {
              await adjustStock(unitItem.id, -quantity);
              deductions.push({ id: unitItem.id, name: unitItem.name, qty: quantity, unit: unitItem.unit });
            }
          } else if (productTypeKey === 'perfume_6ml') {
            deductions = await deductIngredientsForBlend({
              ingredients: [{ key: 'oil', name: description || 'Perfume Oil', ml: 5.0 }],
              fixativeDrops: 2,
              ethanolMl: 1.0,
              bottleSize: 6,
              bottleCount: quantity
            });
          } else if (productTypeKey === 'perfume_10ml') {
            deductions = await deductIngredientsForBlend({
              ingredients: [{ key: 'oil', name: description || 'Perfume Oil', ml: 6.0 }],
              fixativeDrops: 2,
              ethanolMl: 4.0,
              bottleSize: 10,
              bottleCount: quantity
            });
          } else if (productTypeKey === 'perfume_30ml') {
            deductions = await deductIngredientsForBlend({
              ingredients: [{ key: 'oil', name: description || 'Perfume Oil', ml: 18.0 }],
              fixativeDrops: 4,
              ethanolMl: 12.0,
              bottleSize: 30,
              bottleCount: quantity
            });
          }
        }

        await addGift({
          productType: productTypeName,
          productTypeKey,
          description,
          quantity,
          purpose,
          recipientName,
          recipientContact,
          productionCost,
          retailPrice,
          date,
          deductions,
          notes
        });

        closeModal('giftModal');
        giftForm.reset();
        showToast(`🎁 Gift logged for ${recipientName} (${quantity} unit${quantity > 1 ? 's' : ''})!`, 'success');
        await loadAllData();
      } catch (err) {
        showToast('Error recording gift: ' + err.message, 'error');
      }
    });
  }
}

// ==========================================
// DYNAMIC EXPENSE, TRANSFER & REBALANCE HELPERS
// ==========================================
function updateTransferCalculations() {
  const fromEl = document.getElementById('transferFromMethod');
  const toEl = document.getElementById('transferToMethod');
  const amountEl = document.getElementById('transferAmount');
  const feeEl = document.getElementById('transferFee');
  const feeNoticeEl = document.getElementById('transferFeeNotice');
  const fromHintEl = document.getElementById('transferFromBalanceHint');
  const toHintEl = document.getElementById('transferToBalanceHint');
  const sourceOutflowEl = document.getElementById('transferSourceOutflow');
  const destInflowEl = document.getElementById('transferDestInflow');

  if (!fromEl || !toEl) return;

  const from = fromEl.value;
  const to = toEl.value;
  const breakdown = state.financialSummary ? state.financialSummary.paymentBreakdown : {};

  if (fromHintEl) {
    const fromBal = breakdown[from] !== undefined ? breakdown[from] : 0;
    fromHintEl.textContent = `Available: ${formatTZS(fromBal)}`;
  }

  if (toHintEl) {
    const toBal = breakdown[to] !== undefined ? breakdown[to] : 0;
    toHintEl.textContent = `Available: ${formatTZS(toBal)}`;
  }

  const amt = Math.max(0, parseFloat(amountEl?.value) || 0);

  let fee = 0;
  if (from === 'cash') {
    // Explicit User Rule: Movement from cash has NO fee (0 fee)
    fee = 0;
    if (feeEl) {
      feeEl.value = 0;
      feeEl.disabled = true;
    }
    if (feeNoticeEl) {
      feeNoticeEl.textContent = '✓ Cash deposit / payment has NO fee (0 TZS).';
      feeNoticeEl.style.color = 'var(--emerald)';
    }
  } else {
    // Non-cash transfers are subjected to payment fees
    if (feeEl) {
      feeEl.disabled = false;
      if (document.activeElement !== feeEl) {
        fee = calculateTransferFee(amt, from, to);
        feeEl.value = fee;
      } else {
        fee = Math.max(0, parseFloat(feeEl.value) || 0);
      }
    }
    if (feeNoticeEl) {
      feeNoticeEl.textContent = `⚡ Transfer tariff (+${formatTZS(fee)}) auto-calculated for ${getChannelLabel(from)}. Editable.`;
      feeNoticeEl.style.color = 'var(--amber)';
    }
  }

  const totalSourceDeduction = amt + fee;
  if (sourceOutflowEl) {
    sourceOutflowEl.textContent = `-${formatTZS(totalSourceDeduction)}`;
  }
  if (destInflowEl) {
    destInflowEl.textContent = `+${formatTZS(amt)}`;
  }
}
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
  const salesCountText = `${summary.salesCount || 0} sale${(summary.salesCount || 0) === 1 ? '' : 's'} (${summary.totalTransactions} total entries)`;
  document.getElementById('statSalesCount').textContent = salesCountText;
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
  const selcomEl = document.getElementById('methodSelcom');
  if (selcomEl) selcomEl.textContent = formatTZS(summary.paymentBreakdown.selcom || 0);
  document.getElementById('methodBank').textContent = formatTZS(summary.paymentBreakdown.bank);

  const tigoBal = summary.paymentBreakdown.tigo || 0;
  const tigoEl = document.getElementById('methodTigo');
  if (tigoEl) tigoEl.textContent = formatTZS(tigoBal);
  const tigoCard = document.getElementById('cardTigo');
  if (tigoCard) {
    tigoCard.style.display = tigoBal > 0 ? 'flex' : 'none';
  }

  // Sales by product line
  const carSales = summary.carFreshenerSales || 0;
  const otherSales = summary.totalSales - carSales;
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setText('plPerfumeAmount', formatTZS(otherSales));
  setText('plPerfumeMeta', 'Perfumes, rollers, sets & dropship');
  setText('plCarAmount', formatTZS(carSales));
  setText('plCarMeta', `${summary.carFreshenerUnits || 0} unit${(summary.carFreshenerUnits || 0) === 1 ? '' : 's'} sold • ${summary.carFreshenerCount || 0} sale${(summary.carFreshenerCount || 0) === 1 ? '' : 's'}`);

  // Gifts & Sampling Compensation Summary
  const giftsSummary = await getGiftsSummary(state.currentPeriod);
  const totalSalesVal = summary.totalSales || 0;
  const giftCost = giftsSummary.totalProductionCost || 0;
  const giftRetail = giftsSummary.totalRetailValue || 0;
  const giftUnits = giftsSummary.totalUnits || 0;
  const giftCostRatio = totalSalesVal > 0 ? ((giftCost / totalSalesVal) * 100) : 0;

  setText('dashGiftUnits', `${giftUnits} unit${giftUnits === 1 ? '' : 's'}`);
  setText('dashGiftCostMeta', `Cost: ${formatTZS(giftCost)}`);
  setText('dashGiftRetailMeta', `Retail: ${formatTZS(giftRetail)}`);
  setText('dashGiftRatio', totalSalesVal > 0 ? `${giftCostRatio.toFixed(1)}%` : (giftUnits > 0 ? 'Sampling' : '0.0%'));

  const adviceBadge = document.getElementById('dashGiftAdviceBadge');
  if (adviceBadge) {
    if (giftUnits === 0) {
      adviceBadge.textContent = 'No Gifts Given';
      adviceBadge.style.color = 'var(--text-muted)';
      adviceBadge.style.background = 'rgba(255, 255, 255, 0.05)';
      adviceBadge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    } else if (totalSalesVal === 0) {
      adviceBadge.textContent = 'Sampling Phase';
      adviceBadge.style.color = 'var(--amber)';
      adviceBadge.style.background = 'rgba(245, 158, 11, 0.15)';
      adviceBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    } else if (giftCostRatio <= 10) {
      adviceBadge.textContent = `🟢 Self-Compensating (${giftCostRatio.toFixed(1)}%)`;
      adviceBadge.style.color = 'var(--emerald)';
      adviceBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      adviceBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else if (giftCostRatio <= 20) {
      adviceBadge.textContent = `🟡 Moderate (${giftCostRatio.toFixed(1)}%)`;
      adviceBadge.style.color = 'var(--amber)';
      adviceBadge.style.background = 'rgba(245, 158, 11, 0.15)';
      adviceBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    } else {
      adviceBadge.textContent = `🔴 High Ratio (${giftCostRatio.toFixed(1)}%)`;
      adviceBadge.style.color = 'var(--rose)';
      adviceBadge.style.background = 'rgba(244, 63, 94, 0.15)';
      adviceBadge.style.borderColor = 'rgba(244, 63, 94, 0.3)';
    }
  }

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
  const isTransfer = t.type === 'transfer';
  const isRebalance = t.category === 'balance_adjustment';
  const fee = Number(t.fee) || 0;

  if (isTransfer) {
    const fromName = getChannelLabel(t.fromMethod || t.paymentMethod || 'cash');
    const toName = getChannelLabel(t.toMethod || '');
    const amt = Number(t.amount) || 0;
    const totalDeducted = amt + fee;

    return `
      <div class="tx-item tx-transfer">
        <div class="tx-left">
          <div class="tx-icon">⇄</div>
          <div class="tx-details">
            <span class="tx-name">${escapeHTML(t.description || `Transfer: ${fromName} → ${toName}`)}</span>
            <span class="tx-meta">
              <span>${t.date}</span>
              <span>•</span>
              <span class="tx-payment-badge transfer-badge">${escapeHTML(fromName)} → ${escapeHTML(toName)}</span>
              ${fee > 0 ? `<span style="color: var(--amber); font-weight: 600;">• Fee: ${formatTZS(fee)}</span>` : '<span style="color: var(--emerald); font-weight: 500;">• Free (0 Fee)</span>'}
              ${t.notes ? `<span>• ${escapeHTML(t.notes)}</span>` : ''}
            </span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="text-align: right;">
            <span class="tx-amount">${formatTZS(amt)}</span>
            ${fee > 0 ? `<div style="font-size: 0.68rem; color: var(--text-muted);">Outflow: -${formatTZS(totalDeducted)}</div>` : ''}
          </div>
          <button class="btn-stock-adjust delete-tx-btn" data-tx-id="${t.id}" title="Delete" style="color: var(--text-muted); width: 26px; height: 26px; font-size: 0.85rem;">&times;</button>
        </div>
      </div>
    `;
  }

  const totalAmount = t.amount + fee;
  const sign = isIncome ? '+' : '-';
  const isCar = t.category === 'car_freshener_sale' || t.category === 'car_freshener_supplies';
  const icon = isRebalance ? '⚖️' : (isCar ? '🚗' : (isIncome ? '↑' : '↓'));

  const rawSource = t.source || (t.notes ? (t.notes.match(/^\[(.*?)\]/)?.[1] || '') : '');
  const sourceIcons = {
    'Direct Call': '📞 Direct Call',
    'WhatsApp': '💬 WhatsApp',
    'Instagram': '📸 Instagram',
    'TikTok': '🎵 TikTok',
    'Website': '🌐 Website',
    'Walk-in': '🚶 Walk-in'
  };
  const sourceLabel = rawSource ? (sourceIcons[rawSource] || rawSource) : '';

  return `
    <div class="tx-item ${isIncome ? 'tx-income' : 'tx-expense'}">
      <div class="tx-left">
        <div class="tx-icon">${icon}</div>
        <div class="tx-details">
          <span class="tx-name">${escapeHTML(t.description || 'Transaction')}</span>
          <span class="tx-meta">
            <span>${t.date}</span>
            <span>•</span>
            <span class="tx-payment-badge">${escapeHTML(getChannelLabel(t.paymentMethod || 'cash'))}</span>
            ${sourceLabel ? `<span class="tx-source-badge">${escapeHTML(sourceLabel)}</span>` : ''}
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
  if (typeFilter === 'car_freshener') {
    list = list.filter(t => t.category === 'car_freshener_sale' || t.category === 'car_freshener_supplies');
  } else if (typeFilter !== 'all') {
    list = list.filter(t => t.type === typeFilter);
  }

  if (searchTerm) {
    list = list.filter(t =>
      (t.description || '').toLowerCase().includes(searchTerm) ||
      (t.customerName || '').toLowerCase().includes(searchTerm) ||
      (t.notes || '').toLowerCase().includes(searchTerm) ||
      (t.source || '').toLowerCase().includes(searchTerm)
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
            <button class="btn-restock-item" data-id="${item.id}" data-name="${escapeHTML(item.name)}" data-unit="${item.unit || 'units'}" data-qty="${item.quantity}" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: var(--cyan); border-radius: 4px; padding: 2px 7px; font-size: 0.72rem; font-weight: 600; cursor: pointer;">+ Restock</button>
            <button class="btn-stock-adjust btn-decrement-stock" data-id="${item.id}" title="Decrease">-</button>
            <button class="btn-stock-adjust btn-increment-stock" data-id="${item.id}" title="Increase">+</button>
            <button class="btn-stock-adjust btn-delete-stock" data-id="${item.id}" title="Delete" style="color: var(--rose); font-size: 0.9rem;">&times;</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.btn-restock-item').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const unit = btn.dataset.unit;
      const qty = btn.dataset.qty;

      const idEl = document.getElementById('restockItemId');
      const nameEl = document.getElementById('restockItemName');
      const qtyEl = document.getElementById('restockCurrentQty');
      const unitEl = document.getElementById('restockItemUnit');
      const unitLbl = document.getElementById('restockUnitLabel');
      const addEl = document.getElementById('restockQtyToAdd');
      const costEl = document.getElementById('restockTotalCost');
      const notesEl = document.getElementById('restockNotes');

      if (idEl) idEl.value = id;
      if (nameEl) nameEl.textContent = name;
      if (qtyEl) qtyEl.textContent = qty;
      if (unitEl) unitEl.textContent = unit;
      if (unitLbl) unitLbl.textContent = unit;
      if (addEl) addEl.value = '';
      if (costEl) costEl.value = '0';
      if (notesEl) notesEl.value = '';

      openModal('restockModal');
    };
  });

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
  const carRecipeSelect = document.getElementById('sopCarRecipeSelect');
  const carFormatSelect = document.getElementById('sopCarFormatSelect');
  const perfumeBtn = document.getElementById('labModePerfumeBtn');
  const carBtn = document.getElementById('labModeCarBtn');

  // Mode Switcher
  perfumeBtn?.addEventListener('click', () => {
    state.activeLabMode = 'perfume';
    perfumeBtn.classList.add('active');
    carBtn?.classList.remove('active');
    renderSOPLab();
  });

  carBtn?.addEventListener('click', () => {
    state.activeLabMode = 'car';
    carBtn.classList.add('active');
    perfumeBtn?.classList.remove('active');
    renderSOPLab();
  });

  // Populate Perfume Recipes
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

  // Populate Car Air Freshener Recipes (SOP v1.2)
  if (carRecipeSelect) {
    carRecipeSelect.innerHTML = CAR_AIR_FRESHENER_RECIPES.map(r =>
      `<option value="${r.id}">${r.name} [${r.status}]</option>`
    ).join('');

    carRecipeSelect.addEventListener('change', () => {
      state.selectedCarRecipeId = carRecipeSelect.value;
      renderSOPLab();
    });
  }

  if (carFormatSelect) {
    carFormatSelect.addEventListener('change', () => {
      state.selectedCarFormat = carFormatSelect.value;
      renderSOPLab();
    });
  }
}

function renderSOPLab() {
  const isCar = state.activeLabMode === 'car';
  const perfumeControls = document.getElementById('sopPerfumeControls');
  const carControls = document.getElementById('sopCarControls');
  const perfumeBtn = document.getElementById('labModePerfumeBtn');
  const carBtn = document.getElementById('labModeCarBtn');
  const mainHeading = document.getElementById('labMainHeading');
  const subHeading = document.getElementById('labSubHeading');
  const fulfillBtn = document.getElementById('openFulfillOrderBtn');

  if (isCar) {
    if (perfumeControls) perfumeControls.style.display = 'none';
    if (carControls) carControls.style.display = 'grid';
    if (perfumeBtn) perfumeBtn.classList.remove('active');
    if (carBtn) carBtn.classList.add('active');
    if (mainHeading) mainHeading.textContent = 'Car Air Freshener Compounding SOP (v1.2)';
    if (subHeading) subHeading.textContent = 'Authoritative vehicle formulation: DPG carrier only (NO ethanol, NO water in hanging bottles) or 120g Agar gel tin.';
    if (fulfillBtn) fulfillBtn.textContent = '✓ Make Car Freshener & Deduct Stock';

    const m = getCarAirFreshenerMeasurements(state.selectedCarRecipeId, state.selectedCarFormat);
    state.activeSOPMeasurements = m;

    document.getElementById('sopCardTitle').textContent = m.recipe.name;
    document.getElementById('sopCardCategory').textContent = `${m.category} • Rating: ${m.recipe.rating} — ${m.recipe.description}`;
    document.getElementById('sopPackageBadge').textContent = m.formatKey === 'hanging_bottle' ? '8ml Hanging Glass' : '120g Gel Tin';
    document.getElementById('sopPriceBadge').textContent = `${formatTZS(m.sellingPrice)} (Retail)`;
    document.getElementById('sopSyringeSpec').textContent = m.syringeSpec;

    const restBadgeEl = document.getElementById('sopRestBadge');
    if (restBadgeEl) restBadgeEl.textContent = `⏳ Rest: ${m.restTime}`;

    // Render Measurements Grid
    const measGrid = document.getElementById('sopMeasurementsGrid');
    if (measGrid) {
      let rows = '';
      m.ingredients.forEach((ing, idx) => {
        rows += `
          <div class="meas-card">
            <span class="meas-label">${idx + 1}. ${ing.name} (${ing.percentage})</span>
            <span class="meas-value text-amber">${ing.amount}</span>
            <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">${ing.role}</div>
          </div>
        `;
      });
      measGrid.innerHTML = rows;
    }

    // Render Step-by-Step SOP compounding guide from authoritative SOP v1.2
    const stepsList = document.getElementById('sopStepsList');
    if (stepsList) {
      stepsList.innerHTML = m.steps.map((st, idx) => `
        <div class="sop-step-item">
          <div class="sop-step-num">${idx + 1}</div>
          <div>${st}</div>
        </div>
      `).join('');
    }
  } else {
    // Perfume Mode
    if (perfumeControls) perfumeControls.style.display = 'grid';
    if (carControls) carControls.style.display = 'none';
    if (perfumeBtn) perfumeBtn.classList.add('active');
    if (carBtn) carBtn.classList.remove('active');
    if (mainHeading) mainHeading.textContent = 'Perfume Compounding SOP (Made-to-Order)';
    if (subHeading) subHeading.textContent = "Select the client's requested scent blend and package format to see exact syringe measurements, formulation proportions, and preparation steps.";
    if (fulfillBtn) fulfillBtn.textContent = '✓ Make for Client & Deduct Stock';

    const m = getSOPMeasurements(state.selectedRecipeId, state.selectedBottleSize);
    state.activeSOPMeasurements = m;

    document.getElementById('sopCardTitle').textContent = m.recipe.name;
    document.getElementById('sopCardCategory').textContent = `${m.recipe.category} • ${m.recipe.description}`;
    document.getElementById('sopPackageBadge').textContent = m.size === 6 ? '6ml Roller' : `${m.size}ml Spray`;
    document.getElementById('sopPriceBadge').textContent = formatTZS(m.sellingPrice);
    document.getElementById('sopSyringeSpec').textContent = m.syringeSpec;

    const restBadgeEl = document.getElementById('sopRestBadge');
    if (restBadgeEl) restBadgeEl.textContent = `⏳ Rest: ${m.restTime}`;

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
}

// ==========================================
// GIFTS & COMPLIMENTARY SAMPLING TAB
// ==========================================
async function renderGiftsTab() {
  const container = document.getElementById('fullGiftList');
  if (!container) return;

  const currentGiftPeriod = state.giftPeriod || 'all';
  const giftsSummary = await getGiftsSummary(currentGiftPeriod);
  const finSummary = await getFinancialSummary(currentGiftPeriod);

  const totalSales = finSummary.totalSales || 0;
  const totalCost = giftsSummary.totalProductionCost || 0;
  const totalRetail = giftsSummary.totalRetailValue || 0;
  const totalUnits = giftsSummary.totalUnits || 0;
  const costRatio = totalSales > 0 ? ((totalCost / totalSales) * 100) : 0;

  // 1. Strategic Advisory & Decision Box
  const strategyBox = document.getElementById('giftStrategyBox');
  const badgeEl = document.getElementById('giftStrategyBadge');
  const titleEl = document.getElementById('giftStrategyTitle');
  const textEl = document.getElementById('giftStrategyText');
  const actionEl = document.getElementById('giftStrategyAction');
  const pctTextEl = document.getElementById('giftCostPercentText');

  if (pctTextEl) pctTextEl.textContent = `${costRatio.toFixed(1)}%`;

  if (totalUnits === 0) {
    if (strategyBox) strategyBox.style.borderLeftColor = 'var(--text-muted)';
    if (badgeEl) {
      badgeEl.textContent = 'No Gifts Recorded';
      badgeEl.style.color = 'var(--text-muted)';
      badgeEl.style.background = 'rgba(255,255,255,0.06)';
      badgeEl.style.borderColor = 'rgba(255,255,255,0.1)';
    }
    if (titleEl) titleEl.textContent = 'Ready to Track Complimentary Samples & Gifts';
    if (textEl) textEl.textContent = 'When you give car fresheners or perfume samples with no pay, record them here to evaluate whether other sales compensate and whether to keep doing it or adjust.';
    if (actionEl) actionEl.innerHTML = '💡 <strong>Strategy:</strong> Tap <strong>"+ Give Gift"</strong> to record your first complimentary bottle or marketing sample.';
  } else if (totalSales === 0) {
    if (strategyBox) strategyBox.style.borderLeftColor = 'var(--amber)';
    if (badgeEl) {
      badgeEl.textContent = 'Initial Sampling Phase';
      badgeEl.style.color = 'var(--amber)';
      badgeEl.style.background = 'rgba(245, 158, 11, 0.15)';
      badgeEl.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    }
    if (titleEl) titleEl.textContent = 'Seed Samples Distributed (Awaiting Initial Sales)';
    if (textEl) textEl.textContent = `You have given ${totalUnits} complimentary units costing ${formatTZS(totalCost)}. No sales have occurred in this period yet to gauge compensation.`;
    if (actionEl) actionEl.innerHTML = '💡 <strong>Strategic Advice:</strong> Follow up with recipients within 48–72 hours to ask about scent longevity and convert them into paid bottle buyers.';
  } else if (costRatio <= 10) {
    if (strategyBox) strategyBox.style.borderLeftColor = 'var(--emerald)';
    if (badgeEl) {
      badgeEl.textContent = `🟢 Self-Compensating (${costRatio.toFixed(1)}%)`;
      badgeEl.style.color = 'var(--emerald)';
      badgeEl.style.background = 'rgba(16, 185, 129, 0.15)';
      badgeEl.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    }
    if (titleEl) titleEl.textContent = 'Sales Fully Absorb Gift Costs (Profitable & Sustainable)';
    if (textEl) textEl.innerHTML = `Your gift production costs (${formatTZS(totalCost)}) absorb only <strong style="color: var(--emerald);">${costRatio.toFixed(1)}%</strong> of gross sales revenue (${formatTZS(totalSales)}). This is safely within the luxury perfume customer acquisition benchmark (3% to 10%).`;
    if (actionEl) actionEl.innerHTML = '🟢 <strong>Keep Doing This:</strong> Your gifting is working profitably! Complimentary car fresheners and testers are driving word-of-mouth and customer retention without stressing your cashflow.';
  } else if (costRatio <= 20) {
    if (strategyBox) strategyBox.style.borderLeftColor = 'var(--amber)';
    if (badgeEl) {
      badgeEl.textContent = `🟡 Moderate Exposure (${costRatio.toFixed(1)}%)`;
      badgeEl.style.color = 'var(--amber)';
      badgeEl.style.background = 'rgba(245, 158, 11, 0.15)';
      badgeEl.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    }
    if (titleEl) titleEl.textContent = 'Gifts Absorbing Moderate Revenue — Monitor Conversion';
    if (textEl) textEl.innerHTML = `Gift production costs (${formatTZS(totalCost)}) represent <strong style="color: var(--amber);">${costRatio.toFixed(1)}%</strong> of gross revenue. While acceptable during an aggressive launch phase, keep a close watch on actual conversion.`;
    if (actionEl) actionEl.innerHTML = '🟡 <strong>Strategic Advice:</strong> Only give gifts to high-leverage prospects (e.g. busy boda riders who carry hundreds of passengers, or active content creators). Request their direct feedback.';
  } else {
    if (strategyBox) strategyBox.style.borderLeftColor = 'var(--rose)';
    if (badgeEl) {
      badgeEl.textContent = `🔴 High Exposure (${costRatio.toFixed(1)}%)`;
      badgeEl.style.color = 'var(--rose)';
      badgeEl.style.background = 'rgba(244, 63, 94, 0.15)';
      badgeEl.style.borderColor = 'rgba(244, 63, 94, 0.3)';
    }
    if (titleEl) titleEl.textContent = 'Gift Costs Exceed Safe Benchmark — Policy Adjustment Advised';
    if (textEl) textEl.innerHTML = `Gifts have consumed <strong style="color: var(--rose);">${costRatio.toFixed(1)}%</strong> of your gross revenue (${formatTZS(totalCost)} spent vs ${formatTZS(totalSales)} earned). Free handouts are eroding your operating margin.`;
    if (actionEl) actionEl.innerHTML = '🔴 <strong>Recommended Adjustment:</strong> (1) Switch free gifts to smaller formats (e.g. 8ml hanging diffuser or 6ml pocket roller instead of 30ml bottles); (2) Tie gifts to a minimum purchase of 35,000 TZS (e.g. "Free car diffuser on orders over 35k") rather than unconditional freebies.';
  }

  // 2. Update KPI Tiles
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('kpiGiftUnits', totalUnits);
  setText('kpiGiftCost', formatTZS(totalCost));
  setText('kpiGiftRetail', formatTZS(totalRetail));
  setText('kpiGiftRatio', totalSales > 0 ? `${costRatio.toFixed(1)}%` : (totalUnits > 0 ? 'Sampling' : '0.0%'));

  // 3. Filter Gifts List
  const searchTerm = (document.getElementById('giftSearchInput')?.value || '').toLowerCase();
  const purposeFilter = document.getElementById('giftPurposeFilter')?.value || 'all';

  const filtered = giftsSummary.items.filter(g => {
    if (purposeFilter !== 'all' && g.purpose !== purposeFilter) return false;
    if (searchTerm) {
      const matchRecipient = (g.recipientName || '').toLowerCase().includes(searchTerm);
      const matchContact = (g.recipientContact || '').toLowerCase().includes(searchTerm);
      const matchDesc = (g.description || '').toLowerCase().includes(searchTerm);
      const matchNotes = (g.notes || '').toLowerCase().includes(searchTerm);
      if (!matchRecipient && !matchContact && !matchDesc && !matchNotes) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px; text-align: center; color: var(--text-muted); background: var(--bg-surface); border-radius: 8px;">
        <div style="font-size: 1.6rem; margin-bottom: 6px;">🎁</div>
        <p style="font-size: 0.85rem; font-weight: 600;">No gift entries found for this filter.</p>
        <p style="font-size: 0.75rem;">Record a new complimentary sample using "+ Give Gift" above.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(g => {
    const qty = Number(g.quantity) || 1;
    const cost = (Number(g.productionCost) || 0) * qty;
    const retail = (Number(g.retailPrice) || 0) * qty;
    const hasDeductions = Array.isArray(g.deductions) && g.deductions.length > 0;

    return `
      <div class="tx-item" style="border-left: 3px solid #ec4899;">
        <div class="tx-info">
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span class="tx-desc" style="font-weight: 700;">${escapeHTML(g.recipientName)}</span>
            <span class="gift-purpose-badge">${escapeHTML(g.purpose || 'Gift')}</span>
            ${hasDeductions ? '<span class="gift-deducted-pill">Stock Deducted</span>' : ''}
          </div>
          <div class="tx-date" style="margin-top: 3px;">
            ${escapeHTML(g.date)} • <strong>${qty}x ${escapeHTML(g.description || g.productType)}</strong>
            ${g.recipientContact ? ` • 📞 ${escapeHTML(g.recipientContact)}` : ''}
          </div>
          ${g.notes ? `<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">💬 ${escapeHTML(g.notes)}</div>` : ''}
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--rose);">
            -${formatTZS(cost)} <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 400;">cost</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--emerald);">
            ${formatTZS(retail)} retail val
          </div>
          <button class="btn-delete-gift" data-gift-id="${g.id}" style="background: none; border: none; color: var(--text-muted); font-size: 0.72rem; cursor: pointer; padding: 2px;" title="Delete and restore deducted inventory">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach delete listeners
  document.querySelectorAll('.btn-delete-gift').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.giftId, 10);
      if (confirm('Delete this gift entry? Any deducted stock items will be automatically restored to your inventory.')) {
        await deleteGift(id);
        showToast('Gift deleted & stock restored!', 'info');
        await loadAllData();
      }
    };
  });
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
  document.getElementById('exportGiftsCSVBtn')?.addEventListener('click', exportGiftsToCSV);
  document.getElementById('exportAllGiftsCSV')?.addEventListener('click', exportGiftsToCSV);

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

  document.querySelectorAll('.gift-filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gift-filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.giftPeriod = btn.dataset.giftPeriod;
      renderGiftsTab();
    });
  });

  document.getElementById('giftSearchInput')?.addEventListener('input', renderGiftsTab);
  document.getElementById('giftPurposeFilter')?.addEventListener('change', renderGiftsTab);

  document.getElementById('txSearchInput')?.addEventListener('input', renderTransactionsTab);
  document.getElementById('txTypeFilter')?.addEventListener('change', renderTransactionsTab);
}

// Load data into memory & refresh
async function loadAllData() {
  await openDatabase();
  state.inventory = await getAllInventory();
  state.transactions = await getAllTransactions();
  state.gifts = await getAllGifts();
  state.financialSummary = await getFinancialSummary(state.currentPeriod);

  if (state.currentTab === 'tab-dashboard') renderDashboard();
  else if (state.currentTab === 'tab-transactions') renderTransactionsTab();
  else if (state.currentTab === 'tab-inventory') renderInventoryTab();
  else if (state.currentTab === 'tab-calculator') renderSOPLab();
  else if (state.currentTab === 'tab-gifts') renderGiftsTab();
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

  await openDatabase();
  await ensureCoreStock();

  await loadAllData();
  renderSOPLab();
  initCustomSelects();
  checkBackupReminder();
}

async function checkBackupReminder() {
  const banner = document.getElementById('backupReminderBanner');
  if (!banner) return;

  const lastBackupStr = await getSetting('lastBackupDate');
  let shouldShow = false;

  if (!lastBackupStr) {
    const txCount = (state.transactions || []).length;
    if (txCount > 3) shouldShow = true;
  } else {
    const lastDate = new Date(lastBackupStr);
    const diffDays = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays >= 7) shouldShow = true;
  }

  if (shouldShow && !sessionStorage.getItem('backupBannerDismissed')) {
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }

  document.getElementById('backupNowBannerBtn')?.addEventListener('click', async () => {
    await downloadFullBackup();
    banner.style.display = 'none';
    showToast('Backup downloaded successfully! 💾', 'success');
  });

  document.getElementById('dismissBackupBannerBtn')?.addEventListener('click', () => {
    banner.style.display = 'none';
    sessionStorage.setItem('backupBannerDismissed', 'true');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
