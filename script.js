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
    updateAdvancedAnalytics();
    updateBestTradeShowcase();
    updateTradeReplay(trades[0]);
    updateEquityCurve();
    updateCalendarHeatmap();
    updateDailyPnlChart();
    updatePeriodSummary();
    updatePsychologyVerdict();
    updateMonthlyDashboard();

console.log("Trades loaded:", trades.length);

    } catch (error) {
        console.error("Load Error:", error);
    }
}
window.loadTradesFromFirebase = loadTradesFromFirebase;

function setLoginStatus(message, type = "") {
  const status = document.getElementById("loginStatus");
  if (!status) return;

  status.textContent = message || "";
  status.className = `login-status ${type}`.trim();
}

function setAuthLoading(isLoading, label = "Please wait...") {
  const loginBtn = document.getElementById("loginSubmitBtn");
  const registerBtn = document.getElementById("registerSubmitBtn");

  [loginBtn, registerBtn].forEach((button) => {
    if (!button) return;
    button.disabled = isLoading;
  });

  if (loginBtn) {
    loginBtn.textContent = isLoading ? label : "Login";
  }
}

function getLoginCredentials() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    setLoginStatus("Email and password dono fill karo.", "error");
    return null;
  }

  return { email, password };
}

function toggleLoginPassword() {
  const input = document.getElementById("loginPassword");
  const btn = document.querySelector(".password-row button");
  if (!input) return;

  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  if (btn) btn.textContent = showing ? "Show" : "Hide";
}

window.registerUser = async function () {
  const credentials = getLoginCredentials();
  if (!credentials) return;

  try {
    setAuthLoading(true, "Creating...");
    setLoginStatus("Creating your journal account...", "info");
    await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    const shouldOpenTradeModal = pendingTradeModalAfterLogin;
    pendingTradeModalAfterLogin = false;
    setLoginStatus("Account created. Your journal is ready.", "success");
    closeLoginPopup();
    if (shouldOpenTradeModal) {
      openTradeModal();
    }
  } catch (error) {
    setLoginStatus(error.message, "error");
  } finally {
    setAuthLoading(false);
  }
};

window.loginUser = async function () {
  const credentials = getLoginCredentials();
  if (!credentials) return;

  try {
    setAuthLoading(true, "Logging in...");
    setLoginStatus("Checking account and loading trades...", "info");
    await signInWithEmailAndPassword(auth, credentials.email, credentials.password);

await loadTradesFromFirebase();

const shouldOpenTradeModal = pendingTradeModalAfterLogin;
pendingTradeModalAfterLogin = false;
setLoginStatus("Login successful.", "success");
closeLoginPopup();
if (shouldOpenTradeModal) {
  openTradeModal();
}
  } catch (error) {
    setLoginStatus(error.message, "error");
  } finally {
    setAuthLoading(false);
  }
};
onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.querySelector(".login-link");
  const accountBadge = document.getElementById("accountBadge");

  if (!loginBtn) return;

  if (user) {
    loginBtn.textContent = "Logout";
    loginBtn.title = user.email || "Logged in";
    if (accountBadge) {
      accountBadge.textContent = user.email || "Logged in";
      accountBadge.classList.add("active");
    }

    loginBtn.onclick = async () => {
      loginBtn.textContent = "Logging out...";
      pendingTradeModalAfterLogin = false;
      await signOut(auth);

      trades = [];
      updateDashboard();
      renderTradeHistory();
      updateBestTradeShowcase();
      updateTradeReplay(null);
      updateEquityCurve();
      updateCalendarHeatmap();
      updateDailyPnlChart();
      updatePeriodSummary();
      updatePsychologyVerdict();

      loginBtn.textContent = "Login";
      loginBtn.title = "";
      loginBtn.onclick = () => openLoginPopup();
      if (accountBadge) {
        accountBadge.textContent = "Guest";
        accountBadge.classList.remove("active");
      }
      setLoginStatus("Logged out successfully.", "success");
    };

    await loadTradesFromFirebase();

  } else {
    trades = [];

    updateDashboard();
    renderTradeHistory();
    updateBestTradeShowcase();
    updateTradeReplay(null);
    updateEquityCurve();
    updateCalendarHeatmap();
    updateDailyPnlChart();
    updatePeriodSummary();
    updatePsychologyVerdict();

    loginBtn.textContent = "Login";
    loginBtn.title = "";
    loginBtn.onclick = () => openLoginPopup();
    if (accountBadge) {
      accountBadge.textContent = "Guest";
      accountBadge.classList.remove("active");
    }
  }
});

  document.getElementById('year').textContent = new Date().getFullYear();

  const reveals = document.querySelectorAll('.reveal');
let trades = [];
let editingTradeId = null;
let pendingTradeModalAfterLogin = false;

function calculateDisciplineScore() {
  const plan = Number(document.getElementById("planRating").value);
  const sl = Number(document.getElementById("slRating").value);
  const emotion = Number(document.getElementById("emotionRating").value);
  const risk = Number(document.getElementById("riskRating").value);
  const entry = Number(document.getElementById("entryRating").value);

  const score = plan + sl + emotion + risk + entry;

  const traderScore = score * 4;
document.getElementById("disciplineScore").innerText = traderScore + "/100";
const scoreElement = document.getElementById("disciplineScore");

if (traderScore >= 90) {
  scoreElement.style.color = "#00c896";
}

else if (traderScore >= 70) {
  scoreElement.style.color = "#ffcc00";
}

else {
  scoreElement.style.color = "#ff4d4d";
}
const gradeElement = document.getElementById("traderGrade");

if (traderScore >= 95) {
  gradeElement.innerText = "ðŸ† Elite Trader";
}

else if (traderScore >= 85) {
  gradeElement.innerText = "ðŸ”¥ Professional Trader";
}

else if (traderScore >= 70) {
  gradeElement.innerText = "ðŸ“ˆ Consistent Trader";
}

else if (traderScore >= 50) {
  gradeElement.innerText = "âš ï¸ Developing Trader";
}

else {
  gradeElement.innerText = "ðŸš¨ Undisciplined Trader";
}

  return score;
}

["planRating", "slRating", "emotionRating", "riskRating", "entryRating"].forEach((id) => {
  document.getElementById(id).addEventListener("change", calculateDisciplineScore);
});
  document.getElementById("tradeEntry")
?.addEventListener("input", updateTradePreview);

document.getElementById("tradeSl")
?.addEventListener("input", updateTradePreview);

document.getElementById("tradeTarget")
?.addEventListener("input", updateTradePreview);
document.getElementById("tradeExit")
?.addEventListener("input", updateTradePreview);
document.getElementById("tradeQty")
?.addEventListener("input", updateTradePreview);
document.getElementById("tradeDirection")
?.addEventListener("change", updateTradePreview);
function calculateRR() {

  const entry =
    Number(document.getElementById("tradeEntry").value);

  const sl =
    Number(document.getElementById("tradeSl").value);

  const target =
    Number(document.getElementById("tradeTarget").value);

  if (!entry || !sl || !target) {
    document.getElementById("rrRatio").innerText = "0 : 0";
    return;
  }

  const risk = Math.abs(entry - sl);
  const reward = Math.abs(target - entry);

  if (risk === 0) {
    document.getElementById("rrRatio").innerText = "Invalid";
    return;
  }

  document.getElementById("rrRatio").innerText =
    `1 : ${(reward / risk).toFixed(2)}`;
}

