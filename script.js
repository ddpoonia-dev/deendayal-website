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
    loginBtn.textContent = "Logout";

    loginBtn.onclick = async () => {
      await signOut(auth);

      trades = [];
      updateDashboard();
      renderTradeHistory();
      updateBestTradeShowcase();
      updateTradeReplay(null);
      updateEquityCurve();
      updateCalendarHeatmap();

      loginBtn.textContent = "Login";
      loginBtn.onclick = () => openLoginPopup();

      alert("Logged Out");
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

    loginBtn.textContent = "Login";
    loginBtn.onclick = () => openLoginPopup();
  }
});

  document.getElementById('year').textContent = new Date().getFullYear();

  const reveals = document.querySelectorAll('.reveal');
let trades = [];
let editingTradeId = null;

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
  gradeElement.innerText = "🏆 Elite Trader";
}

else if (traderScore >= 85) {
  gradeElement.innerText = "🔥 Professional Trader";
}

else if (traderScore >= 70) {
  gradeElement.innerText = "📈 Consistent Trader";
}

else if (traderScore >= 50) {
  gradeElement.innerText = "⚠️ Developing Trader";
}

else {
  gradeElement.innerText = "🚨 Undisciplined Trader";
}

  return score;
}

["planRating", "slRating", "emotionRating", "riskRating", "entryRating"].forEach((id) => {
  document.getElementById(id).addEventListener("change", calculateDisciplineScore);
});
  document.getElementById("tradeEntry")
?.addEventListener("input", calculateRR);

document.getElementById("tradeSl")
?.addEventListener("input", calculateRR);

document.getElementById("tradeTarget")
?.addEventListener("input", calculateRR);
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
function openTradeModal() {
  document.getElementById("tradeModal").style.display = "flex";
}

function closeTradeModal() {
  document.getElementById("tradeModal").style.display = "none";
}

window.openTradeModal = openTradeModal;
window.closeTradeModal = closeTradeModal;

async function saveTrade() {
 const saveBtn = document.getElementById("saveTradeBtn");

if (saveBtn.disabled) return;

saveBtn.disabled = true;
saveBtn.innerText = "Saving...";
  const entry = Number(document.getElementById("tradeEntry").value);
  const exit = Number(document.getElementById("tradeExit").value);
  const qty = Number(document.getElementById("tradeQty").value);
  const segment = document.getElementById("tradeSegment").value;
const lotSize = Number(document.getElementById("lotSize")?.value || document.getElementById("futureLotSize")?.value || 0);
const lots = Number(document.getElementById("lots")?.value || 1);
  const direction = document.getElementById("tradeDirection").value;

if (!entry || !exit || !qty || !direction) {
    alert("Please fill entry, exit, quantity and direction.");

    saveBtn.disabled = false;
    saveBtn.innerText = "Save Trade";

    return;
}

 let finalQty = qty;

if (segment === "Options" || segment === "Futures") {
  finalQty = lotSize * lots;
}

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
premium: document.getElementById("premium")?.value || "",
lotSize: document.getElementById("lotSize")?.value || "",
lots: document.getElementById("lots")?.value || "",
futureExpiry: document.getElementById("futureExpiry")?.value || "",
futureLotSize: document.getElementById("futureLotSize")?.value || "",
    direction: direction,
    entryReason: document.getElementById("entryReason").value,
    setup: document.getElementById("tradeSetup").value,
    mistake: document.getElementById("tradeMistake").value || "No Mistake",
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
 showProcessWarning(trade);
resetTradeForm();
document.getElementById("entryReason").value = "";

saveBtn.disabled = false;
saveBtn.innerText = "Save Trade";
}

