// auth.js
// ─────────────────────────────────────────────
// Handles login, signup, and logout using Firebase Auth.
//
// KEY CHANGE from the old version:
// We store the user's email in localStorage for display.
//
// Firestore data access waits for Firebase Auth in data.js,
// so the uid comes from the active Firebase session instead
// of browser storage.
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

export async function signup(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  // Only store email for display — uid is handled by waitForUser() in data.js
  localStorage.setItem("user", res.user.email);
  window.location.href = "dashboard.html";
}

export async function login(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  // Only store email for display — uid is handled by waitForUser() in data.js
  localStorage.setItem("user", res.user.email);
  window.location.href = "dashboard.html";
}

export async function logout() {
  await signOut(auth).catch(() => {});
  localStorage.removeItem("user");
  localStorage.removeItem("uid");
  window.location.href = "login.html";
}