function updateTradePreview() {
  const entry = Number(document.getElementById("tradeEntry").value);
  const sl = Number(document.getElementById("tradeSl").value);
  const target = Number(document.getElementById("tradeTarget").value);
  const exit = Number(document.getElementById("tradeExit").value);
  const qty = Number(document.getElementById("tradeQty").value);
  const direction = document.getElementById("tradeDirection").value;

  calculateRR();

  const risk = entry && sl && qty ? Math.abs(entry - sl) * qty : 0;
  const reward = entry && target && qty ? Math.abs(target - entry) * qty : 0;
  let pnl = 0;

  if (entry && exit && qty && direction) {
    pnl = direction === "Long" ? (exit - entry) * qty : (entry - exit) * qty;
  }

  safeText("previewPnl", money(pnl));
  safeText("previewRisk", money(risk));
  safeText("previewReward", money(reward));
  safeText("previewRR", risk ? `1 : ${(reward / risk).toFixed(2)}` : "0 : 0");
}
function toggleOptionFields() {
  const segment = document.getElementById("tradeSegment").value;

  if (segment === "Options") {
    document.getElementById("optionFields").style.display = "block";
    document.getElementById("futureFields").style.display = "none";
  }

  else if (segment === "Futures") {
    document.getElementById("optionFields").style.display = "none";
    document.getElementById("futureFields").style.display = "block";
  }

  else {
    document.getElementById("optionFields").style.display = "none";
    document.getElementById("futureFields").style.display = "none";
  }
}
function setDefaultTradeDateTime() {
  const dateInput = document.getElementById("tradeDate");
  const timeInput = document.getElementById("tradeTime");
  const now = new Date();

  if (dateInput && !dateInput.value) {
    dateInput.value = now.toISOString().slice(0, 10);
  }

  if (timeInput && !timeInput.value) {
    timeInput.value = now.toTimeString().slice(0, 5);
  }
}

function openTradeModal(resetForm = true) {
  if (!auth.currentUser) {
    pendingTradeModalAfterLogin = true;
    openLoginPopup();
    setLoginStatus("Please login first to add a trade.", "info");
    return;
  }

  const modal = document.getElementById("tradeModal");
  const saveBtn = document.getElementById("saveTradeBtn");

  if (resetForm) {
    resetTradeForm();
  }

  setDefaultTradeDateTime();

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerText = editingTradeId ? "Update Trade" : "Save Trade";
  }

  modal.style.display = "flex";
}

function closeTradeModal() {
  document.getElementById("tradeModal").style.display = "none";
}

window.openTradeModal = openTradeModal;
window.closeTradeModal = closeTradeModal;

async function saveTrade() {
 const saveBtn = document.getElementById("saveTradeBtn");

if (!auth.currentUser) {
  pendingTradeModalAfterLogin = true;
  closeTradeModal();
  openLoginPopup();
  setLoginStatus("Please login first to save a trade.", "info");
  return;
}

if (saveBtn.disabled) return;

saveBtn.disabled = true;
saveBtn.innerText = "Saving...";
  const entry = Number(document.getElementById("tradeEntry").value);
  const exit = Number(document.getElementById("tradeExit").value);
  const qty = Number(document.getElementById("tradeQty").value);
  const segment = document.getElementById("tradeSegment").value;
  const direction = document.getElementById("tradeDirection").value;

if (!entry || !exit || !qty || !direction) {
    alert("Please fill entry, exit, quantity and direction.");

    saveBtn.disabled = false;
    saveBtn.innerText = "Save Trade";

    return;
}

 const finalQty = qty;

let pnl = 0;

if (direction === "Long") {
  pnl = (exit - entry) * finalQty;
} else {
  pnl = (entry - exit) * finalQty;
}

  const trade = {
    date: document.getElementById("tradeDate").value,
    time: document.getElementById("tradeTime").value,
    symbol: document.getElementById("tradeSymbol").value,
    segment: document.getElementById("tradeSegment").value,
optionType: document.getElementById("optionType")?.value || "",
strikePrice: document.getElementById("strikePrice")?.value || "",
expiryDate: document.getElementById("expiryDate")?.value || "",
premium: "",
lotSize: "",
lots: "",
futureExpiry: document.getElementById("futureExpiry")?.value || "",
futureLotSize: "",
    direction: direction,
    entryReason: document.getElementById("entryReason").value,
    setup: document.getElementById("tradeSetup").value,
    mistakes: getSelectedValues("tradeMistake").length
      ? getSelectedValues("tradeMistake")
      : ["No Mistake"],
    mistake: getSelectedValues("tradeMistake").length
      ? getSelectedValues("tradeMistake").join(", ")
      : "No Mistake",
    beforeScreenshot: document.getElementById("beforeScreenshot").files[0]
  ? URL.createObjectURL(document.getElementById("beforeScreenshot").files[0])
  : "",

afterScreenshot: document.getElementById("afterScreenshot").files[0]
  ? URL.createObjectURL(document.getElementById("afterScreenshot").files[0])
  : "",
  entry: entry,
exit: exit,
qty: qty,
slPrice:
Number(document.getElementById("tradeSl").value),

targetPrice:
Number(document.getElementById("tradeTarget").value),

rrRatio:
document.getElementById("rrRatio").innerText,
plan: Number(document.getElementById("planRating").value),
sl: Number(document.getElementById("slRating").value),
emotion: Number(document.getElementById("emotionRating").value),
risk: Number(document.getElementById("riskRating").value),
entryRating: Number(document.getElementById("entryRating").value),
    pnl: pnl,
    rules: document.getElementById("rulesFollowed").checked,
    disciplineScore: calculateDisciplineScore(),
    tradeQuality: document.getElementById("tradeQuality").value,
    note: document.getElementById("psychologyNote").value
  };
try {
  const user = auth.currentUser;

if (!user) {
  alert("Please login first");

  saveBtn.disabled = false;
  saveBtn.innerText = "Save Trade";

  return;
}

  if (editingTradeId) {
    await updateDoc(
      doc(db, "users", user.uid, "trades", editingTradeId),
      {
        ...trade,
        updatedAt: serverTimestamp()
      }
    );

    editingTradeId = null;
await loadTradesFromFirebase();
resetTradeForm();
closeTradeModal();

saveBtn.disabled = false;
saveBtn.innerText = "Save Trade";

alert("Trade updated successfully");
return;
  }

  await addDoc(
    collection(db, "users", user.uid, "trades"),
    {
      ...trade,
      createdAt: serverTimestamp()
    }
  );

  console.log("Trade saved to Firebase");

} catch (error) {
  console.error("Firestore Error:", error);
  alert(error.message);

  saveBtn.disabled = false;
  saveBtn.innerText = "Save Trade";

  return;
}
  await loadTradesFromFirebase();

  updateDashboard();
  renderTradeHistory();
  updateTradeReplay(trade);
  updateBestTradeShowcase();
  updateEquityCurve();
  updateCalendarHeatmap();
  updateDailyPnlChart();
  updatePeriodSummary();
  updatePsychologyVerdict();
 showProcessWarning(trade);
resetTradeForm();
document.getElementById("entryReason").value = "";
closeTradeModal();

saveBtn.disabled = false;
saveBtn.innerText = "Save Trade";
}

function safeText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function money(value) {
  return "₹" + Number(value || 0).toFixed(2);
}

function getSelectedValues(id) {
  const el = document.getElementById(id);
  if (id === "tradeMistake") {
    const checked = Array.from(document.querySelectorAll("#mistakeChips input:checked"))
      .map((input) => input.value)
      .filter(Boolean);
    if (checked.length) return checked;
  }
  if (!el) return [];

  return Array.from(el.selectedOptions)
    .map((option) => option.value)
    .filter(Boolean);
}

function setSelectedValues(id, values) {
  const el = document.getElementById(id);
  const selectedValues = Array.isArray(values)
    ? values
    : String(values || "").split(",").map((value) => value.trim()).filter(Boolean);

  if (id === "tradeMistake") {
    document.querySelectorAll("#mistakeChips input").forEach((input) => {
      input.checked = selectedValues.includes(input.value);
      input.closest("label")?.classList.toggle("active", input.checked);
    });
  }

  if (!el) return;

  Array.from(el.options).forEach((option) => {
    option.selected = selectedValues.includes(option.value);
  });
}

function getTradeMistakes(trade) {
  if (Array.isArray(trade.mistakes)) return trade.mistakes;
  if (Array.isArray(trade.mistake)) return trade.mistake;
  if (trade.mistake) return String(trade.mistake).split(",").map((item) => item.trim()).filter(Boolean);
  return ["No Mistake"];
}

function getMistakeText(trade) {
  const mistakes = getTradeMistakes(trade);
  return mistakes.length ? mistakes.join(", ") : "No Mistake";
}

function calculateMaxDrawdown(tradeList) {
  let running = 0;
  let peak = 0;
  let maxDrawdown = 0;

  tradeList.forEach((trade) => {
    running += Number(trade.pnl) || 0;
    peak = Math.max(peak, running);
    maxDrawdown = Math.min(maxDrawdown, running - peak);
  });

  return Math.abs(maxDrawdown);
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}

