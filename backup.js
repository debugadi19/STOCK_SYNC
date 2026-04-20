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

import { getInventory, getExpenses, saveInventory, saveExpenses } from "./data.js";

// ── EXPORT ────────────────────────────────────
// Grabs all inventory + expense data and downloads
// it as a .json file to the user's computer.
export function exportBackup() {
  const user = localStorage.getItem("user") || "guest";

  const backupData = {
    exportedAt: new Date().toISOString(), // timestamp so user knows when it was made
    user: user,
    inventory: getInventory(),
    expenses: getExpenses(),
  };

  // Convert the object to a nicely formatted JSON string
  const jsonString = JSON.stringify(backupData, null, 2);

  // Create a downloadable blob (think of it as an in-memory file)
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary <a> tag and click it to trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = `stocksync-backup-${user}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Free up the memory used by the blob URL
  URL.revokeObjectURL(url);

  return { ok: true, message: "Backup downloaded successfully!" };
}

// ── IMPORT ────────────────────────────────────
// Reads a .json backup file the user selects,
// validates its structure, then restores the data
// into localStorage.
//
// Returns a Promise because FileReader is async.
export function importBackup(file) {
  return new Promise((resolve, reject) => {
    // Only accept .json files
    if (!file || file.type !== "application/json") {
      return reject("Please select a valid .json backup file.");
    }

    const reader = new FileReader();

    // This runs when the file has been read
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);

        // Basic structure check — make sure the file has what we expect
        if (!Array.isArray(data.inventory) || !Array.isArray(data.expenses)) {
          return reject("Invalid backup file. Missing inventory or expenses data.");
        }

        // Restore data into localStorage
        saveInventory(data.inventory);
        saveExpenses(data.expenses);

        resolve({
          ok: true,
          message: `Restored ${data.inventory.length} items and ${data.expenses.length} expenses.`,
          inventory: data.inventory,
          expenses: data.expenses,
        });
      } catch (e) {
        reject("Could not read the file. Make sure it's a valid Stock Sync backup.");
      }
    };

    reader.onerror = function () {
      reject("File reading failed. Please try again.");
    };

    // Start reading the file as text
    reader.readAsText(file);
  });
}