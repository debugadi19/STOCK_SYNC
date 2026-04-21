// data.js
// ─────────────────────────────────────────────
// All database read/write operations live here.
//
// BEFORE: we used localStorage (browser only, one device)
// NOW:    we use Firebase Firestore (cloud, any device)
//
// Firestore structure for this app:
//
//   users/                        ← top-level collection
//     {uid}/                      ← one document per user
//       inventory/                ← sub-collection
//         {itemId}/               ← one document per item
//       expenses/                 ← sub-collection
//         {expenseId}/            ← one document per expense
//
// All function names stay the SAME as before so the rest
// of the code doesn't need big changes — only these
// functions are now async (they return Promises).
// ─────────────────────────────────────────────

import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Firebase config (same project as auth.js) ─
const firebaseConfig = {
  apiKey:            "AIzaSyA4q6xdvReoswKx5c6dqQbFYgm2NUoceks",
  authDomain:        "stock-sync-23cc9.firebaseapp.com",
  projectId:         "stock-sync-23cc9",
  storageBucket:     "stock-sync-23cc9.firebasestorage.app",
  messagingSenderId: "952662923282",
  appId:             "1:952662923282:web:13d91673ecb8ca0cf520cb"
};

// If Firebase app is already initialised by auth.js, reuse it.
// Otherwise initialise it fresh. This prevents a
// "Firebase App named '[DEFAULT]' already exists" error.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// db is our Firestore database instance
const db = getFirestore(app);

// ── Helper: get current user's UID ────────────
// UID is the unique ID Firebase assigns every user at signup.
// We store it in localStorage just as a quick lookup —
// the real auth session is still managed by Firebase Auth.
function getUID() {
  const uid = localStorage.getItem("uid");
  if (!uid) throw new Error("No user logged in.");
  return uid;
}

// ── Helper: get a reference to a sub-collection ──
// e.g. getUserCol("inventory") → users/{uid}/inventory
function getUserCol(name) {
  return collection(db, "users", getUID(), name);
}

// ─────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────

// Fetch all inventory items for the logged-in user.
// getDocs() reads all documents in the collection once.
export async function getInventory() {
  const snapshot = await getDocs(getUserCol("inventory"));
  // .docs is an array of DocumentSnapshots
  // .data() on each gives us the plain JS object we stored
  return snapshot.docs.map(d => d.data());
}

// Save the full inventory array to Firestore.
// Strategy: delete everything first, then re-write.
// We use a "batch write" so all deletes + writes happen
// in one network round-trip instead of one request per item.
export async function saveInventory(items) {
  const colRef  = getUserCol("inventory");
  const batch   = writeBatch(db);

  // Delete all existing documents in this collection
  const existing = await getDocs(colRef);
  existing.docs.forEach(d => batch.delete(d.ref));

  // Write each item as a document named by its id
  items.forEach(item => {
    const ref = doc(colRef, String(item.id));
    batch.set(ref, item);
  });

  await batch.commit(); // sends everything to Firestore at once
}

// ─────────────────────────────────────────────
// EXPENSES
// ─────────────────────────────────────────────

export async function getExpenses() {
  const snapshot = await getDocs(getUserCol("expenses"));
  return snapshot.docs.map(d => d.data());
}

export async function saveExpenses(items) {
  const colRef  = getUserCol("expenses");
  const batch   = writeBatch(db);

  const existing = await getDocs(colRef);
  existing.docs.forEach(d => batch.delete(d.ref));

  items.forEach(item => {
    const ref = doc(colRef, String(item.id));
    batch.set(ref, item);
  });

  await batch.commit();
}

// ─────────────────────────────────────────────
// CLEAR ALL
// ─────────────────────────────────────────────

// Deletes all inventory and expense documents for this user.
export async function clearAll() {
  const batch   = writeBatch(db);
  const invDocs = await getDocs(getUserCol("inventory"));
  const expDocs = await getDocs(getUserCol("expenses"));

  invDocs.docs.forEach(d => batch.delete(d.ref));
  expDocs.docs.forEach(d => batch.delete(d.ref));

  await batch.commit();
}

// ─────────────────────────────────────────────
// STORAGE INFO
// ─────────────────────────────────────────────
// With Firestore we don't measure KB like localStorage,
// so we return a label for the UI instead.
export function getStorageUsedKB() {
  return "synced via Firestore ☁️";
}