function updatePeriodSummary() {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const weekTrades = trades.filter((trade) => {
    if (!trade.date) return false;
    const tradeDate = new Date(trade.date);
    return tradeDate >= weekStart && tradeDate <= now;
  });

  const monthTrades = trades.filter((trade) => {
    if (!trade.date) return false;
    const tradeDate = new Date(trade.date);
    return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
  });

  const makeStats = (tradeList) => {
    const pnl = tradeList.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0);
    const wins = tradeList.filter((trade) => Number(trade.pnl) > 0).length;
    const losses = tradeList.filter((trade) => Number(trade.pnl) < 0).length;
    const winRate = tradeList.length ? Math.round((wins / tradeList.length) * 100) : 0;
    const avgTrade = tradeList.length ? pnl / tradeList.length : 0;
    const grossProfit = tradeList
      .filter((trade) => Number(trade.pnl) > 0)
      .reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0);
    const grossLoss = Math.abs(
      tradeList
        .filter((trade) => Number(trade.pnl) < 0)
        .reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0)
    );
    const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    return {
      pnl,
      wins,
      losses,
      winRate,
      avgTrade,
      profitFactor,
      maxDrawdown: calculateMaxDrawdown(tradeList),
      total: tradeList.length
    };
  };

  const week = makeStats(weekTrades);
  const month = makeStats(monthTrades);

  safeText("weekPnl", money(week.pnl));
  safeText("weekWinRate", week.winRate + "%");
  safeText("weekMaxDrawdown", money(week.maxDrawdown));
  safeText("monthPnlSummary", money(month.pnl));
  safeText("monthWinRateSummary", month.winRate + "%");
  safeText("monthMaxDrawdown", money(month.maxDrawdown));

  const dayStats = {};
  monthTrades.forEach((trade) => {
    if (!trade.date) return;
    dayStats[trade.date] = (dayStats[trade.date] || 0) + (Number(trade.pnl) || 0);
  });

  const sortedDays = Object.entries(dayStats).sort((a, b) => b[1] - a[1]);
  const bestDay = sortedDays[0];
  const worstDay = [...sortedDays].sort((a, b) => a[1] - b[1])[0];
  const rulesFollowed = monthTrades.filter((trade) => trade.rules).length;
  const ruleRate = monthTrades.length ? Math.round((rulesFollowed / monthTrades.length) * 100) : 0;

  const topMistakes = {};
  monthTrades.forEach((trade) => {
    getTradeMistakes(trade).forEach((mistake) => {
      if (!mistake || mistake === "No Mistake") return;
      topMistakes[mistake] = (topMistakes[mistake] || 0) + 1;
    });
  });

  const topMistake = Object.entries(topMistakes).sort((a, b) => b[1] - a[1])[0];
  const summaryBox = document.getElementById("summaryInsights");

  if (summaryBox) {
    if (!monthTrades.length && !weekTrades.length) {
      summaryBox.innerHTML = "Add trades to generate monthly and weekly insights.";
    } else {
      summaryBox.innerHTML = `
        <div>
          <strong>Month Snapshot</strong>
          <p>${month.total} trades | Avg Trade ${money(month.avgTrade)} | Profit Factor ${Number.isFinite(month.profitFactor) ? month.profitFactor.toFixed(2) : "∞"} | Rules ${ruleRate}%</p>
        </div>
        <div>
          <strong>Best / Worst Day</strong>
          <p>Best: ${bestDay ? `${bestDay[0]} (${money(bestDay[1])})` : "No data"} | Worst: ${worstDay ? `${worstDay[0]} (${money(worstDay[1])})` : "No data"}</p>
        </div>
        <div>
          <strong>Focus Point</strong>
          <p>${topMistake ? `Most repeated mistake: ${topMistake[0]} (${topMistake[1]}x)` : "No repeated mistake detected yet."}</p>
        </div>
      `;
    }
  }
}

