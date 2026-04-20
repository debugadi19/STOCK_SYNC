// validate.js
// ─────────────────────────────────────────────
// All input validation lives here.
// Each function returns { ok: true } on success
// or { ok: false, message: "reason" } on failure.
// This keeps validation separate from the UI logic.
// ─────────────────────────────────────────────

export function validateItem(name, qty, existingInventory) {
    // Name must not be empty
    if (!name || name.trim() === "") {
      return { ok: false, message: "Item name cannot be empty." };
    }
  
    // Name must be at least 2 characters
    if (name.trim().length < 2) {
      return { ok: false, message: "Item name must be at least 2 characters." };
    }
  
    // No special characters in name
    if (!/^[a-zA-Z0-9\s\-]+$/.test(name.trim())) {
      return { ok: false, message: "Item name can only contain letters, numbers, and hyphens." };
    }
  
    // Quantity must be a positive number
    const numQty = parseFloat(qty);
    if (isNaN(numQty) || numQty <= 0) {
      return { ok: false, message: "Quantity must be a positive number." };
    }
  
    // Quantity should not be unrealistically large
    if (numQty > 9999) {
      return { ok: false, message: "Quantity seems too large. Please double-check." };
    }
  
    // No duplicate item names (case-insensitive)
    const duplicate = existingInventory.some(
      (item) => item.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return { ok: false, message: `"${name.trim()}" is already in your inventory.` };
    }
  
    return { ok: true };
  }
  
  export function validateExpense(name, amount) {
    // Description must not be empty
    if (!name || name.trim() === "") {
      return { ok: false, message: "Please enter a description for the expense." };
    }
  
    // Description must be at least 2 characters
    if (name.trim().length < 2) {
      return { ok: false, message: "Description must be at least 2 characters." };
    }
  
    // Amount must be a number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { ok: false, message: "Amount must be a positive number." };
    }
  
    // Reasonable upper limit for a grocery expense
    if (numAmount > 100000) {
      return { ok: false, message: "Amount seems too large. Please double-check." };
    }
  
    return { ok: true };
  }
  
  export function validateEmail(email) {
    if (!email || email.trim() === "") {
      return { ok: false, message: "Email cannot be empty." };
    }
    // Basic email format check using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { ok: false, message: "Please enter a valid email address." };
    }
    return { ok: true };
  }
  
  export function validatePassword(password) {
    if (!password) {
      return { ok: false, message: "Password cannot be empty." };
    }
    if (password.length < 6) {
      return { ok: false, message: "Password must be at least 6 characters." };
    }
    return { ok: true };
  }