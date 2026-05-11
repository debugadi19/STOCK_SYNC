// data.js
// ─────────────────────────────────────────────
// THE CORE SYNC FIX:
//
// OLD (broken): uid was read from localStorage.
//   Problem — localStorage is per-device. On mobile,
//   subscribeInventory() ran before Firebase Auth had
//   restored the session, so getUID() returned null,
//   the snapshot never started, and nothing loaded.
//
// NEW (fixed): uid comes from onAuthStateChanged.
//   Firebase Auth fires this callback as soon as it
//   confirms the user's session on ANY device — laptop,
//   mobile, tablet. Only then do we start the Firestore
//   listeners. This guarantees the uid is always valid
//   before any read/write happens.
// ─────────────────────────────────────────────

import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged }     from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7ZJDsSFE4Phgi1M8egSEk_fQQxLXUoVQ",
  authDomain: "stocksync-a83f5.firebaseapp.com",
  projectId: "stocksync-a83f5",
  storageBucket: "stocksync-a83f5.firebasestorage.app",
  messagingSenderId: "294692462434",
  appId: "1:294692462434:web:49e357d2220bd45b65963b",
  measurementId: "G-3NW8ZVECPF"
};

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Wait for Firebase Auth to confirm the session ──
// Returns a Promise that resolves with the Firebase User object.
// Works on every device — no localStorage needed.
function waitForUser() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, user => {
      unsub(); // stop listening after first response
      if (user) {
        // Keep localStorage in sync for display purposes only
        localStorage.setItem("user", user.email);
        localStorage.setItem("uid",  user.uid);
        resolve(user);
      } else {
        // No session — redirect to login
        window.location.href = "login.html";
        reject(new Error("Not authenticated"));
      }
    });
  });
}

function getUserCol(uid, name) {
  return collection(db, "users", uid, name);
}

// ─────────────────────────────────────────────
// REAL-TIME LISTENERS
// Call subscribeInventory / subscribeExpenses once on
// page load. The callback fires immediately with current
// data, then fires again on every change from any device.
// ─────────────────────────────────────────────

export async function subscribeInventory(callback) {
  const user = await waitForUser();
  return onSnapshot(
    getUserCol(user.uid, "inventory"),
    snap => callback(snap.docs.map(d => ({ ...d.data(), id: d.id }))),
    err  => console.error("inventory snapshot error:", err)
  );
}

export async function subscribeExpenses(callback) {
  const user = await waitForUser();
  return onSnapshot(
    getUserCol(user.uid, "expenses"),
    snap => callback(snap.docs.map(d => ({ ...d.data(), id: d.id }))),
    err  => console.error("expenses snapshot error:", err)
  );
}

// ─────────────────────────────────────────────
// SAVES
// Single-record helpers are used for normal dashboard actions.
// Full replace is kept for backup import only.
// ─────────────────────────────────────────────

export async function saveInventoryItem(item) {
  const user = await waitForUser();
  await setDoc(doc(getUserCol(user.uid, "inventory"), String(item.id)), item);
}

export async function deleteInventoryItem(id) {
  const user = await waitForUser();
  await deleteDoc(doc(getUserCol(user.uid, "inventory"), String(id)));
}

export async function saveExpenseItem(item) {
  const user = await waitForUser();
  await setDoc(doc(getUserCol(user.uid, "expenses"), String(item.id)), item);
}

export async function deleteExpenseItem(id) {
  const user = await waitForUser();
  await deleteDoc(doc(getUserCol(user.uid, "expenses"), String(id)));
}

export async function saveInventory(items) {
  const user   = await waitForUser();
  const colRef = getUserCol(user.uid, "inventory");
  const existing = await getDocs(colRef);
  await replaceCollection(colRef, existing.docs, items);
}

export async function saveExpenses(items) {
  const user   = await waitForUser();
  const colRef = getUserCol(user.uid, "expenses");
  const existing = await getDocs(colRef);
  await replaceCollection(colRef, existing.docs, items);
}

// ─────────────────────────────────────────────
// CLEAR ALL
// ─────────────────────────────────────────────

export async function clearAll() {
  const user = await waitForUser();
  const [invSnap, expSnap] = await Promise.all([
    getDocs(getUserCol(user.uid, "inventory")),
    getDocs(getUserCol(user.uid, "expenses"))
  ]);
  await commitOps([
    ...invSnap.docs.map(d => ({ type: "delete", ref: d.ref })),
    ...expSnap.docs.map(d => ({ type: "delete", ref: d.ref }))
  ]);
}

async function replaceCollection(colRef, existingDocs, items) {
  const ops = [
    ...existingDocs.map(d => ({ type: "delete", ref: d.ref })),
    ...items.map(item => ({ type: "set", ref: doc(colRef, String(item.id)), data: item }))
  ];

  await commitOps(ops);
}

async function commitOps(ops) {
  for (let i = 0; i < ops.length; i += 450) {
    const batch = writeBatch(db);
    ops.slice(i, i + 450).forEach(op => {
      if (op.type === "delete") batch.delete(op.ref);
      else batch.set(op.ref, op.data);
    });
    await batch.commit();
  }
}

// ─────────────────────────────────────────────
// KEPT for backup.js compatibility
// ─────────────────────────────────────────────

export async function getInventory() {
  const user = await waitForUser();
  const snap = await getDocs(getUserCol(user.uid, "inventory"));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

export async function getExpenses() {
  const user = await waitForUser();
  const snap = await getDocs(getUserCol(user.uid, "expenses"));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

export function getStorageUsedKB() {
  return "synced via Firestore ☁️";
}