function updateMonthlyDashboard() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTrades = trades.filter((trade) => {
    if (!trade.date) return false;
    const tradeDate = new Date(trade.date);
    return tradeDate.getMonth() === currentMonth &&
           tradeDate.getFullYear() === currentYear;
  });

  const monthTrades = monthlyTrades.length;
  const monthPnl = monthlyTrades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0);
  const wins = monthlyTrades.filter((trade) => trade.pnl > 0);
  const losses = monthlyTrades.filter((trade) => trade.pnl < 0);

  const monthWinRate = monthTrades ? Math.round((wins.length / monthTrades) * 100) : 0;
  const avgTrade = monthTrades ? monthPnl / monthTrades : 0;
  const avgWinner = wins.length ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
  const avgLoser = losses.length ? losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length : 0;

  const grossProfit = wins.reduce((sum, trade) => sum + trade.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
  const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

  const dayStats = {};

  monthlyTrades.forEach((trade) => {
    if (!dayStats[trade.date]) dayStats[trade.date] = 0;
    dayStats[trade.date] += Number(trade.pnl) || 0;
  });

  let bestDay = "No Data";
  let worstDay = "No Data";
  let bestDayPnl = -Infinity;
  let worstDayPnl = Infinity;

  Object.entries(dayStats).forEach(([date, pnl]) => {
    if (pnl > bestDayPnl) {
      bestDayPnl = pnl;
      bestDay = `${date} ₹${pnl.toFixed(2)}`;
    }

    if (pnl < worstDayPnl) {
      worstDayPnl = pnl;
      worstDay = `${date} ₹${pnl.toFixed(2)}`;
    }
  });

  let greenDays = 0;
  let redDays = 0;

  Object.values(dayStats).forEach((pnl) => {
    if (pnl > 0) greenDays++;
    if (pnl < 0) redDays++;
  });

  let winningStreak = 0;
  let losingStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  monthlyTrades.forEach((trade) => {
    if (trade.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
    } else if (trade.pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }

    winningStreak = Math.max(winningStreak, currentWinStreak);
    losingStreak = Math.max(losingStreak, currentLossStreak);
  });

  safeText("monthPnl", monthPnl.toFixed(2));
  safeText("monthTrades", monthTrades);
  safeText("monthWinRate", monthWinRate + "%");
  safeText("avgTrade", avgTrade.toFixed(2));
  safeText("avgWinner", avgWinner.toFixed(2));
  safeText("avgLoser", avgLoser.toFixed(2));
  safeText("bestDay", bestDay);
  safeText("worstDay", worstDay);

  safeText("greenDays", greenDays);
  safeText("redDays", redDays);
  safeText("proGreenDays", greenDays);
  safeText("proRedDays", redDays);

  safeText("heroProfitFactor", profitFactor.toFixed(2));
  safeText("winningStreak", winningStreak);
  safeText("losingStreak", losingStreak);
}
function toggleAdvancedAnalytics() {
  const box = document.getElementById("advancedAnalytics");
  const btn = document.querySelector(".advanced-toggle");

  if (box.style.display === "block") {
    box.style.display = "none";
    btn.innerText = "Show Advanced Analytics";
  } else {
    box.style.display = "block";
    btn.innerText = "Hide Advanced Analytics";
  }
}
function updatePsychologyVerdict() {
  const box = document.getElementById("psychologyVerdict");
  if (!box) return;

  if (!trades.length) {
    box.innerHTML = `
      <h4>Psychology Insights</h4>
      <p>No psychology data yet.</p>
    `;
    return;
  }

  const averages = {
    Plan: trades.reduce((s, t) => s + (Number(t.plan) || 0), 0) / trades.length,
    "SL Discipline": trades.reduce((s, t) => s + (Number(t.sl) || 0), 0) / trades.length,
    Emotion: trades.reduce((s, t) => s + (Number(t.emotion) || 0), 0) / trades.length,
    Risk: trades.reduce((s, t) => s + (Number(t.risk) || 0), 0) / trades.length,
    Entry: trades.reduce((s, t) => s + (Number(t.entryRating) || 0), 0) / trades.length
  };

  const psychologyScore = Math.round(
    Object.values(averages).reduce((sum, value) => sum + value, 0) * 4
  );

  const weakest = Object.entries(averages).sort((a, b) => a[1] - b[1])[0];
  const ruleFollowed = trades.filter((trade) => trade.rules).length;
  const ruleRate = Math.round((ruleFollowed / trades.length) * 100);

  const mistakeCounts = {};
  trades.forEach((trade) => {
    getTradeMistakes(trade).forEach((mistake) => {
      if (!mistake || mistake === "No Mistake") return;
      mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1;
    });
  });

  const topMistake = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0];

  let verdict = "Needs Discipline Work";
  if (psychologyScore >= 85) verdict = "Strong Trading Psychology";
  else if (psychologyScore >= 70) verdict = "Good, But Needs Control";
  else if (psychologyScore >= 50) verdict = "Weak Psychology Zone";

  const nextAction = weakest
    ? `Next focus: improve ${weakest[0]} from ${weakest[1].toFixed(1)}/5.`
    : "Keep journaling every trade.";

  box.innerHTML = `
    <h4>Psychology Insights</h4>
    <div class="psychology-score-row">
      <strong>${psychologyScore}/100</strong>
      <span>${verdict}</span>
    </div>
    <div class="psychology-mini-grid">
      <div><span>Rules Followed</span><strong>${ruleRate}%</strong></div>
      <div><span>Weakest Area</span><strong>${weakest ? weakest[0] : "N/A"}</strong></div>
      <div><span>Top Mistake</span><strong>${topMistake ? `${topMistake[0]} (${topMistake[1]}x)` : "None"}</strong></div>
    </div>
    <p>Plan ${averages.Plan.toFixed(1)}/5 | SL ${averages["SL Discipline"].toFixed(1)}/5 | Emotion ${averages.Emotion.toFixed(1)}/5 | Risk ${averages.Risk.toFixed(1)}/5 | Entry ${averages.Entry.toFixed(1)}/5</p>
    <p>${nextAction}</p>
  `;
}
function updateDashboard() {
  const totalTrades = trades.length;
  const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const wins = trades.filter((trade) => trade.pnl > 0).length;
  const rulesFollowed = trades.filter((trade) => trade.rules).length;

  const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0;
  const rulesRate = totalTrades ? Math.round((rulesFollowed / totalTrades) * 100) : 0;

  const pnls = trades.map((trade) => trade.pnl);
  const bestTrade = pnls.length ? Math.max(...pnls) : 0;
  const worstTrade = pnls.length ? Math.min(...pnls) : 0;

  const mistakeCount = {};

  trades.forEach((trade) => {
    if (trade.mistake && trade.mistake !== "No Mistake") {
      mistakeCount[trade.mistake] = (mistakeCount[trade.mistake] || 0) + 1;
    }
  });

  let topMistake = "None";
  let maxCount = 0;

  Object.keys(mistakeCount).forEach((mistake) => {
    if (mistakeCount[mistake] > maxCount) {
      maxCount = mistakeCount[mistake];
      topMistake = mistake;
    }
  });
  const bestSetupList = document.getElementById("bestSetupList");
  if (!bestSetupList) return;
bestSetupList.innerHTML = "";

const setupStats = {};

trades.forEach((trade) => {
  const setup = trade.setup || "No Setup";

  if (!setupStats[setup]) {
    setupStats[setup] = {
      trades: 0,
      pnl: 0,
      wins: 0
    };
  }

  setupStats[setup].trades++;
  setupStats[setup].pnl += trade.pnl;

  if (trade.pnl > 0) {
    setupStats[setup].wins++;
  }
});
const setupAnalysis = document.getElementById("setupAnalysis");
if (!setupAnalysis) return;
setupAnalysis.innerHTML = "";

Object.entries(setupStats).forEach((item) => {
  const setupName = item[0];
  const data = item[1];
  const winRate = Math.round((data.wins / data.trades) * 100);

  setupAnalysis.innerHTML += `
    <div class="setup-analysis-row">
      <strong>${setupName}</strong><br>
      Trades: ${data.trades}<br>
      Win Rate: ${winRate}%<br>
      P&L: ₹${data.pnl.toFixed(2)}
    </div>
  `;
});

if (Object.keys(setupStats).length === 0) {
  setupAnalysis.innerHTML = "No Data";
}
const sortedSetups = Object.entries(setupStats)
  .sort((a, b) => b[1].pnl - a[1].pnl);

if (sortedSetups.length === 0) {
  bestSetupList.innerHTML = "<li>No Data</li>";
} else {
  sortedSetups.forEach((item) => {
    const setupName = item[0];
    const data = item[1];

    const winRate = Math.round((data.wins / data.trades) * 100);

    bestSetupList.innerHTML += `
      <li>
        ${setupName} - ₹${data.pnl.toFixed(2)} |
        Win Rate: ${winRate}%
      </li>
    `;
  });
}
const worstSetupWarning =
  document.getElementById("worstSetupWarning");

let worstSetup = null;
let lowestPnl = 0;

Object.entries(setupStats).forEach((item) => {

  const setupName = item[0];
  const data = item[1];

  if (data.pnl < lowestPnl) {
    lowestPnl = data.pnl;
    worstSetup = setupName;
  }

});

if (worstSetup) {

  worstSetupWarning.innerHTML =
    `âš ï¸ Warning: ${worstSetup}
     is currently your worst setup
     (₹${lowestPnl.toFixed(2)})`;

}

else {

  worstSetupWarning.innerHTML =
    "âœ… No losing setup detected yet.";
}
const bestTimeList = document.getElementById("bestTimeList");
if (!bestTimeList) return;
bestTimeList.innerHTML = "";

const timeStats = {
  "09:15 - 10:00": { trades: 0, wins: 0, pnl: 0 },
  "10:00 - 11:00": { trades: 0, wins: 0, pnl: 0 },
  "11:00 - 12:00": { trades: 0, wins: 0, pnl: 0 },
  "12:00 - 01:00": { trades: 0, wins: 0, pnl: 0 },
  "01:00 - 02:00": { trades: 0, wins: 0, pnl: 0 },
  "02:00 - 03:30": { trades: 0, wins: 0, pnl: 0 }
};

trades.forEach((trade) => {
  if (!trade.time) return;

  const time = trade.time;

  let slot = "";

  if (time >= "09:15" && time < "10:00") {
    slot = "09:15 - 10:00";
  } else if (time >= "10:00" && time < "11:00") {
    slot = "10:00 - 11:00";
  } else if (time >= "11:00" && time < "12:00") {
    slot = "11:00 - 12:00";
  } else if (time >= "12:00" && time < "13:00") {
    slot = "12:00 - 01:00";
  } else if (time >= "13:00" && time < "14:00") {
    slot = "01:00 - 02:00";
  } else if (time >= "14:00" && time <= "15:30") {
    slot = "02:00 - 03:30";
  }

  if (!slot) return;

  timeStats[slot].trades++;
  timeStats[slot].pnl += trade.pnl;

  if (trade.pnl > 0) {
    timeStats[slot].wins++;
  }
});

const sortedTimes = Object.entries(timeStats)
  .filter((item) => item[1].trades > 0)
  .sort((a, b) => b[1].pnl - a[1].pnl);

if (sortedTimes.length === 0) {
  bestTimeList.innerHTML = "<li>No Data</li>";
} else {
  sortedTimes.forEach((item) => {
    const slot = item[0];
    const data = item[1];
    const winRate = Math.round((data.wins / data.trades) * 100);

    bestTimeList.innerHTML += `
      <li>
        ${slot} - ₹${data.pnl.toFixed(2)}
        | Win Rate: ${winRate}%
      </li>
    `;
  });
}
const worstTimeWarning =
  document.getElementById("worstTimeWarning");

let worstTime = null;
let worstTimePnl = 0;

Object.entries(timeStats).forEach((item) => {
  const slot = item[0];
  const data = item[1];

  if (data.trades > 0 && data.pnl < worstTimePnl) {
    worstTimePnl = data.pnl;
    worstTime = slot;
  }
});

if (worstTime) {
  worstTimeWarning.innerHTML =
    `âš ï¸ Warning: ${worstTime} is your weakest time slot (₹${worstTimePnl.toFixed(2)}).`;
} else {
  worstTimeWarning.innerHTML =
    "âœ… No weak time slot detected yet.";
}
  document.getElementById("totalTrades").innerText = totalTrades;
  document.getElementById("totalPnl").innerText = "₹" + totalPnl.toFixed(2);
  document.getElementById("winRate").innerText = winRate + "%";
  document.getElementById("rulesRate").innerText = rulesRate + "%";
  document.getElementById("heroPnl").innerText = "₹" + totalPnl.toFixed(2);
document.getElementById("heroWinRate").innerText = winRate + "%";
document.getElementById("proTotalTrades").innerText = totalTrades;
document.getElementById("proBestTrade").innerText = "₹" + bestTrade.toFixed(2);
document.getElementById("proWorstTrade").innerText = "₹" + worstTrade.toFixed(2);
document.getElementById("proRulesRate").innerText = rulesRate + "%";
  const topMistakesList = document.getElementById("topMistakesList");
topMistakesList.innerHTML = "";
const mistakeCostList = document.getElementById("mistakeCostList");
mistakeCostList.innerHTML = "";

const mistakeCosts = {};

trades.forEach((trade) => {

  if (
    trade.mistake &&
    trade.mistake !== "No Mistake"
  ) {

    if (!mistakeCosts[trade.mistake]) {
      mistakeCosts[trade.mistake] = 0;
    }

    if (trade.pnl < 0) {
      mistakeCosts[trade.mistake] += Math.abs(trade.pnl);
    }

  }

});

const sortedCosts =
  Object.entries(mistakeCosts)
    .sort((a, b) => b[1] - a[1]);

if (sortedCosts.length === 0) {

  mistakeCostList.innerHTML =
    "<li>No Data</li>";

} else {

  sortedCosts.forEach((item) => {

    mistakeCostList.innerHTML += `
      <li>
        ${item[0]}
        = ₹${item[1].toFixed(2)}
      </li>
    `;

  });

}

const sortedMistakes = Object.entries(mistakeCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);

if (sortedMistakes.length === 0) {
  topMistakesList.innerHTML = "<li>None</li>";
} else {
  sortedMistakes.forEach((item) => {
    topMistakesList.innerHTML += `<li>${item[0]} - ${item[1]} times</li>`;
  });
}

}
function classifyTrade(trade) {
  const isWin = trade.pnl > 0;
  const goodProcess =
    trade.rules &&
    trade.disciplineScore >= 18 &&
    trade.tradeQuality !== "F";

  if (isWin && goodProcess) {
    return "Winning Trade + Good Process";
  }

  if (isWin && !goodProcess) {
    return "Winning Trade + Bad Process";
  }

  if (!isWin && goodProcess) {
    return "Losing Trade + Good Process";
  }

  return "Losing Trade + Bad Process";
}
function showProcessWarning(trade) {
  const warningBox = document.getElementById("processWarning");
  const tradeClass = classifyTrade(trade);

  if (tradeClass === "Winning Trade + Bad Process") {
    warningBox.innerText = "âš ï¸ Profit hua, lekin process weak tha. Aise trades repeat mat karo.";
    warningBox.className = "process-warning warning";
  }

  else if (tradeClass === "Losing Trade + Good Process") {
    warningBox.innerText = "âœ… Loss hua, lekin process strong tha. Ye acceptable trading hai.";
    warningBox.className = "process-warning good";
  }

  else if (tradeClass === "Winning Trade + Good Process") {
    warningBox.innerText = "ðŸ”¥ Excellent trade. Profit bhi aur process bhi strong.";
    warningBox.className = "process-warning good";
  }

  else {
    warningBox.innerText = "ðŸš¨ Loss bhi hua aur process bhi weak tha. Is trade ko deeply review karo.";
    warningBox.className = "process-warning danger";
  }
}
function updateCalendarHeatmap() {
  const box = document.getElementById("calendarHeatmap");
  if (!box) return;

  box.innerHTML = "";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayStats = {};

  trades.forEach((trade) => {
    if (!trade.date) return;

    const d = new Date(trade.date);
    if (d.getMonth() !== month || d.getFullYear() !== year) return;

    const day = d.getDate();

    if (!dayStats[day]) {
      dayStats[day] = {
        pnl: 0,
        trades: 0
      };
    }

    dayStats[day].pnl += Number(trade.pnl) || 0;
    dayStats[day].trades++;
  });

  for (let day = 1; day <= daysInMonth; day++) {
    const data = dayStats[day];

    let cls = "no-trade-day";
    let info = `${day}: No Trade`;

    if (data) {
      cls = data.pnl >= 0 ? "profit-day" : "loss-day";
      info = `${day}: ₹${data.pnl.toFixed(2)} | Trades: ${data.trades}`;
    }

    box.innerHTML += `
      <div class="heat-day ${cls}" data-info="${info}">
        ${day}
      </div>
    `;
  }
}
function updateEquityCurve() {
  const chart = document.getElementById("equityCurve");
  chart.innerHTML = "";

  if (!trades.length) return;

  let runningTotal = 0;
  const points = trades.map((trade) => {
    runningTotal += trade.pnl;
    return runningTotal;
  });

  const width = 500;
  const height = 220;
  const padding = 25;

  const min = Math.min(...points, 0);
  const max = Math.max(...points, 0);

  const range = max - min || 1;

  const getX = (index) => {
    if (points.length === 1) return width / 2;
    return padding + (index * (width - padding * 2)) / (points.length - 1);
  };

  const getY = (value) => {
    return height - padding - ((value - min) / range) * (height - padding * 2);
  };

  const zeroY = getY(0);

  chart.innerHTML += `
    <line
      x1="${padding}"
      y1="${zeroY}"
      x2="${width - padding}"
      y2="${zeroY}"
      class="equity-zero-line"
    />
  `;

  const pathData = points
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point)}`;
    })
    .join(" ");

  chart.innerHTML += `
    <path d="${pathData}" class="equity-line"></path>
  `;

  points.forEach((point, index) => {
    chart.innerHTML += `
      <circle
        cx="${getX(index)}"
        cy="${getY(point)}"
        r="4"
        class="equity-dot"
      ></circle>
    `;
  });
}

function updateDailyPnlChart() {
  const chart = document.getElementById("dailyPnlChart");
  if (!chart) return;

  chart.innerHTML = "";

  if (!trades.length) {
    chart.innerHTML = `<text x="250" y="110" text-anchor="middle" fill="#777">Daily P&L will appear here</text>`;
    return;
  }

  const dayStats = {};

  trades.forEach((trade) => {
    if (!trade.date) return;
    dayStats[trade.date] = (dayStats[trade.date] || 0) + (Number(trade.pnl) || 0);
  });

  const entries = Object.entries(dayStats).sort((a, b) => new Date(a[0]) - new Date(b[0])).slice(-14);
  const values = entries.map((entry) => entry[1]);

  const width = 500;
  const height = 220;
  const padding = 28;
  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 1);
  const zeroY = height / 2;
  const barGap = 8;
  const barWidth = (width - padding * 2 - barGap * (entries.length - 1)) / entries.length;

  chart.innerHTML += `
    <line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" class="equity-zero-line" />
  `;

  entries.forEach(([date, pnl], index) => {
    const barHeight = Math.max(4, (Math.abs(pnl) / maxAbs) * (height / 2 - padding));
    const x = padding + index * (barWidth + barGap);
    const y = pnl >= 0 ? zeroY - barHeight : zeroY;
    const cls = pnl >= 0 ? "daily-bar profit-bar" : "daily-bar loss-bar";
    const day = new Date(date).getDate();

    chart.innerHTML += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" class="${cls}">
        <title>${date}: ${money(pnl)}</title>
      </rect>
      <text x="${x + barWidth / 2}" y="${height - 8}" text-anchor="middle" fill="#777" font-size="10">${day}</text>
    `;
  });
}
function updateBestTradeShowcase() {

  const showcase =
    document.getElementById("bestTradeShowcase");

  if (trades.length === 0) {
    showcase.innerHTML =
      "<p class='empty-text'>No trades yet.</p>";
    return;
  }

  const bestTrade =
    trades.reduce((best, current) =>
      current.pnl > best.pnl ? current : best
    );

  showcase.innerHTML = `
    <div class="replay-card">

      <h4>
        ðŸ† Best Trade Ever
      </h4>

      <p>
        ${bestTrade.symbol || "N/A"}
        |
        ${bestTrade.segment || "N/A"}
      </p>

      <p>
        Date:
        ${bestTrade.date || "N/A"}
      </p>

      <p>
        Setup:
        ${bestTrade.setup || "No Setup"}
      </p>

      <p>
        P&L:
        <strong class="profit">
          ₹${bestTrade.pnl.toFixed(2)}
        </strong>
      </p>

      <p>
        Trader Score:
        ${bestTrade.disciplineScore * 4}/100
      </p>

    </div>
  `;
}
function getDemoTradePreview() {
  return {
    symbol: "NIFTY 24500 CE",
    segment: "Options",
    direction: "Long",
    time: "09:45",
    setup: "Breakout",
    entryReason: "Level Breakout",
    mistake: "No Mistake",
    entry: 120,
    exit: 136,
    qty: 75,
    pnl: 1200,
    rules: true,
    disciplineScore: 22,
    tradeQuality: "Winning Trade + Good Process"
  };
}

