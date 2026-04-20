function getKey(key) {
    const user = localStorage.getItem("user") || "guest";
    return `${key}_${user}`;
  }
  
  export function getInventory() {
    return JSON.parse(localStorage.getItem(getKey("inventory"))) || [];
  }
  
  export function saveInventory(data) {
    localStorage.setItem(getKey("inventory"), JSON.stringify(data));
  }
  
  export function getExpenses() {
    return JSON.parse(localStorage.getItem(getKey("expenses"))) || [];
  }
  
  export function saveExpenses(data) {
    localStorage.setItem(getKey("expenses"), JSON.stringify(data));
  }
  
  export function clearAll() {
    const user = localStorage.getItem("user") || "guest";
    localStorage.removeItem(`inventory_${user}`);
    localStorage.removeItem(`expenses_${user}`);
  }