function safeText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
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

  if (!trades.length) {
    box.innerHTML = `
      <h4>Psychology Verdict</h4>
      <p>No psychology data yet.</p>
    `;
    return;
  }

  const avgPlan = trades.reduce((s, t) => s + (Number(t.plan) || 0), 0) / trades.length;
  const avgSl = trades.reduce((s, t) => s + (Number(t.sl) || 0), 0) / trades.length;
  const avgEmotion = trades.reduce((s, t) => s + (Number(t.emotion) || 0), 0) / trades.length;
  const avgRisk = trades.reduce((s, t) => s + (Number(t.risk) || 0), 0) / trades.length;
  const avgEntry = trades.reduce((s, t) => s + (Number(t.entryRating) || 0), 0) / trades.length;

  const totalScore = avgPlan + avgSl + avgEmotion + avgRisk + avgEntry;
  const psychologyScore = Math.round(totalScore * 4);

  let verdict = "";
  let suggestion = "";

  if (psychologyScore >= 85) {
    verdict = "🔥 Strong Trading Psychology";
    suggestion = "Discipline strong hai. Ab size badhane se pehle consistency maintain karo.";
  } else if (psychologyScore >= 70) {
    verdict = "📈 Good, But Needs Control";
    suggestion = "Trading okay hai, lekin emotion aur execution ko aur tight karo.";
  } else if (psychologyScore >= 50) {
    verdict = "⚠️ Weak Psychology Zone";
    suggestion = "Abhi size small rakho. Rules aur emotions pe kaam karo.";
  } else {
    verdict = "🚨 Dangerous Trading Behaviour";
    suggestion = "Overtrading / emotion risk high hai. Capital protect karo, size reduce karo.";
  }

  box.innerHTML = `
    <h4>Psychology Verdict</h4>
    <p><strong>${verdict}</strong></p>
    <p>Overall Psychology Score: <strong>${psychologyScore}/100</strong></p>
    <p>Plan: ${avgPlan.toFixed(1)}/5 | SL: ${avgSl.toFixed(1)}/5 | Emotion: ${avgEmotion.toFixed(1)}/5</p>
    <p>Risk: ${avgRisk.toFixed(1)}/5 | Entry: ${avgEntry.toFixed(1)}/5</p>
    <p>${suggestion}</p>
  `;
}
function updateRuleBreakCostAnalyzer() {
  const followedTrades = trades.filter((trade) => trade.rules === true);
  const brokenTrades = trades.filter((trade) => trade.rules !== true);

  const followedPnl = followedTrades.reduce(
    (sum, trade) => sum + (Number(trade.pnl) || 0),
    0
  );

  const brokenPnl = brokenTrades.reduce(
    (sum, trade) => sum + (Number(trade.pnl) || 0),
    0
  );

  const ruleBreakCost = brokenPnl < 0 ? Math.abs(brokenPnl) : 0;

  const followedEl = document.getElementById("rulesFollowedPnl");
  const brokenEl = document.getElementById("rulesBrokenPnl");
  const costEl = document.getElementById("ruleBreakCost");
  const messageEl = document.getElementById("ruleBreakMessage");

  if (!followedEl || !brokenEl || !costEl || !messageEl) return;

  followedEl.innerText = "₹" + followedPnl.toFixed(2);
  brokenEl.innerText = "₹" + brokenPnl.toFixed(2);
  costEl.innerText = "₹" + ruleBreakCost.toFixed(2);

  followedEl.className = followedPnl >= 0 ? "profit" : "loss";
  brokenEl.className = brokenPnl >= 0 ? "profit" : "loss";
  costEl.className = ruleBreakCost > 0 ? "loss" : "profit";

  if (!trades.length) {
    messageEl.innerText = "Add trades to analyze rule discipline.";
    return;
  }

  if (brokenTrades.length === 0) {
    messageEl.innerText = "🔥 Great! No rule-breaking trades recorded yet.";
  } else if (brokenPnl < 0) {
    messageEl.innerText =
      `⚠️ Rules break karne se approx ₹${ruleBreakCost.toFixed(2)} ka damage hua. Focus: rule follow = capital protect.`;
  } else {
    messageEl.innerText =
      "✅ Rule-broken trades loss me nahi hain, but process risk still high hai. Discipline maintain rakho.";
  }
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
        ${setupName} — ₹${data.pnl.toFixed(2)} |
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
    `⚠️ Warning: ${worstSetup}
     is currently your worst setup
     (₹${lowestPnl.toFixed(2)})`;

}

