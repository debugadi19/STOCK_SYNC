// data.js — fixed for real-time Firestore sync
// ─────────────────────────────────────────────
// KEY CHANGE: Added subscribeInventory / subscribeExpenses
// using onSnapshot so the dashboard auto-updates live
// instead of needing a page refresh.
// ─────────────────────────────────────────────

import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  onSnapshot,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyA4q6xdvReoswKx5c6dqQbFYgm2NUoceks",
  authDomain:        "stock-sync-23cc9.firebaseapp.com",
  projectId:         "stock-sync-23cc9",
  storageBucket:     "stock-sync-23cc9.firebasestorage.app",
  messagingSenderId: "952662923282",
  appId:             "1:952662923282:web:13d91673ecb8ca0cf520cb"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);

function getUID() {
  const uid = localStorage.getItem("uid");
  if (!uid) throw new Error("No user logged in.");
  return uid;
}

function getUserCol(name) {
  return collection(db, "users", getUID(), name);
}

// ── One-time reads (kept for backup/import use) ──
export async function getInventory() {
  const snap = await getDocs(getUserCol("inventory"));
  return snap.docs.map(d => d.data());
}

export async function getExpenses() {
  const snap = await getDocs(getUserCol("expenses"));
  return snap.docs.map(d => d.data());
}

// ── Real-time listeners ──────────────────────
// These fire immediately with current data, then
// fire again whenever ANY device changes the data.
// Returns an unsubscribe function (call it on logout).

export function subscribeInventory(callback) {
  return onSnapshot(
    getUserCol("inventory"),
    snap => callback(snap.docs.map(d => d.data())),
    err  => console.error("inventory snapshot error:", err)
  );
}

export function subscribeExpenses(callback) {
  return onSnapshot(
    getUserCol("expenses"),
    snap => callback(snap.docs.map(d => d.data())),
    err  => console.error("expenses snapshot error:", err)
  );
}

// ── Saves ─────────────────────────────────────
// Full replace: delete all existing docs then write
// the new array. One batch = one network round-trip.

export async function saveInventory(items) {
  const colRef = getUserCol("inventory");
  const existing = await getDocs(colRef);
  const batch = writeBatch(db);
  existing.docs.forEach(d => batch.delete(d.ref));
  items.forEach(item => batch.set(doc(colRef, String(item.id)), item));
  await batch.commit();
}

export async function saveExpenses(items) {
  const colRef = getUserCol("expenses");
  const existing = await getDocs(colRef);
  const batch = writeBatch(db);
  existing.docs.forEach(d => batch.delete(d.ref));
  items.forEach(item => batch.set(doc(colRef, String(item.id)), item));
  await batch.commit();
}

// ── Clear all ─────────────────────────────────
export async function clearAll() {
  const [invSnap, expSnap] = await Promise.all([
    getDocs(getUserCol("inventory")),
    getDocs(getUserCol("expenses"))
  ]);
  const batch = writeBatch(db);
  invSnap.docs.forEach(d => batch.delete(d.ref));
  expSnap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export function getStorageUsedKB() {
  return "synced via Firestore ☁️";
}