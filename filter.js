// filter.js
// ─────────────────────────────────────────────
// All data querying, sorting, and filtering lives here.
// These are pure functions — they take an array and
// return a new filtered/sorted array. They never
// modify the original data.
// ─────────────────────────────────────────────

// ── INVENTORY FILTERS ─────────────────────────

// Returns items that are expiring soon
export function getExpiringSoon(inventory) {
    return inventory.filter((item) => item.status === "expiring");
  }
  
  // Returns items that are low on stock
  export function getLowStock(inventory) {
    return inventory.filter((item) => item.status === "low");
  }
  
  // Returns items that are fully stocked / fresh
  export function getFreshItems(inventory) {
    return inventory.filter((item) => item.status === "fresh");
  }
  
  // Returns items belonging to a specific category e.g. "Dairy"
  export function getByCategory(inventory, category) {
    return inventory.filter(
      (item) => item.cat.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Search items by name (partial match, case-insensitive)
  export function searchItems(inventory, query) {
    if (!query || query.trim() === "") return inventory;
    return inventory.filter((item) =>
      item.name.toLowerCase().includes(query.trim().toLowerCase())
    );
  }
  
  // Sort inventory by name A→Z
  export function sortByName(inventory) {
    return [...inventory].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // Sort inventory by quantity low→high
  export function sortByQty(inventory) {
    return [...inventory].sort((a, b) => a.qty - b.qty);
  }
  
  // Sort inventory by date added, newest first
  export function sortByDateAdded(inventory) {
    return [...inventory].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }
  
  // Returns a summary count object
  // e.g. { total: 10, fresh: 6, expiring: 2, low: 2 }
  export function getInventorySummary(inventory) {
    return {
      total:    inventory.length,
      fresh:    inventory.filter((i) => i.status === "fresh").length,
      expiring: inventory.filter((i) => i.status === "expiring").length,
      low:      inventory.filter((i) => i.status === "low").length,
    };
  }
  
  // Returns all unique categories present in the inventory
  export function getCategories(inventory) {
    const cats = inventory.map((item) => item.cat);
    return [...new Set(cats)]; // Set removes duplicates
  }
  
  // ── EXPENSE FILTERS ───────────────────────────
  
  // Returns expenses logged by a specific member
  export function getExpensesByMember(expenses, member) {
    return expenses.filter((e) => e.member === member);
  }
  
  // Returns expenses from the last N days
  export function getRecentExpenses(expenses, days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return expenses.filter((e) => e.date > cutoff);
  }
  
  // Returns the total amount spent across all expenses
  export function getTotalSpent(expenses) {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }
  
  // Returns a breakdown object: { Raj: 400, Priya: 200, ... }
  export function getMemberBreakdown(expenses) {
    const breakdown = {};
    expenses.forEach((e) => {
      breakdown[e.member] = (breakdown[e.member] || 0) + e.amount;
    });
    return breakdown;
  }
  
  // Sort expenses by amount high→low
  export function sortExpensesByAmount(expenses) {
    return [...expenses].sort((a, b) => b.amount - a.amount);
  }
  
  // Sort expenses by date newest first
  export function sortExpensesByDate(expenses) {
    return [...expenses].sort((a, b) => b.date - a.date);
  }