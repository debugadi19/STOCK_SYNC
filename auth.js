// auth.js
// ─────────────────────────────────────────────
// Handles login, signup, and logout using Firebase Auth.
//
// KEY CHANGE from the old version:
// We now store BOTH the user's email AND their uid
// in localStorage.
//
// Why uid?
// Firestore identifies each user's data by their uid
// (a unique ID like "abc123xyz"). data.js reads this
// uid to know which user's documents to read/write.
// ─────────────────────────────────────────────

import { initializeApp }   from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyA4q6xdvReoswKx5c6dqQbFYgm2NUoceks",
  authDomain:        "stock-sync-23cc9.firebaseapp.com",
  projectId:         "stock-sync-23cc9",
  storageBucket:     "stock-sync-23cc9.firebasestorage.app",
  messagingSenderId: "952662923282",
  appId:             "1:952662923282:web:13d91673ecb8ca0cf520cb"
};

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// ── Signup ─────────────────────────────────────
export async function signup(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  // Store both email (for display) and uid (for Firestore)
  localStorage.setItem("user", res.user.email);
  localStorage.setItem("uid",  res.user.uid);   // ← NEW

  window.location.href = "dashboard.html";
}

// ── Login ──────────────────────────────────────
export async function login(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);

  localStorage.setItem("user", res.user.email);
  localStorage.setItem("uid",  res.user.uid);   // ← NEW

  window.location.href = "dashboard.html";
}

// ── Logout ─────────────────────────────────────
export async function logout() {
  await signOut(auth).catch(() => {});

  // Clear both items we stored
  localStorage.removeItem("user");
  localStorage.removeItem("uid");               // ← NEW

  window.location.href = "login.html";
}