function renderDemoTradeRow() {
  const demo = getDemoTradePreview();

  return `
    <div class="trade-table-row demo-trade">
      <div><span class="demo-badge">Demo</span><strong>${demo.symbol}</strong><small>${demo.time}</small></div>
      <div>${new Date().toISOString().slice(0, 10)}</div>
      <div>${demo.setup}</div>
      <div>${demo.direction}</div>
      <div>₹${demo.entry}</div>
      <div>₹112</div>
      <div>₹136</div>
      <div class="profit">₹${demo.pnl.toFixed(2)}</div>
      <div>1 : 2.00</div>
      <div>No Mistake</div>
      <div>Yes</div>
      <div><small>Your real trades will appear here.</small></div>
    </div>
  `;
}

function renderDemoReplayCard() {
  const demo = getDemoTradePreview();

  return `
    <div class="replay-card demo-trade">
      <span class="demo-badge">Demo Preview</span>
      <h4>${demo.symbol} | ${demo.segment}</h4>
      <p>Direction: ${demo.direction}</p>
      <p>Entry: ₹${demo.entry} | Exit: ₹${demo.exit} | Qty: ${demo.qty}</p>
      <p>Setup: ${demo.setup}</p>
      <p>Entry Reason: ${demo.entryReason}</p>
      <p>Result: <strong class="profit">₹${demo.pnl.toFixed(2)}</strong></p>
      <p>Process: Winning Trade + Good Process</p>
    </div>
  `;
}

