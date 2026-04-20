import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4q6xdvReoswKx5c6dqQbFYgm2NUoceks",
  authDomain: "stock-sync-23cc9.firebaseapp.com",
  projectId: "stock-sync-23cc9",
  storageBucket: "stock-sync-23cc9.firebasestorage.app",
  messagingSenderId: "952662923282",
  appId: "1:952662923282:web:13d91673ecb8ca0cf520cb"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function signup(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  localStorage.setItem("user", res.user.email);
  window.location.href = "dashboard.html";
}

export async function login(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  localStorage.setItem("user", res.user.email);
  window.location.href = "dashboard.html";
}

export async function logout() {
  await signOut(auth).catch(() => {});
  localStorage.removeItem("user");
  window.location.href = "login.html";
}