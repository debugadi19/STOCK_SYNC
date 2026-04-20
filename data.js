// data.js
// ─────────────────────────────────────────────
// All localStorage read/write operations live here.
// Keeping this separate means if we ever switch storage
// (e.g. to a file or database), we only change this file.
// ─────────────────────────────────────────────

// Builds a user-specific key so two users don't share data
function getKey(key) {
    const user = localStorage.getItem("user") || "guest";
    return `${key}_${user}`;
  }
  
  // ── INVENTORY ─────────────────────────────────
  
  export function getInventory() {
    return JSON.parse(localStorage.getItem(getKey("inventory"))) || [];
  }
  
  export function saveInventory(data) {
    localStorage.setItem(getKey("inventory"), JSON.stringify(data));
  }
  
  // ── EXPENSES ──────────────────────────────────
  
  export function getExpenses() {
    return JSON.parse(localStorage.getItem(getKey("expenses"))) || [];
  }
  
  export function saveExpenses(data) {
    localStorage.setItem(getKey("expenses"), JSON.stringify(data));
  }
  
  // ── CLEAR ALL ─────────────────────────────────
  
  export function clearAll() {
    const user = localStorage.getItem("user") || "guest";
    localStorage.removeItem(`inventory_${user}`);
    localStorage.removeItem(`expenses_${user}`);
  }
  
  // ── STORAGE SIZE HELPER ───────────────────────
  // Returns how many KB of localStorage this user is using.
  // Useful to show the user they haven't exceeded browser limits.
  export function getStorageUsedKB() {
    const user = localStorage.getItem("user") || "guest";
    const inv  = localStorage.getItem(`inventory_${user}`) || "";
    const exp  = localStorage.getItem(`expenses_${user}`)  || "";
    const bytes = (inv.length + exp.length) * 2; // JS strings are UTF-16 (2 bytes per char)
    return (bytes / 1024).toFixed(2);
  }