else {

  worstSetupWarning.innerHTML =
    "✅ No losing setup detected yet.";
}
const bestTimeList = document.getElementById("bestTimeList");
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
        ${slot} — ₹${data.pnl.toFixed(2)}
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
    `⚠️ Warning: ${worstTime} is your weakest time slot (₹${worstTimePnl.toFixed(2)}).`;
} else {
  worstTimeWarning.innerHTML =
    "✅ No weak time slot detected yet.";
}
  document.getElementById("totalTrades").innerText = totalTrades;
  document.getElementById("totalPnl").innerText = totalPnl.toFixed(2);
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
    warningBox.innerText = "⚠️ Profit hua, lekin process weak tha. Aise trades repeat mat karo.";
    warningBox.className = "process-warning warning";
  }

  else if (tradeClass === "Losing Trade + Good Process") {
    warningBox.innerText = "✅ Loss hua, lekin process strong tha. Ye acceptable trading hai.";
    warningBox.className = "process-warning good";
  }

  else if (tradeClass === "Winning Trade + Good Process") {
    warningBox.innerText = "🔥 Excellent trade. Profit bhi aur process bhi strong.";
    warningBox.className = "process-warning good";
  }

  else {
    warningBox.innerText = "🚨 Loss bhi hua aur process bhi weak tha. Is trade ko deeply review karo.";
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
        🏆 Best Trade Ever
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
function updateTradeReplay(trade) {
  const replay = document.getElementById("tradeReplay");

  if (!trade) {
    replay.innerHTML = "<p class='empty-text'>Save a trade to view replay.</p>";
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
function renderTradeHistory() {
  const history = document.getElementById("tradeHistory");
  history.innerHTML = "";
const searchText = document.getElementById("tradeSearch").value.toLowerCase();
const directionValue = document.getElementById("directionFilter").value;
const resultValue = document.getElementById("resultFilter").value;

const filteredTrades = trades.filter((trade) => {
  const symbolMatch = (trade.symbol || "").toLowerCase().includes(searchText);
  const setupMatch = (trade.setup || "").toLowerCase().includes(searchText);

  const directionMatch =
    !directionValue || trade.direction === directionValue;

  const resultMatch =
    !resultValue ||
    (resultValue === "profit" && trade.pnl >= 0) ||
    (resultValue === "loss" && trade.pnl < 0);

  return (symbolMatch || setupMatch) && directionMatch && resultMatch;
});
filteredTrades.slice(0, 10).forEach((trade) => {
    const pnlClass = trade.pnl >= 0 ? "profit" : "loss";
    const tradeClass = classifyTrade(trade);

   history.innerHTML += `
  <div class="trade-row">

    <div>
      <strong>
        ${trade.symbol || "N/A"}
      </strong>

      <br>

      ${trade.segment || "N/A"} |
      ${trade.direction || "N/A"}
      <br>
    🕒 ${trade.time || "No Time"}

      <br>

      Setup:
      ${trade.setup || "No Setup"}
      <br>
Process:
${tradeClass}  
    </div>

    <div>
    <strong class="${pnlClass}">
        ₹${trade.pnl.toFixed(2)}
    </strong>

    <br><br>
<button
    onclick="editTrade('${trade.id}')"
    style="
        background:#008cff;
        color:white;
        border:none;
        padding:4px 8px;
        border-radius:4px;
        cursor:pointer;
        margin-bottom:5px;
    ">
    ✏️ Edit
</button>

<br>
    <button
        onclick="deleteTrade('${trade.id}')"
        style="
            background:#ff4444;
            color:white;
            border:none;
            padding:4px 8px;
            border-radius:4px;
            cursor:pointer;
        ">
        🗑 Delete
    </button>
</div>

    <div>

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
  });
}
document.getElementById("tradeSearch").addEventListener("input", renderTradeHistory);

document.getElementById("directionFilter").addEventListener("change", renderTradeHistory);

document.getElementById("resultFilter").addEventListener("change", renderTradeHistory);
function exportTradesCSV() {

  if (!trades.length) {
    alert("No trades found");
    return;
  }

  let csv = "Date,Time,Symbol,Segment,Direction,Entry,Exit,Quantity,Setup,Entry Reason,Mistake,Rules Followed,Trader Score,Trade Quality,PNL,Note\n";

  trades.forEach((trade) => {
csv +=
  `${trade.date || ""},` +
  `${trade.time || ""},` +
  `${trade.symbol || ""},` +
  `${trade.segment || ""},` +
  `${trade.direction || ""},` +
  `${trade.entry || ""},` +
  `${trade.exit || ""},` +
  `${trade.qty || ""},` +
  `${trade.setup || ""},` +
  `${trade.entryReason || ""},` +
  `${trade.mistake || ""},` +
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
    document.getElementById("tradeExit").value = trade.exit || "";
    document.getElementById("tradeQty").value = trade.qty || "";
    document.getElementById("entryReason").value = trade.entryReason || "";
    document.getElementById("tradeSetup").value = trade.setup || "";
    document.getElementById("tradeMistake").value = trade.mistake || "";
    document.getElementById("rulesFollowed").checked = trade.rules || false;
    document.getElementById("planRating").value = trade.plan || "0";
    document.getElementById("slRating").value = trade.sl || "0";
    document.getElementById("emotionRating").value = trade.emotion || "0";
    document.getElementById("riskRating").value = trade.risk || "0";
    document.getElementById("entryRating").value = trade.entryRating || "0";
    document.getElementById("tradeQuality").value = trade.tradeQuality || "";
    document.getElementById("psychologyNote").value = trade.note || "";

    calculateDisciplineScore();

    document.getElementById("journal").scrollIntoView({
        behavior: "smooth"
    });

    alert("Trade loaded for editing. Update details and click Save Trade.");
}
function resetTradeForm() {
  document.getElementById("tradeDate").value = "";
  document.getElementById("tradeSymbol").value = "";
  document.getElementById("tradeDirection").value = "";
  document.getElementById("tradeEntry").value = "";
  document.getElementById("tradeExit").value = "";
  document.getElementById("tradeQty").value = "";
  document.getElementById("tradeSetup").value = "";
  document.getElementById("tradeMistake").value = "";
  document.getElementById("rulesFollowed").checked = false;
document.getElementById("planRating").value = "0";
document.getElementById("slRating").value = "0";
document.getElementById("emotionRating").value = "0";
document.getElementById("riskRating").value = "0";
document.getElementById("entryRating").value = "0";
document.getElementById("tradeQuality").value = "";
  document.getElementById("psychologyNote").value = "";
  document.getElementById("tradeTime").value = "";
document.getElementById("entryReason").value = "";
document.getElementById("beforeScreenshot").value = "";
document.getElementById("afterScreenshot").value = "";

editingTradeId = null;
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
    document.getElementById("loginPopup").style.display = "flex";
  }

  function closeLoginPopup() {
    document.getElementById("loginPopup").style.display = "none";
  }

  window.addEventListener('scroll', revealSections);
  revealSections();
window.saveTrade = saveTrade;
window.toggleOptionFields = toggleOptionFields;
window.toggleAdvancedAnalytics = toggleAdvancedAnalytics;
window.exportTradesCSV = exportTradesCSV;
window.deleteTrade = deleteTrade;
window.editTrade = editTrade;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.openLoginPopup = openLoginPopup;
window.closeLoginPopup = closeLoginPopup;
