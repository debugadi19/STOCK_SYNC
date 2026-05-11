// backup.js
// ─────────────────────────────────────────────
// Handles exporting all user data to a JSON file
// and importing it back from a JSON file.
//
// Why JSON backup?
// localStorage data is tied to the browser.
// If the user clears browser data, everything is lost.
// This lets them save a copy on their computer and restore it.
// ─────────────────────────────────────────────

import { getInventory, getExpenses } from "./data.js";

const CATEGORIES = new Set(["Dairy", "Vegetables", "Grains", "Fruits", "Snacks", "Beverages", "Other"]);
const UNITS = new Set(["kg", "g", "l", "ml", "pack", "pcs"]);
const STATUSES = new Set(["fresh", "expiring", "low"]);

// ── EXPORT ────────────────────────────────────
// Must be async because getInventory/getExpenses
// now fetch from Firestore (they return Promises).
export async function exportBackup() {
  const user      = localStorage.getItem("user") || "guest";
  const inventory = await getInventory();
  const expenses  = await getExpenses();

  const backupData = {
    exportedAt: new Date().toISOString(),
    user,
    inventory,
    expenses,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `stocksync-backup-${user}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { ok: true, message: "Backup downloaded successfully!" };
}

// ── IMPORT ────────────────────────────────────
// importBackup just parses the file and returns the data.
// dashboard.html calls saveInventory/saveExpenses after.
export function importBackup(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== "application/json") {
      return reject("Please select a valid .json backup file.");
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data.inventory) || !Array.isArray(data.expenses)) {
          return reject("Invalid backup file. Missing inventory or expenses data.");
        }

        const inventory = data.inventory.map(normalizeInventoryItem);
        const expenses = data.expenses.map(normalizeExpense);

        resolve({
          ok: true,
          message: `Restored ${inventory.length} items and ${expenses.length} expenses.`,
          inventory,
          expenses,
        });
      } catch (e) {
        reject("Could not read the file. Make sure it's a valid Stock Sync backup.");
      }
    };
    reader.onerror = () => reject("File reading failed. Please try again.");
    reader.readAsText(file);
  });
}

function normalizeInventoryItem(item) {
  if (!item || typeof item !== "object") throw new Error("Invalid inventory item");

  const name = cleanText(item.name, 60);
  const qty = Number(item.qty);
  const cat = CATEGORIES.has(item.cat) ? item.cat : "Other";
  const unit = UNITS.has(item.unit) ? item.unit : "pcs";
  const status = STATUSES.has(item.status) ? item.status : "fresh";
  const addedAt = Number(item.addedAt) || Date.now();

  if (!name || name.length < 2) throw new Error("Invalid item name");
  if (!Number.isFinite(qty) || qty <= 0 || qty > 9999) throw new Error("Invalid item quantity");

  return {
    id: cleanId(item.id),
    name,
    qty,
    cat,
    unit,
    status,
    addedAt
  };
}

function normalizeExpense(item) {
  if (!item || typeof item !== "object") throw new Error("Invalid expense");

  const name = cleanText(item.name, 80);
  const amount = Number(item.amount);
  const member = cleanText(item.member || "Other", 40);
  const date = Number(item.date) || Date.now();

  if (!name || name.length < 2) throw new Error("Invalid expense description");
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) throw new Error("Invalid expense amount");

  return {
    id: cleanId(item.id),
    name,
    amount,
    member,
    date
  };
}

function cleanText(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function cleanId(value) {
  const id = cleanText(value, 80);
  return /^[a-zA-Z0-9_-]+$/.test(id)
    ? id
    : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}
