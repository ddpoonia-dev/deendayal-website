// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB9bNLLt9ydfoPQqYtxnq3HnQSUNEhojUE",
  authDomain: "ddtrading-journal.firebaseapp.com",
  projectId: "ddtrading-journal",
  storageBucket: "ddtrading-journal.firebasestorage.app",
  messagingSenderId: "281732868887",
  appId: "1:281732868887:web:f62d8cdc3137a13620a552"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global access
window.auth = auth;
window.db = db;
window.addDoc = addDoc;
window.collection = collection;
window.serverTimestamp = serverTimestamp;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;

console.log("Firebase Connected Successfully");
window.registerUser = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created successfully");
    closeLoginPopup();
  } catch (error) {
    alert(error.message);
  }
};

window.loginUser = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful");
    closeLoginPopup();
  } catch (error) {
    alert(error.message);
  }
};
onAuthStateChanged(auth, (user) => {

  const loginBtn = document.querySelector(".login-link");

  if (!loginBtn) return;

  if (user) {

    loginBtn.textContent = "Logout";

    loginBtn.onclick = async () => {
      await signOut(auth);
      alert("Logged Out");
    };

  } else {

    loginBtn.textContent = "Login";

    loginBtn.onclick = () => {
      openLoginPopup();
    };
  }
});