function updateTradeReplay(trade) {
  const replay = document.getElementById("tradeReplay");

  if (!trade) {
    replay.innerHTML = renderDemoReplayCard();
    return;
  }
  const tradeClass = classifyTrade(trade);
  const pnlClass = trade.pnl >= 0 ? "profit" : "loss";

  replay.innerHTML = `
    <div class="replay-card">
      <h4>${trade.symbol || "N/A"} | ${trade.segment || "N/A"}</h4>

      <p>Direction: ${trade.direction || "N/A"}</p>
      <p>Time: ${trade.time || "No Time"}</p>
      <p>Setup: ${trade.setup || "No Setup"}</p>
      <p>Entry Reason: ${trade.entryReason || "Not Added"}</p>
      <p>Mistake: ${trade.mistake || "No Mistake"}</p>

      <p>
        Result:
        <strong class="${pnlClass}">
          ₹${trade.pnl.toFixed(2)}
        </strong>
      </p>

      <p>Process: ${tradeClass}</p>
      <p>Trader Score: ${trade.disciplineScore * 4}/100</p>

      <div class="replay-images">
        ${
          trade.beforeScreenshot
            ? `<img src="${trade.beforeScreenshot}" class="trade-thumb">`
            : ""
        }

        ${
          trade.afterScreenshot
            ? `<img src="${trade.afterScreenshot}" class="trade-thumb">`
            : ""
        }
      </div>
    </div>
  `;
}
function renderTradeTableHeader() {
  return `
    <div class="trade-table-header">
      <span>Trade</span>
      <span>Date</span>
      <span>Setup</span>
      <span>Direction</span>
      <span>Entry</span>
      <span>SL</span>
      <span>Target</span>
      <span>P&L</span>
      <span>R:R</span>
      <span>Mistake</span>
      <span>Rules</span>
      <span>Actions</span>
    </div>
  `;
}

function isTradeInDateFilter(trade) {
  const filter = document.getElementById("dateFilter")?.value || "";
  if (!filter || !trade.date) return true;

  const tradeDate = new Date(trade.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter === "today") {
    const d = new Date(tradeDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }

  if (filter === "week") {
    return tradeDate >= getWeekStart(new Date()) && tradeDate <= new Date();
  }

  if (filter === "month") {
    return tradeDate.getMonth() === today.getMonth() && tradeDate.getFullYear() === today.getFullYear();
  }

  if (filter === "custom") {
    const fromValue = document.getElementById("dateFromFilter")?.value;
    const toValue = document.getElementById("dateToFilter")?.value;
    const from = fromValue ? new Date(fromValue) : null;
    const to = toValue ? new Date(toValue) : null;
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);
    return (!from || tradeDate >= from) && (!to || tradeDate <= to);
  }

  return true;
}

function renderTradeHistory() {
  const history = document.getElementById("tradeHistory");
  history.innerHTML = renderTradeTableHeader();

  const searchText = document.getElementById("tradeSearch").value.toLowerCase();
  const directionValue = document.getElementById("directionFilter").value;
  const resultValue = document.getElementById("resultFilter").value;

  const filteredTrades = trades.filter((trade) => {
    const symbolMatch = (trade.symbol || "").toLowerCase().includes(searchText);
    const setupMatch = (trade.setup || "").toLowerCase().includes(searchText);
    const directionMatch = !directionValue || trade.direction === directionValue;
    const resultMatch =
      !resultValue ||
      (resultValue === "profit" && trade.pnl >= 0) ||
      (resultValue === "loss" && trade.pnl < 0);

    return (symbolMatch || setupMatch) && directionMatch && resultMatch && isTradeInDateFilter(trade);
  });

  if (trades.length === 0) {
    history.innerHTML += renderDemoTradeRow();
    return;
  }

  if (filteredTrades.length === 0) {
    history.innerHTML += "<p class='empty-text'>No trades match your filters.</p>";
    return;
  }

  filteredTrades.slice(0, 20).forEach((trade) => {
    const pnlClass = trade.pnl >= 0 ? "profit" : "loss";

    history.innerHTML += `
      <div class="trade-table-row" onclick="openTradeDetail('${trade.id}')">
        <div>
          <strong>${trade.symbol || "N/A"}</strong>
          <small>${trade.segment || "N/A"} | ${trade.time || "No Time"}</small>
        </div>
        <div>${trade.date || "N/A"}</div>
        <div>${trade.setup || "No Setup"}</div>
        <div>${trade.direction || "N/A"}</div>
        <div>${money(trade.entry)}</div>
        <div>${money(trade.slPrice)}</div>
        <div>${money(trade.targetPrice)}</div>
        <div class="${pnlClass}">${money(trade.pnl)}</div>
        <div>${trade.rrRatio || "0 : 0"}</div>
        <div>${getMistakeText(trade)}</div>
        <div>${trade.rules ? "Yes" : "No"}</div>
        <div class="trade-actions">
          <button type="button" onclick="event.stopPropagation(); editTrade('${trade.id}')" class="table-action edit-action">Edit</button>
          <button type="button" onclick="event.stopPropagation(); deleteTrade('${trade.id}')" class="table-action delete-action">Delete</button>
        </div>
      </div>
    `;
  });
}

document.getElementById("tradeSearch").addEventListener("input", renderTradeHistory);
document.getElementById("directionFilter").addEventListener("change", renderTradeHistory);
document.getElementById("resultFilter").addEventListener("change", renderTradeHistory);
document.getElementById("dateFilter").addEventListener("change", () => {
  const isCustom = document.getElementById("dateFilter").value === "custom";
  document.getElementById("dateFromFilter").classList.toggle("active", isCustom);
  document.getElementById("dateToFilter").classList.toggle("active", isCustom);
  renderTradeHistory();
});
document.getElementById("dateFromFilter").addEventListener("change", renderTradeHistory);
document.getElementById("dateToFilter").addEventListener("change", renderTradeHistory);

