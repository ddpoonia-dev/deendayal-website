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
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
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
window.getDocs = getDocs;
window.query = query;
window.orderBy = orderBy;
window.collection = collection;
window.serverTimestamp = serverTimestamp;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;
window.deleteDoc = deleteDoc;
window.doc = doc;
window.updateDoc = updateDoc;

console.log("Firebase Connected Successfully");
async function loadTradesFromFirebase() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const tradesRef = collection(db, "users", user.uid, "trades");
        const q = query(tradesRef, orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);

        trades = [];

        snapshot.forEach((doc) => {
            trades.push({
                 id: doc.id,
                ...doc.data()
            });
        });

            updateDashboard();
    renderTradeHistory();
    updateBestTradeShowcase();
    updateTradeReplay(trades[0]);
    updateEquityCurve();
    updateCalendarHeatmap();
    updateMonthlyDashboard();

console.log("Trades loaded:", trades.length);

    } catch (error) {
        console.error("Load Error:", error);
    }
}
window.loadTradesFromFirebase = loadTradesFromFirebase;
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

await loadTradesFromFirebase();

alert("Login successful");
closeLoginPopup();
  } catch (error) {
    alert(error.message);
  }
};
onAuthStateChanged(auth, async (user) => {

  const loginBtn = document.querySelector(".login-link");

  if (!loginBtn) return;

  if (user) {
    await loadTradesFromFirebase();
    loginBtn.textContent = "Logout";

    loginBtn.onclick = async () => {
      await signOut(auth);
      alert("Logged Out");
    };

  } else {
trades = [];
updateDashboard();
renderTradeHistory();
updateBestTradeShowcase();
updateTradeReplay(null);
updateEquityCurve();
    updateCalendarHeatmap();
    loginBtn.textContent = "Login";

    loginBtn.onclick = () => {
      openLoginPopup();
    };
  }
});

