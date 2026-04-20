import { getInventory, saveInventory, getExpenses, saveExpenses, clearAll } from './data.js';

/* ─────────────────────────────────────────────
   INVENTORY
───────────────────────────────────────────── */
let inventory = getInventory();
let nextId = inventory.length ? Math.max(...inventory.map(i => i.id)) + 1 : 1;

window.addItem = function () {
  const name    = document.getElementById('item-name').value.trim();
  const qty     = parseFloat(document.getElementById('item-qty').value) || 1;
  const cat     = document.getElementById('item-cat').value;
  const unit    = document.getElementById('item-unit').value;
  const status  = document.getElementById('item-status').value;

  if (!name) return showToast("Please enter an item name", "error");

  // check duplicate
  if (inventory.some(i => i.name.toLowerCase() === name.toLowerCase())) {
    return showToast(`"${name}" is already in inventory`, "error");
  }

  inventory.push({ id: nextId++, name, qty, cat, unit, status, addedAt: Date.now() });
  saveInventory(inventory);
  renderInventory();
  renderAlerts();

  // clear inputs
  document.getElementById('item-name').value = '';
  document.getElementById('item-qty').value  = '1';

  showToast(`Added "${name}" to inventory ✓`);
};

window.removeItem = function (id) {
  const item = inventory.find(i => i.id === id);
  inventory = inventory.filter(i => i.id !== id);
  saveInventory(inventory);
  renderInventory();
  renderAlerts();
  showToast(`Removed "${item?.name || 'item'}"`, "warn");
};

window.updateStatus = function (id, newStatus) {
  inventory = inventory.map(i => i.id === id ? { ...i, status: newStatus } : i);
  saveInventory(inventory);
  renderInventory();
  renderAlerts();
};

function renderInventory() {
  const el = document.getElementById('inventory-body');
  if (!el) return;

  if (inventory.length === 0) {
    el.innerHTML = `<tr><td colspan="6">
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        No items yet — add your first grocery item above.
      </div>
    </td></tr>`;
    return;
  }

  const statusLabel = { fresh: 'Fresh', expiring: 'Expiring Soon', low: 'Low Stock' };
  const statusClass = { fresh: 'status-fresh', expiring: 'status-expiring', low: 'status-low' };
  const dotClass    = { fresh: 'dot-fresh', expiring: 'dot-expiring', low: 'dot-low' };

  el.innerHTML = inventory.map(i => `
    <tr>
      <td style="font-weight:500">${escHtml(i.name)}</td>
      <td>${i.qty} ${i.unit}</td>
      <td><span style="font-size:12px;color:var(--text-secondary)">${i.cat}</span></td>
      <td>${i.unit}</td>
      <td>
        <select class="status-select" onchange="updateStatus(${i.id}, this.value)"
          style="border:none;background:transparent;font-family:inherit;font-size:12px;font-weight:500;cursor:pointer;color:inherit;padding:2px 4px;outline:none;">
          <option value="fresh"    ${i.status === 'fresh'    ? 'selected' : ''}>🟢 Fresh</option>
          <option value="expiring" ${i.status === 'expiring' ? 'selected' : ''}>🟡 Expiring</option>
          <option value="low"      ${i.status === 'low'      ? 'selected' : ''}>🔴 Low Stock</option>
        </select>
      </td>
      <td>
        <button class="btn-danger" onclick="removeItem(${i.id})">Remove</button>
      </td>
    </tr>
  `).join('');
}

/* ─────────────────────────────────────────────
   EXPENSES
───────────────────────────────────────────── */
let expenses  = getExpenses();
let nextExpId = expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1;

const MEMBERS = ['Raj', 'Gaurav', 'Priya', 'Other'];

window.addExpense = function () {
  const name   = document.getElementById('exp-name').value.trim();
  const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
  const member = document.getElementById('exp-member-sel').value;

  if (!name)   return showToast("Enter a description", "error");
  if (!amount) return showToast("Enter a valid amount", "error");

  expenses.push({ id: nextExpId++, name, amount, member, date: Date.now() });
  saveExpenses(expenses);
  renderExpenses();

  document.getElementById('exp-name').value   = '';
  document.getElementById('exp-amount').value = '';

  showToast(`Logged ₹${amount} for "${name}" ✓`);
};

window.removeExpense = function (id) {
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses(expenses);
  renderExpenses();
  showToast("Expense removed", "warn");
};