function openTradeDetail(tradeId) {
  const trade = trades.find((item) => item.id === tradeId);
  const modal = document.getElementById("tradeDetailModal");
  const content = document.getElementById("tradeDetailContent");

  if (!trade || !modal || !content) return;

  const pnlClass = trade.pnl >= 0 ? "profit" : "loss";

  content.innerHTML = `
    <h3>${trade.symbol || "N/A"} <span>${trade.segment || "N/A"}</span></h3>
    <div class="detail-grid">
      <div><span>Date</span><strong>${trade.date || "N/A"}</strong></div>
      <div><span>Time</span><strong>${trade.time || "N/A"}</strong></div>
      <div><span>Direction</span><strong>${trade.direction || "N/A"}</strong></div>
      <div><span>Setup</span><strong>${trade.setup || "No Setup"}</strong></div>
      <div><span>Entry</span><strong>${money(trade.entry)}</strong></div>
      <div><span>SL</span><strong>${money(trade.slPrice)}</strong></div>
      <div><span>Target</span><strong>${money(trade.targetPrice)}</strong></div>
      <div><span>Exit</span><strong>${money(trade.exit)}</strong></div>
      <div><span>Qty</span><strong>${trade.qty || 0}</strong></div>
      <div><span>P&L</span><strong class="${pnlClass}">${money(trade.pnl)}</strong></div>
      <div><span>R:R</span><strong>${trade.rrRatio || "0 : 0"}</strong></div>
      <div><span>Rules</span><strong>${trade.rules ? "Yes" : "No"}</strong></div>
    </div>
    <div class="detail-note">
      <strong>Mistakes</strong>
      <p>${getMistakeText(trade)}</p>
      <strong>Note</strong>
      <p>${trade.note || "No note added."}</p>
    </div>
  `;

  modal.style.display = "flex";
}

