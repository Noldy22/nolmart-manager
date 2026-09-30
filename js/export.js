// js/export.js - Local Data Export, CSV Generation & Private JSON Backups
import { getAllTransactions, getAllInventory, exportAllDataJSON, importAllDataJSON } from './db.js';

// Trigger download in browser
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Download Full JSON Backup
export async function downloadFullBackup() {
  const jsonStr = await exportAllDataJSON();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `NolMart_Backup_${dateStr}.json`;
  downloadFile(jsonStr, filename, 'application/json');
}

// 2. Restore from JSON File
export function restoreFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        await importAllDataJSON(content);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
}

// 3. Export Transactions to CSV (Excel-Ready)
export async function exportTransactionsToCSV() {
  const txs = await getAllTransactions();
  if (txs.length === 0) {
    alert('No transactions recorded yet to export.');
    return;
  }

  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Quantity', 'Amount (TZS)', 'Payment Method', 'Customer Name', 'Customer Phone', 'Notes'];
  
  const rows = txs.map(t => [
    t.id,
    t.date,
    t.type.toUpperCase(),
    t.category || '',
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.quantity || 1,
    t.amount || 0,
    (t.paymentMethod || 'cash').toUpperCase(),
    `"${(t.customerName || '').replace(/"/g, '""')}"`,
    `"${(t.customerPhone || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `NolMart_Transactions_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

// 4. Export Inventory to CSV (Excel-Ready)
export async function exportInventoryToCSV() {
  const inv = await getAllInventory();
  if (inv.length === 0) {
    alert('No inventory items to export.');
    return;
  }

  const headers = ['ID', 'Item Name', 'Category', 'Sub-Category', 'In Stock', 'Unit', 'Unit Cost (TZS)', 'Selling Price (TZS)', 'Total Stock Value (TZS)', 'Low Stock Alert'];
  
  const rows = inv.map(i => {
    const totalVal = (i.quantity || 0) * (i.unitCost || 0);
    const isLow = (i.quantity || 0) <= (i.minThreshold || 0) ? 'YES' : 'NO';
    return [
      i.id,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      i.category,
      i.subCategory || '',
      i.quantity || 0,
      i.unit || '',
      i.unitCost || 0,
      i.sellingPrice || 0,
      totalVal,
      isLow
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `NolMart_Inventory_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}