function renderExpenses() {
  const el = document.getElementById('expense-list');
  if (!el) return;

  const total   = expenses.reduce((s, e) => s + e.amount, 0);
  const members = [...new Set(expenses.map(e => e.member))].length || 1;
  const perPerson = Math.round(total / members);

  const totalEl = document.getElementById('total-spent');
  const perEl   = document.getElementById('per-person');
  const weekEl  = document.getElementById('this-week');

  if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
  if (perEl)   perEl.textContent   = '₹' + perPerson.toLocaleString('en-IN');

  // this week
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekTotal = expenses.filter(e => e.date > weekAgo).reduce((s, e) => s + e.amount, 0);
  if (weekEl) weekEl.textContent = '₹' + weekTotal.toLocaleString('en-IN');

  if (expenses.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">💸</div>No expenses logged yet.</div>`;
    return;
  }

  // member breakdown
  const breakdown = {};
  MEMBERS.forEach(m => breakdown[m] = 0);
  expenses.forEach(e => {
    if (!breakdown[e.member]) breakdown[e.member] = 0;
    breakdown[e.member] += e.amount;
  });

  const breakdownEl = document.getElementById('member-breakdown');
  if (breakdownEl) {
    breakdownEl.innerHTML = MEMBERS
      .filter(m => breakdown[m] > 0)
      .map(m => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--green-light);color:var(--green-text);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;">${m.slice(0,1)}</div>
            ${m}
          </div>
          <span style="font-weight:600;color:var(--green)">₹${breakdown[m].toLocaleString('en-IN')}</span>
        </div>
      `).join('');
  }

  el.innerHTML = [...expenses].reverse().map(e => `
    <div class="expense-item">
      <div class="expense-left">
        <div class="expense-name">${escHtml(e.name)}</div>
        <div class="expense-meta">${e.member} · ${formatDate(e.date)}</div>
      </div>
      <div class="expense-right">
        <div class="expense-amount">₹${e.amount.toLocaleString('en-IN')}</div>
        <button class="btn-danger" onclick="removeExpense(${e.id})">×</button>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   ALERTS
───────────────────────────────────────────── */
function renderAlerts() {
  const el = document.getElementById('alert-list');
  if (!el) return;

  const expiring = inventory.filter(i => i.status === 'expiring');
  const low      = inventory.filter(i => i.status === 'low');
  const fresh    = inventory.filter(i => i.status === 'fresh');

  const alerts = [
    ...expiring.map(i => ({
      type: 'red',
      title: `⚠️ ${i.name} is expiring soon`,
      sub: `${i.qty} ${i.unit} in ${i.cat} — use or replace soon`
    })),
    ...low.map(i => ({
      type: 'amber',
      title: `📉 ${i.name} is running low`,
      sub: `Only ${i.qty} ${i.unit} remaining — add to shopping list`
    })),
    ...fresh.map(i => ({
      type: 'green',
      title: `✓ ${i.name} is fully stocked`,
      sub: `${i.qty} ${i.unit} · ${i.cat}`
    }))
  ];

  if (alerts.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div>No alerts — your inventory looks great!</div>`;
    return;
  }

  el.innerHTML = alerts.map(a => `
    <div class="alert-item alert-${a.type}">
      <div class="alert-dot alert-dot-${a.type}"></div>
      <div>
        <div class="alert-title">${a.title}</div>
        <div class="alert-sub">${a.sub}</div>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────────── */
window.showTab = function (tab, btn) {
  ['inventory', 'expenses', 'alerts'].forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (tab === 'alerts')   renderAlerts();
  if (tab === 'expenses') renderExpenses();
};

/* ─────────────────────────────────────────────
   SMOOTH SCROLL
───────────────────────────────────────────── */
window.scrollToSection = function (id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ─────────────────────────────────────────────
   CSV DOWNLOAD
───────────────────────────────────────────── */
window.downloadCSV = function () {
  if (inventory.length === 0) return showToast("No items to export", "warn");

  const headers = ['Name', 'Quantity', 'Unit', 'Category', 'Status'];
  const rows = inventory.map(i => [i.name, i.qty, i.unit, i.cat, i.status]);
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'stock-sync-inventory.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast("CSV downloaded ✓");
};

/* ─────────────────────────────────────────────
   CLEAR ALL
───────────────────────────────────────────── */
window.clearAllData = function () {
  if (!confirm("Reset all inventory and expense data? This cannot be undone.")) return;
  clearAll();
  inventory = [];
  expenses  = [];
  nextId    = 1;
  nextExpId = 1;
  renderInventory();
  renderExpenses();
  renderAlerts();
  showToast("All data cleared", "warn");
};

/* ─────────────────────────────────────────────
   TOAST NOTIFICATIONS
───────────────────────────────────────────── */
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:9999;
      display:flex; flex-direction:column; gap:8px;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const colors = {
    success: { bg: '#ecfdf5', border: '#86efac', text: '#065f46' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#7f1d1d' },
    warn:    { bg: '#fffbeb', border: '#fcd34d', text: '#78350f' }
  };
  const c = colors[type] || colors.success;

  toast.style.cssText = `
    background:${c.bg}; border:1px solid ${c.border}; color:${c.text};
    padding:10px 16px; border-radius:10px; font-size:13.5px; font-weight:500;
    font-family:'DM Sans',sans-serif; box-shadow:0 4px 16px rgba(0,0,0,0.08);
    animation:fadeInUp 0.2s ease both; max-width:280px; line-height:1.4;
  `;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ─────────────────────────────────────────────
   INIT — check if dashboard sent us to a tab
───────────────────────────────────────────── */
const targetTab = sessionStorage.getItem('openTab');
if (targetTab) {
  sessionStorage.removeItem('openTab');
  const btn = document.querySelector(`.tab-btn[onclick*="${targetTab}"]`);
  showTab(targetTab, btn);
} else {
  renderInventory();
  renderExpenses();
  renderAlerts();
}