function closeTradeDetail() {
  document.getElementById("tradeDetailModal").style.display = "none";
}
function exportTradesCSV() {

  if (!trades.length) {
    alert("No trades found");
    return;
  }

  let csv = "Date,Time,Symbol,Segment,Direction,Entry,SL,Target,Exit,Quantity,RR,Setup,Entry Reason,Mistakes,Rules Followed,Trader Score,Trade Quality,PNL,Note\n";

  trades.forEach((trade) => {
csv +=
  `${trade.date || ""},` +
  `${trade.time || ""},` +
  `${trade.symbol || ""},` +
  `${trade.segment || ""},` +
  `${trade.direction || ""},` +
  `${trade.entry || ""},` +
  `${trade.slPrice || ""},` +
  `${trade.targetPrice || ""},` +
  `${trade.exit || ""},` +
  `${trade.qty || ""},` +
  `${trade.rrRatio || ""},` +
  `${trade.setup || ""},` +
  `${trade.entryReason || ""},` +
  `${getMistakeText(trade)},` +
  `${trade.rules ? "Yes" : "No"},` +
  `${(trade.disciplineScore || 0) * 4},` +
  `${trade.tradeQuality || ""},` +
  `${trade.pnl || 0},` +
  `"${trade.note || ""}"\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv"
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "DDTradingJournal.csv";
  a.click();

  window.URL.revokeObjectURL(url);
}
async function deleteTrade(tradeId) {

    if (!confirm("Delete this trade?")) return;

    try {

        const user = auth.currentUser;

        await deleteDoc(
            doc(db, "users", user.uid, "trades", tradeId)
        );

        await loadTradesFromFirebase();

        alert("Trade deleted successfully");

    } catch (error) {

        console.error(error);
        alert(error.message);

    }
}
function editTrade(tradeId) {
    const trade = trades.find(t => t.id === tradeId);

    if (!trade) {
        alert("Trade not found");
        return;
    }

    editingTradeId = tradeId;

    document.getElementById("tradeDate").value = trade.date || "";
    document.getElementById("tradeTime").value = trade.time || "";
    document.getElementById("tradeSymbol").value = trade.symbol || "";
    document.getElementById("tradeSegment").value = trade.segment || "";
    document.getElementById("tradeDirection").value = trade.direction || "";
    document.getElementById("tradeEntry").value = trade.entry || "";
    document.getElementById("tradeSl").value = trade.slPrice || "";
    document.getElementById("tradeTarget").value = trade.targetPrice || "";
    document.getElementById("tradeExit").value = trade.exit || "";
    document.getElementById("tradeQty").value = trade.qty || "";
    document.getElementById("entryReason").value = trade.entryReason || "";
    document.getElementById("tradeSetup").value = trade.setup || "";
    setSelectedValues("tradeMistake", trade.mistakes || trade.mistake || "");
    document.getElementById("rulesFollowed").checked = trade.rules || false;
    document.getElementById("planRating").value = trade.plan || "0";
    document.getElementById("slRating").value = trade.sl || "0";
    document.getElementById("emotionRating").value = trade.emotion || "0";
    document.getElementById("riskRating").value = trade.risk || "0";
    document.getElementById("entryRating").value = trade.entryRating || "0";
    document.getElementById("tradeQuality").value = trade.tradeQuality || "";
    document.getElementById("psychologyNote").value = trade.note || "";

    toggleOptionFields();
    updateTradePreview();
    calculateDisciplineScore();

    openTradeModal(false);
}
function resetTradeForm() {
  document.getElementById("tradeDate").value = "";
  document.getElementById("tradeTime").value = "";
  document.getElementById("tradeSymbol").value = "";
  document.getElementById("tradeSegment").value = "";
  document.getElementById("tradeDirection").value = "";
  document.getElementById("tradeEntry").value = "";
  document.getElementById("tradeSl").value = "";
  document.getElementById("tradeTarget").value = "";
  document.getElementById("tradeExit").value = "";
  document.getElementById("tradeQty").value = "";
  document.getElementById("tradeSetup").value = "";
  setSelectedValues("tradeMistake", []);
  document.getElementById("rulesFollowed").checked = false;
document.getElementById("planRating").value = "0";
document.getElementById("slRating").value = "0";
document.getElementById("emotionRating").value = "0";
document.getElementById("riskRating").value = "0";
document.getElementById("entryRating").value = "0";
document.getElementById("tradeQuality").value = "";
  document.getElementById("psychologyNote").value = "";
document.getElementById("entryReason").value = "";
document.getElementById("beforeScreenshot").value = "";
document.getElementById("afterScreenshot").value = "";
document.getElementById("optionType").value = "";
document.getElementById("strikePrice").value = "";
document.getElementById("expiryDate").value = "";
document.getElementById("premium").value = "";
document.getElementById("lotSize").value = "";
document.getElementById("lots").value = "";
document.getElementById("futureExpiry").value = "";
document.getElementById("futureLotSize").value = "";

editingTradeId = null;
  toggleOptionFields();
  updateTradePreview();
  calculateDisciplineScore();
}
  function revealSections() {
    reveals.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const screenPosition = window.innerHeight - 100;

      if (sectionTop < screenPosition) {
        section.classList.add('active');
      }
    });
  }

  function openLoginPopup() {
    setLoginStatus("");
    setAuthLoading(false);
    document.getElementById("loginPopup").style.display = "flex";
    setTimeout(() => document.getElementById("loginEmail")?.focus(), 50);
  }

  function closeLoginPopup() {
    document.getElementById("loginPopup").style.display = "none";
  }

  window.addEventListener('scroll', revealSections);
  document.getElementById("tradeModal")?.addEventListener("click", (event) => {
    if (event.target.id === "tradeModal") {
      closeTradeModal();
    }
  });
  document.getElementById("tradeDetailModal")?.addEventListener("click", (event) => {
    if (event.target.id === "tradeDetailModal") {
      closeTradeDetail();
    }
  });

  document.querySelectorAll("#mistakeChips input").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value === "No Mistake" && input.checked) {
        document.querySelectorAll("#mistakeChips input").forEach((other) => {
          if (other !== input) other.checked = false;
        });
      } else if (input.checked) {
        const noMistake = document.querySelector('#mistakeChips input[value="No Mistake"]');
        if (noMistake) noMistake.checked = false;
      }

      const values = Array.from(document.querySelectorAll("#mistakeChips input:checked")).map((item) => item.value);
      setSelectedValues("tradeMistake", values);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      document.getElementById("tradeModal")?.style.display === "flex"
    ) {
      closeTradeModal();
    }
    if (
      event.key === "Escape" &&
      document.getElementById("tradeDetailModal")?.style.display === "flex"
    ) {
      closeTradeDetail();
    }
  });

  revealSections();
window.saveTrade = saveTrade;
window.toggleOptionFields = toggleOptionFields;
window.toggleAdvancedAnalytics = toggleAdvancedAnalytics;
window.exportTradesCSV = exportTradesCSV;
window.deleteTrade = deleteTrade;
window.editTrade = editTrade;
window.openLoginPopup = openLoginPopup;
window.closeLoginPopup = closeLoginPopup;
window.toggleLoginPassword = toggleLoginPassword;
window.openTradeDetail = openTradeDetail;
window.closeTradeDetail = closeTradeDetail;
// ================= ADVANCED JOURNAL ANALYTICS =================

function updateAdvancedAnalytics() {
  if (!Array.isArray(trades) || trades.length === 0) {
    return;
  }

  updateRuleBreakCostAnalyzer();
  updateSetupAnalytics();
  updateMonthlyReportCard();
  updateBestWorstTrade();
  updateTraderScore();
  updateAIPatternDetector();
}

function getTradePnl(trade) {
  return Number(trade.pnl || trade.profitLoss || trade.pl || 0);
}

function formatMoney(value) {
  return "₹" + Number(value || 0).toFixed(2);
}

// 1. Rule Break Cost Analyzer
function updateRuleBreakCostAnalyzer() {
  let followedPnl = 0;
  let brokenPnl = 0;

  trades.forEach(trade => {
    const pnl = getTradePnl(trade);

    if (trade.rules === true || trade.rules === "Yes" || trade.rules === "Followed") {
      followedPnl += pnl;
    } else {
      brokenPnl += pnl;
    }
  });

  document.getElementById("rulesFollowedPnl").innerText = formatMoney(followedPnl);
  document.getElementById("rulesBrokenPnl").innerText = formatMoney(brokenPnl);
  safeText("rulesFollowedPnlAdvanced", formatMoney(followedPnl));
  safeText("rulesBrokenPnlAdvanced", formatMoney(brokenPnl));

  document.getElementById("rulesFollowedPnl").className = followedPnl >= 0 ? "profit-text" : "loss-text";
  document.getElementById("rulesBrokenPnl").className = brokenPnl >= 0 ? "profit-text" : "loss-text";
  const followedAdvanced = document.getElementById("rulesFollowedPnlAdvanced");
  const brokenAdvanced = document.getElementById("rulesBrokenPnlAdvanced");
  if (followedAdvanced) followedAdvanced.className = followedPnl >= 0 ? "profit-text" : "loss-text";
  if (brokenAdvanced) brokenAdvanced.className = brokenPnl >= 0 ? "profit-text" : "loss-text";
}

// 2. Setup Analytics
function updateSetupAnalytics() {
  const setupData = {};

  trades.forEach(trade => {
    const setup = trade.setup || "No Setup";
    const pnl = getTradePnl(trade);

    if (!setupData[setup]) {
      setupData[setup] = {
        total: 0,
        wins: 0,
        pnl: 0
      };
    }

    setupData[setup].total++;
    setupData[setup].pnl += pnl;

    if (pnl > 0) {
      setupData[setup].wins++;
    }
  });

  let html = "";

  Object.keys(setupData).forEach(setup => {
    const data = setupData[setup];
    const winRate = ((data.wins / data.total) * 100).toFixed(0);

    html += `
      <div class="setup-row">
        <span>${setup}</span>
        <span>${winRate}% | ${formatMoney(data.pnl)}</span>
      </div>
    `;
  });

  document.getElementById("setupAnalyticsBox").innerHTML = html || "No setup data yet";
}

// 3. Monthly Report Card
function updateMonthlyReportCard() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTrades = trades.filter(trade => {
    if (!trade.date) return false;

    const tradeDate = new Date(trade.date);
    return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
  });

  const totalTrades = monthTrades.length;
  const winners = monthTrades.filter(trade => getTradePnl(trade) > 0);
  const losers = monthTrades.filter(trade => getTradePnl(trade) < 0);

  const totalProfit = winners.reduce((sum, trade) => sum + getTradePnl(trade), 0);
  const totalLoss = Math.abs(losers.reduce((sum, trade) => sum + getTradePnl(trade), 0));

  const winRate = totalTrades ? ((winners.length / totalTrades) * 100).toFixed(0) : 0;
  const avgWinner = winners.length ? totalProfit / winners.length : 0;
  const avgLoser = losers.length ? totalLoss / losers.length : 0;
  const profitFactor = totalLoss ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? "âˆž" : "0";

  document.getElementById("monthTotalTrades").innerText = totalTrades;
  document.getElementById("monthWinRate").innerText = winRate + "%";
  document.getElementById("monthAvgWinner").innerText = formatMoney(avgWinner);
  document.getElementById("monthAvgLoser").innerText = formatMoney(avgLoser);
  document.getElementById("monthProfitFactor").innerText = profitFactor;
}

// 4. Best / Worst Trade Review
function updateBestWorstTrade() {
  const sortedTrades = [...trades].sort((a, b) => getTradePnl(b) - getTradePnl(a));

  const bestTrade = sortedTrades[0];
  const worstTrade = sortedTrades[sortedTrades.length - 1];

  document.getElementById("bestTradeBox").innerText = bestTrade
    ? `${bestTrade.symbol || "Trade"} | ${formatMoney(getTradePnl(bestTrade))}`
    : "₹0";

  document.getElementById("worstTradeBox").innerText = worstTrade
    ? `${worstTrade.symbol || "Trade"} | ${formatMoney(getTradePnl(worstTrade))}`
    : "₹0";

  document.getElementById("bestTradeBox").className = "profit-text";
  document.getElementById("worstTradeBox").className = "loss-text";
}

// 5. Trader Score
function updateTraderScore() {
  const totalTrades = trades.length;
  const winners = trades.filter(trade => getTradePnl(trade) > 0).length;

  const rulesFollowed = trades.filter(trade =>
    trade.rules === true || trade.rules === "Yes" || trade.rules === "Followed"
  ).length;

  const noMistakeTrades = trades.filter(trade =>
    !trade.mistake || trade.mistake === "No Mistake"
  ).length;

  const avgDiscipline =
    trades.reduce((sum, trade) => sum + Number(trade.disciplineScore || 0), 0) / totalTrades;

  const winRateScore = (winners / totalTrades) * 30;
  const ruleScore = (rulesFollowed / totalTrades) * 30;
  const mistakeScore = (noMistakeTrades / totalTrades) * 25;
  const disciplineScore = (avgDiscipline / 5) * 15;

  const finalScore = Math.round(winRateScore + ruleScore + mistakeScore + disciplineScore);

  document.getElementById("traderScoreBox").innerText = finalScore + "/100";

  let scoreText = "Needs improvement";

  if (finalScore >= 80) {
    scoreText = "Excellent discipline. Keep it up.";
  } else if (finalScore >= 60) {
    scoreText = "Good progress. Thoda aur consistency chahiye.";
  } else if (finalScore >= 40) {
    scoreText = "Average. Mistakes aur rule break kam karo.";
  }

  document.getElementById("traderScoreText").innerText = scoreText;
}

// 6. AI Pattern Detector
function updateAIPatternDetector() {
  const mistakeCount = {};
  let totalLoss = 0;
  let ruleBrokenLoss = 0;

  trades.forEach(trade => {
    const mistake = trade.mistake || "No Mistake";
    const pnl = getTradePnl(trade);

    if (!mistakeCount[mistake]) {
      mistakeCount[mistake] = 0;
    }

    mistakeCount[mistake]++;

    if (pnl < 0) {
      totalLoss += Math.abs(pnl);

      if (!(trade.rules === true || trade.rules === "Yes" || trade.rules === "Followed")) {
        ruleBrokenLoss += Math.abs(pnl);
      }
    }
  });

  let topMistake = "No Mistake";
  let maxCount = 0;

  Object.keys(mistakeCount).forEach(mistake => {
    if (mistake !== "No Mistake" && mistakeCount[mistake] > maxCount) {
      maxCount = mistakeCount[mistake];
      topMistake = mistake;
    }
  });

  let message = `<span class="ai-good">No major negative pattern detected yet.</span>`;

  if (topMistake !== "No Mistake") {
    message = `<span class="ai-warning">Your most repeated mistake is ${topMistake}. Focus on reducing this first.</span>`;
  }

  if (totalLoss > 0 && ruleBrokenLoss / totalLoss > 0.5) {
    message += `<br><br><span class="ai-warning">More than 50% of your loss is coming from rule broken trades.</span>`;
  }

  document.getElementById("aiPatternBox").innerHTML = message;
}




