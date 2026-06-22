// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  setDoc
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
const INR = "\u20B9";

// Global access
window.auth = auth;
window.db = db;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.getDoc = getDoc;
window.query = query;
window.orderBy = orderBy;
window.collection = collection;
window.serverTimestamp = serverTimestamp;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.deleteDoc = deleteDoc;
window.doc = doc;
window.updateDoc = updateDoc;
window.setDoc = setDoc;

console.log("Firebase Connected Successfully");
let currentUserProfile = null;
let blogPosts = [];
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
    updateAccountBadge(user);
    updateMonthlyTargetWidget();

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

function getNameFromEmail(email = "") {
  const namePart = email.split("@")[0] || "Trader";
  return namePart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function csvToArray(value = "") {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function profileValue(key, fallback = "") {
  return currentUserProfile?.[key] || fallback;
}

function numberFromCurrency(value) {
  return Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;
}

function getProfileCacheKey(user) {
  return user?.uid ? `rampathProfile:${user.uid}` : "";
}

function getCachedUserProfile(user) {
  const cacheKey = getProfileCacheKey(user);
  if (!cacheKey) return {};

  try {
    return JSON.parse(localStorage.getItem(cacheKey) || "{}") || {};
  } catch (error) {
    console.warn("Profile cache read error:", error);
    return {};
  }
}

function cacheUserProfile(user, profile = {}) {
  const cacheKey = getProfileCacheKey(user);
  if (!cacheKey) return {};

  const safeProfile = {
    ...getCachedUserProfile(user),
    ...profile
  };

  delete safeProfile.createdAt;
  delete safeProfile.updatedAt;

  try {
    localStorage.setItem(cacheKey, JSON.stringify(safeProfile));
  } catch (error) {
    console.warn("Profile cache save error:", error);
  }

  return safeProfile;
}

function selected(value, expected) {
  return value === expected ? "selected" : "";
}

async function loadUserProfile(user) {
  if (!user) return null;

  const cachedProfile = getCachedUserProfile(user);

  try {
    const profileRef = doc(db, "users", user.uid);
    const profileSnap = await getDoc(profileRef);
    const fallbackName = getNameFromEmail(user.email || "");
    const profile = profileSnap.exists()
      ? profileSnap.data()
      : {};
    const mergedProfile = {
      ...cachedProfile,
      ...profile
    };

    currentUserProfile = {
      ...mergedProfile,
      name: mergedProfile.name || fallbackName,
      displayName: mergedProfile.displayName || mergedProfile.name || fallbackName,
      email: mergedProfile.email || user.email || "",
      createdAt: mergedProfile.createdAt || null
    };

    cacheUserProfile(user, currentUserProfile);

    if (!profileSnap.exists()) {
      try {
        await setDoc(profileRef, {
          ...currentUserProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (saveError) {
        console.error("Initial profile save error:", saveError);
      }
    }

    return currentUserProfile;
  } catch (error) {
    console.error("Profile load error:", error);
    currentUserProfile = {
      ...cachedProfile,
      name: cachedProfile.name || getNameFromEmail(user.email || ""),
      displayName: cachedProfile.displayName || cachedProfile.name || getNameFromEmail(user.email || ""),
      email: cachedProfile.email || user.email || ""
    };
    return currentUserProfile;
  }
}

async function saveUserProfileData(user, profileData = {}) {
  if (!user) return null;

  const cleanName = (profileData.name || profileData.displayName || "").trim();
  const profile = {
    ...profileData,
    name: cleanName || getNameFromEmail(user.email || ""),
    displayName: (profileData.displayName || cleanName || getNameFromEmail(user.email || "")).trim(),
    email: (profileData.email || user.email || "").trim(),
    authEmail: user.email || "",
    updatedAt: serverTimestamp()
  };

  currentUserProfile = {
    ...(currentUserProfile || {}),
    ...profile
  };

  cacheUserProfile(user, currentUserProfile);

  try {
    await setDoc(doc(db, "users", user.uid), profile, { merge: true });
  } catch (error) {
    console.error("Profile save error:", error);
  }

  return currentUserProfile;
}

async function saveUserProfile(user, name) {
  if (!user || !name) return null;
  return saveUserProfileData(user, { name, displayName: name, email: user.email || "" });
}

function getTraderBadge() {
  const totalTrades = trades.length;
  if (!totalTrades) {
    return {
      title: "New Journaler",
      level: "Starter",
      score: 0,
      detail: "Add trades to unlock your psychology badge."
    };
  }

  const avgDiscipline =
    trades.reduce((sum, trade) => sum + Number(trade.disciplineScore || 0), 0) / totalTrades;
  const ruleRate =
    (trades.filter((trade) => trade.rules === true || trade.rules === "Yes" || trade.rules === "Followed").length / totalTrades) * 100;
  const cleanRate =
    (trades.filter((trade) => !trade.mistake || trade.mistake === "No Mistake").length / totalTrades) * 100;
  const disciplineBase = avgDiscipline > 5 ? 25 : 5;
  const psychologyScore = Math.max(
    0,
    Math.min(100, Math.round((avgDiscipline / disciplineBase) * 55 + ruleRate * 0.3 + cleanRate * 0.15))
  );

  if (psychologyScore >= 85) {
    return { title: "Elite Discipline Trader", level: "Elite", score: psychologyScore, detail: "Strong psychology, rule control, and clean execution." };
  }
  if (psychologyScore >= 70) {
    return { title: "Consistent Process Trader", level: "Pro", score: psychologyScore, detail: "Good process. Keep reducing repeat mistakes." };
  }
  if (psychologyScore >= 50) {
    return { title: "Developing Trader", level: "Builder", score: psychologyScore, detail: "Your journal shows progress, but discipline still needs work." };
  }
  return { title: "Discipline Under Training", level: "Focus", score: psychologyScore, detail: "Focus on rules, mistakes, and emotional control first." };
}

function updateAccountBadge(user) {
  const accountBadge = document.getElementById("accountBadge");

  if (!user) {
    if (accountBadge) {
      accountBadge.textContent = "Guest";
      accountBadge.title = "Login to view profile";
      accountBadge.classList.remove("active");
      accountBadge.onclick = null;
    }
    updateProfileMenu(null);
    return;
  }

  const displayName = currentUserProfile?.name || getNameFromEmail(user.email || "");
  const badge = getTraderBadge();
  if (accountBadge) {
    accountBadge.textContent = displayName;
    accountBadge.title = `${badge.title} - click to view profile`;
    accountBadge.classList.add("active");
    accountBadge.onclick = openProfileModal;
  }
  updateProfileMenu(user);
}

function updateProfileMenu(user) {
  const avatar = document.getElementById("appProfileAvatar");
  const name = document.getElementById("profileMenuName");
  const email = document.getElementById("profileMenuEmail");
  const displayName = user
    ? currentUserProfile?.displayName || currentUserProfile?.name || getNameFromEmail(user.email || "")
    : "Guest";

  if (avatar) avatar.textContent = displayName.slice(0, 1).toUpperCase();
  if (name) name.textContent = displayName;
  if (email) email.textContent = user?.email || "Login required";
}

function toggleProfileMenu(forceOpen) {
  const menu = document.getElementById("profileMenu");
  if (!menu) return;
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !menu.classList.contains("active");
  menu.classList.toggle("active", shouldOpen);
}

function toggleCustomizePanel(forceOpen) {
  const panel = document.getElementById("customizePanel");
  if (!panel) return;
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !panel.classList.contains("active");
  panel.classList.toggle("active", shouldOpen);
}

function applyDashboardLayout() {
  const layout = localStorage.getItem("rampathDashboardLayout") || "default";
  document.body.classList.remove("layout-compact", "layout-wide-calendar");
  if (layout === "compact") document.body.classList.add("layout-compact");
  if (layout === "wide-calendar") document.body.classList.add("layout-wide-calendar");
}

function setDashboardLayout(layout = "default") {
  localStorage.setItem("rampathDashboardLayout", layout);
  applyDashboardLayout();
  toggleCustomizePanel(false);
}

function updateHeroAccountButton(user) {
  const button = document.getElementById("heroAccountBtn");
  const openButton = document.getElementById("heroOpenJournalBtn");

  if (openButton) {
    if (user) {
      openButton.textContent = "Open Dashboard";
      openButton.onclick = () => openJournalGate("dashboard");
      openButton.setAttribute("aria-label", "Open your journal dashboard");
    } else {
      openButton.textContent = "Open Journal";
      openButton.onclick = () => openJournalGate("dashboard");
      openButton.setAttribute("aria-label", "Preview the journal dashboard");
    }
  }

  if (!button) return;

  if (user) {
    button.textContent = "View Profile";
    button.onclick = openProfileModal;
    button.setAttribute("aria-label", "View your trader profile");
  } else {
    button.textContent = "Login / Create Account";
    button.onclick = openLoginPopup;
    button.setAttribute("aria-label", "Login or create account");
  }
}

function updateFloatingAuthButton(user = auth.currentUser) {
  const button = document.getElementById("floatingAuthBtn");
  if (!button) return;

  const shouldShow = !user && window.scrollY > 260;
  button.classList.toggle("visible", shouldShow);
}

function openJournalGate(target = "dashboard") {
  const user = auth.currentUser;

  if (!user) {
    if (target === "dashboard" || target === "trades" || target === "analytics") {
      document.getElementById("guestPreview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    openLoginPopup();

    if (target === "start") {
      setAuthMode("create");
      setLoginStatus("Create your account to unlock the full journal dashboard.", "info");
      return;
    }

    setLoginStatus("Login or create account to unlock this journal section.", "info");
    return;
  }

  const targetMap = {
    start: "journal",
    dashboard: "journal",
    trades: "tradeHistory",
    analytics: "advancedAnalyticsWidget"
  };

  const sectionId = targetMap[target] || "journal";
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setAppMode(user) {
  document.body.classList.toggle("app-mode", Boolean(user));
  updateFloatingAuthButton(user);
  if (user && location.hash === "#home") {
    history.replaceState(null, "", "#journal");
  }
}

async function logoutCurrentUser() {
  const loginBtn = document.querySelector(".login-link");
  if (loginBtn) loginBtn.textContent = "Logging out...";

  pendingTradeModalAfterLogin = false;
  currentUserProfile = null;
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

  if (loginBtn) {
    loginBtn.textContent = "Login";
    loginBtn.title = "";
    loginBtn.onclick = () => openLoginPopup();
  }

  updateAccountBadge(null);
  updateHeroAccountButton(null);
  updateMonthlyTargetWidget();
  setAppMode(null);
  setLoginStatus("Logged out successfully.", "success");
}

function getCurrentMonthPnl() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return trades.reduce((sum, trade) => {
    const tradeDate = getDateFromDateKey(getTradeDateKey(trade));
    if (!tradeDate) return sum;
    if (tradeDate.getMonth() !== month || tradeDate.getFullYear() !== year) return sum;
    return sum + getTradePnl(trade);
  }, 0);
}

function updateMonthlyTargetWidget() {
  const widget = document.getElementById("monthlyTargetWidget");
  if (!widget) return;

  const title = document.getElementById("monthlyTargetTitle");
  const meta = document.getElementById("monthlyTargetMeta");
  const bar = document.getElementById("monthlyTargetBar");
  const inputBox = document.getElementById("monthlyTargetInputBox");
  const quickInput = document.getElementById("quickMonthlyTarget");
  const user = auth.currentUser;
  const target = numberFromCurrency(currentUserProfile?.monthlyProfitTarget);
  const monthPnl = getCurrentMonthPnl();

  widget.classList.toggle("target-missing", !target);
  widget.classList.toggle("target-complete", target > 0 && monthPnl >= target);

  if (!user) {
    title.textContent = "Login to set monthly target";
    meta.textContent = "Your monthly target is saved inside your profile.";
    inputBox.style.display = "none";
    bar.style.width = "0%";
    return;
  }

  if (!target) {
    title.textContent = "Set your monthly profit target";
    meta.textContent = "Target missing. Add it here or from Edit Profile.";
    inputBox.style.display = "grid";
    if (quickInput) quickInput.value = "";
    bar.style.width = "0%";
    return;
  }

  const progress = Math.max(0, Math.min(100, Math.round((monthPnl / target) * 100)));
  title.textContent = `${progress}% completed`;
  meta.textContent = `${money(monthPnl)} achieved out of ${money(target)} this month`;
  inputBox.style.display = "none";
  bar.style.width = `${progress}%`;
}

async function saveQuickMonthlyTarget() {
  const user = auth.currentUser;
  const input = document.getElementById("quickMonthlyTarget");
  if (!user) {
    openLoginPopup();
    setLoginStatus("Login first to save your monthly target.", "info");
    return;
  }

  const target = numberFromCurrency(input?.value);
  if (!target || target <= 0) {
    input?.focus();
    return;
  }

  await saveUserProfileData(user, {
    ...(currentUserProfile || {}),
    monthlyProfitTarget: String(target)
  });
  updateMonthlyTargetWidget();
  updateAccountBadge(user);
}

function setBlogStatus(message = "", type = "") {
  const status = document.getElementById("blogStatus");
  if (!status) return;

  status.textContent = message;
  status.className = type;
}

function formatBlogDate(value) {
  const rawDate = value?.toDate?.() || value;
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Draft";
  return formatDisplayDate(date);
}

function renderBlogPosts() {
  const list = document.getElementById("blogList");
  if (!list) return;

  if (!auth.currentUser) {
    list.innerHTML = `<p class="empty-text">Login to save blog posts.</p>`;
    return;
  }

  if (!blogPosts.length) {
    list.innerHTML = `<p class="empty-text">No blog posts yet.</p>`;
    return;
  }

  list.innerHTML = blogPosts.map((post) => {
    const content = escapeHtml(post.content || "").replace(/\n/g, "<br>");
    return `
      <article class="blog-post">
        <div>
          <span>${escapeHtml(post.category || "General")}</span>
          <small>${formatBlogDate(post.createdAt)}</small>
        </div>
        <h4>${escapeHtml(post.title || "Untitled")}</h4>
        ${post.source ? `<em>${escapeHtml(post.source)}</em>` : ""}
        <p>${content}</p>
        <button type="button" onclick="deleteBlogPost('${post.id}')">Delete</button>
      </article>
    `;
  }).join("");
}

async function loadBlogPostsFromFirebase() {
  const user = auth.currentUser;
  if (!user) {
    blogPosts = [];
    renderBlogPosts();
    return;
  }

  try {
    const blogsRef = collection(db, "users", user.uid, "blogs");
    const q = query(blogsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    blogPosts = [];
    snapshot.forEach((postDoc) => {
      blogPosts.push({
        id: postDoc.id,
        ...postDoc.data()
      });
    });

    renderBlogPosts();
  } catch (error) {
    console.error("Blog load error:", error);
    setBlogStatus("Could not load blog posts.", "error");
  }
}

async function saveBlogPost(event) {
  event.preventDefault();
  const user = auth.currentUser;

  if (!user) {
    openLoginPopup();
    setBlogStatus("Login first to save blog posts.", "error");
    return;
  }

  const title = document.getElementById("blogTitle")?.value.trim();
  const category = document.getElementById("blogCategory")?.value || "General";
  const source = document.getElementById("blogSource")?.value.trim();
  const content = document.getElementById("blogContent")?.value.trim();

  if (!title || !content) {
    setBlogStatus("Title and content are required.", "error");
    return;
  }

  try {
    setBlogStatus("Saving...", "info");
    await addDoc(collection(db, "users", user.uid, "blogs"), {
      title,
      category,
      source,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    clearBlogForm();
    setBlogStatus("Blog saved.", "success");
    await loadBlogPostsFromFirebase();
  } catch (error) {
    console.error("Blog save error:", error);
    setBlogStatus("Could not save blog post.", "error");
  }
}

async function deleteBlogPost(postId) {
  const user = auth.currentUser;
  if (!user || !postId) return;

  try {
    await deleteDoc(doc(db, "users", user.uid, "blogs", postId));
    setBlogStatus("Blog deleted.", "success");
    await loadBlogPostsFromFirebase();
  } catch (error) {
    console.error("Blog delete error:", error);
    setBlogStatus("Could not delete blog post.", "error");
  }
}

function clearBlogForm() {
  document.getElementById("blogForm")?.reset();
}

function renderProfileView() {
  const user = auth.currentUser;
  const content = document.getElementById("profileContent");
  if (!user || !content) return;

  const profile = currentUserProfile || {
    name: getNameFromEmail(user.email || ""),
    email: user.email || ""
  };
  const badge = getTraderBadge();
  const pnl = trades.reduce((sum, trade) => sum + getTradePnl(trade), 0);
  const winners = trades.filter((trade) => getTradePnl(trade) > 0).length;
  const winRate = trades.length ? Math.round((winners / trades.length) * 100) : 0;
  const avatar = profile.photoUrl
    ? `<img src="${escapeHtml(profile.photoUrl)}" alt="${escapeHtml(profile.displayName || profile.name || "Trader")}">`
    : escapeHtml((profile.displayName || profile.name || "T").slice(0, 1).toUpperCase());
  const profileChips = [
    profile.experience,
    profile.tradingStyle,
    profile.preferredTimeframe,
    profile.country
  ].filter(Boolean);

  content.innerHTML = `
    <div class="profile-head">
      <div class="profile-avatar">${avatar}</div>
      <div>
        <span>Trader Profile</span>
        <h2>${escapeHtml(profile.displayName || profile.name || "Trader")}</h2>
        <p>${escapeHtml(profile.email || user.email || "")}${profile.mobile ? ` | ${escapeHtml(profile.mobile)}` : ""}</p>
      </div>
    </div>
    <div class="profile-actions">
      <button type="button" onclick="renderProfileEdit()">Edit Profile</button>
    </div>
    <div class="trader-badge-card">
      <span>${badge.level} Badge</span>
      <strong>${badge.title}</strong>
      <p>${badge.detail}</p>
      <div class="badge-meter"><i style="width:${Math.min(100, badge.score)}%"></i></div>
      <small>Psychology Score: ${badge.score}/100</small>
    </div>
    <div class="profile-stats">
      <div><span>Total Trades</span><strong>${trades.length}</strong></div>
      <div><span>Win Rate</span><strong>${winRate}%</strong></div>
      <div><span>Total P&L</span><strong>${money(pnl)}</strong></div>
    </div>
    ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ""}
    ${profileChips.length ? `<div class="profile-chip-row">${profileChips.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
    <div class="profile-detail-grid">
      <div><span>Markets</span><strong>${escapeHtml(csvToArray(profile.markets).join(", ") || "Not set")}</strong></div>
      <div><span>Strategy</span><strong>${escapeHtml(profile.mainStrategy || "Not set")}</strong></div>
      <div><span>Monthly Target</span><strong>${escapeHtml(profile.monthlyProfitTarget || "Not set")}</strong></div>
      <div><span>Risk / Trade</span><strong>${escapeHtml(profile.riskPerTrade || "Not set")}</strong></div>
    </div>
    <p class="profile-note">Badge is calculated from your journal discipline score, rules followed, and mistake tracking.</p>
  `;
}

function options(items, currentValue = "") {
  return items.map((item) => `<option value="${escapeHtml(item)}" ${selected(currentValue, item)}>${escapeHtml(item)}</option>`).join("");
}

function multiOptions(items, selectedItems = []) {
  const values = Array.isArray(selectedItems) ? selectedItems : csvToArray(selectedItems);
  return items.map((item) => `<option value="${escapeHtml(item)}" ${values.includes(item) ? "selected" : ""}>${escapeHtml(item)}</option>`).join("");
}

function renderProfileEdit() {
  const user = auth.currentUser;
  const content = document.getElementById("profileContent");
  if (!user || !content) return;

  const p = currentUserProfile || {};
  content.innerHTML = `
    <div class="profile-edit-head">
      <div>
        <span>Profile Settings</span>
        <h2>Edit Trader Profile</h2>
        <p>Fill what matters. You can update this anytime.</p>
      </div>
      <button type="button" onclick="renderProfileView()">View Profile</button>
    </div>

    <form id="profileEditForm" class="profile-edit-form" onsubmit="saveProfileDetails(event)">
      <section>
        <h3>Basic Info</h3>
        <div class="profile-form-grid">
          <label>Display Name / Nickname<input name="displayName" value="${escapeHtml(p.displayName || p.name || "")}" required></label>
          <label>Email<input name="email" type="email" value="${escapeHtml(p.email || user.email || "")}"></label>
          <label>Mobile No.<input name="mobile" value="${escapeHtml(p.mobile || "")}"></label>
          <label>Country<input name="country" value="${escapeHtml(p.country || "")}"></label>
          <label>Time Zone<input name="timeZone" value="${escapeHtml(p.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "")}"></label>
          <label>Profile Photo URL<input name="photoUrl" value="${escapeHtml(p.photoUrl || "")}" placeholder="https://..."></label>
        </div>
        <label>Bio<textarea name="bio" rows="3" placeholder="2-3 lines about your trading journey">${escapeHtml(p.bio || "")}</textarea></label>
      </section>

      <section>
        <h3>Trading Background</h3>
        <div class="profile-form-grid">
          <label>Trading Experience<select name="experience">${options(["Beginner", "Intermediate", "Advanced"], p.experience)}</select></label>
          <label>Market<select name="markets" multiple>${multiOptions(["Stocks", "Options", "Futures", "Forex", "Crypto", "Commodities"], p.markets)}</select></label>
          <label>Trading Style<select name="tradingStyle">${options(["Scalping", "Intraday", "Swing", "Positional"], p.tradingStyle)}</select></label>
          <label>Preferred Timeframe<input name="preferredTimeframe" value="${escapeHtml(p.preferredTimeframe || "")}" placeholder="1m, 5m, 15m, 1h, Daily"></label>
        </div>
      </section>

      <section>
        <h3>Trading Goals</h3>
        <div class="profile-form-grid">
          <label>Monthly Profit Target<input name="monthlyProfitTarget" value="${escapeHtml(p.monthlyProfitTarget || "")}"></label>
          <label>Risk Per Trade (%)<input name="riskPerTrade" value="${escapeHtml(p.riskPerTrade || "")}"></label>
          <label>Maximum Daily Loss Limit<input name="maxDailyLoss" value="${escapeHtml(p.maxDailyLoss || "")}"></label>
          <label>Annual Goal<input name="annualGoal" value="${escapeHtml(p.annualGoal || "")}"></label>
          <label>Current Account Size<input name="accountSize" value="${escapeHtml(p.accountSize || "")}"></label>
        </div>
      </section>

      <section>
        <h3>Strategy Information</h3>
        <div class="profile-form-grid">
          <label>Main Strategy Name<input name="mainStrategy" value="${escapeHtml(p.mainStrategy || "")}"></label>
          <label>Setup Tags<input name="setupTags" value="${escapeHtml(csvToArray(p.setupTags).join(", "))}" placeholder="Breakout, Reversal"></label>
          <label>Favorite Indicators<input name="favoriteIndicators" value="${escapeHtml(csvToArray(p.favoriteIndicators).join(", "))}" placeholder="VWAP, EMA, RSI"></label>
          <label>Watchlist Symbols<input name="watchlistSymbols" value="${escapeHtml(csvToArray(p.watchlistSymbols).join(", "))}" placeholder="NIFTY, BANKNIFTY, SBIN"></label>
        </div>
      </section>

      <section>
        <h3>Psychology & Habits</h3>
        <div class="profile-form-grid">
          <label>Biggest Strength<input name="biggestStrength" value="${escapeHtml(p.biggestStrength || "")}"></label>
          <label>Biggest Weakness<input name="biggestWeakness" value="${escapeHtml(p.biggestWeakness || "")}"></label>
        </div>
        <label>Common Trading Mistakes<textarea name="commonMistakes" rows="3" placeholder="Overtrading, FOMO, revenge trading">${escapeHtml(csvToArray(p.commonMistakes).join(", "))}</textarea></label>
        <label>Trading Rules<textarea name="tradingRules" rows="4" placeholder="Write your personal trading rules">${escapeHtml(p.tradingRules || "")}</textarea></label>
      </section>

      <div class="profile-form-actions">
        <button type="button" onclick="renderProfileView()">Cancel</button>
        <button type="submit" id="saveProfileBtn">Save Profile</button>
      </div>
      <p id="profileSaveStatus" class="profile-save-status"></p>
    </form>
  `;
}

async function saveProfileDetails(event) {
  event.preventDefault();
  const user = auth.currentUser;
  const form = document.getElementById("profileEditForm");
  const status = document.getElementById("profileSaveStatus");
  const button = document.getElementById("saveProfileBtn");
  if (!user || !form) return;

  const data = new FormData(form);
  const profileData = {
    name: data.get("displayName")?.trim(),
    displayName: data.get("displayName")?.trim(),
    email: data.get("email")?.trim(),
    mobile: data.get("mobile")?.trim(),
    country: data.get("country")?.trim(),
    timeZone: data.get("timeZone")?.trim(),
    photoUrl: data.get("photoUrl")?.trim(),
    bio: data.get("bio")?.trim(),
    experience: data.get("experience"),
    markets: data.getAll("markets"),
    tradingStyle: data.get("tradingStyle"),
    preferredTimeframe: data.get("preferredTimeframe")?.trim(),
    monthlyProfitTarget: data.get("monthlyProfitTarget")?.trim(),
    riskPerTrade: data.get("riskPerTrade")?.trim(),
    maxDailyLoss: data.get("maxDailyLoss")?.trim(),
    annualGoal: data.get("annualGoal")?.trim(),
    accountSize: data.get("accountSize")?.trim(),
    mainStrategy: data.get("mainStrategy")?.trim(),
    setupTags: csvToArray(data.get("setupTags")),
    favoriteIndicators: csvToArray(data.get("favoriteIndicators")),
    watchlistSymbols: csvToArray(data.get("watchlistSymbols")),
    biggestStrength: data.get("biggestStrength")?.trim(),
    biggestWeakness: data.get("biggestWeakness")?.trim(),
    commonMistakes: csvToArray(data.get("commonMistakes")),
    tradingRules: data.get("tradingRules")?.trim()
  };

  if (!profileData.displayName) {
    status.textContent = "Display name is required.";
    status.className = "profile-save-status error";
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Saving...";
    }
    await saveUserProfileData(user, profileData);
    updateAccountBadge(user);
    updateHeroAccountButton(user);
    updateMonthlyTargetWidget();
    renderProfileView();
  } catch (error) {
    status.textContent = error.message || "Could not save profile.";
    status.className = "profile-save-status error";
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Save Profile";
    }
  }
}

function openProfileModal() {
  const user = auth.currentUser;
  const modal = document.getElementById("profileModal");
  if (!modal) return;

  if (!user) {
    openLoginPopup();
    return;
  }

  renderProfileView();

  modal.style.display = "flex";
}

function closeProfileModal() {
  document.getElementById("profileModal").style.display = "none";
}

function setAuthLoading(isLoading, label = "Please wait...") {
  const loginBtn = document.getElementById("loginSubmitBtn");
  const registerBtn = document.getElementById("registerSubmitBtn");
  const forgotBtn = document.getElementById("forgotPasswordBtn");

  [loginBtn, registerBtn, forgotBtn].forEach((button) => {
    if (!button) return;
    button.disabled = isLoading;
  });

  if (loginBtn) {
    loginBtn.textContent = isLoading ? label : "Login";
  }
}

function getLoginCredentials() {
  const name = document.getElementById("loginName")?.value.trim() || "";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const isCreateMode = document.getElementById("authCreateTab")?.classList.contains("active");

  if (isCreateMode && !name) {
    setLoginStatus("Enter your name to create your journal account.", "error");
    document.getElementById("loginName")?.focus();
    return null;
  }

  if (!email || !password) {
    setLoginStatus("Enter your email and password.", "error");
    return null;
  }

  return { name, email, password };
}

function getLoginEmail() {
  const email = document.getElementById("loginEmail").value.trim();

  if (!email) {
    setLoginStatus("Enter your email to reset your password.", "error");
    document.getElementById("loginEmail")?.focus();
    return null;
  }

  return email;
}

function toggleLoginPassword() {
  const input = document.getElementById("loginPassword");
  const btn = document.querySelector(".password-row button");
  if (!input) return;

  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  if (btn) btn.textContent = showing ? "Show" : "Hide";
}

function toggleMobileMenu(forceClose = false) {
  const menu = document.getElementById("navMenu");
  const button = document.querySelector(".menu-toggle");
  if (!menu || !button) return;

  const shouldOpen = forceClose ? false : !menu.classList.contains("active");
  menu.classList.toggle("active", shouldOpen);
  button.classList.toggle("active", shouldOpen);
  button.setAttribute("aria-expanded", String(shouldOpen));
}

document.addEventListener("click", (event) => {
  const menu = document.getElementById("navMenu");
  const button = document.querySelector(".menu-toggle");
  if (!menu || !button || !menu.classList.contains("active")) return;

  if (!menu.contains(event.target) && !button.contains(event.target)) {
    toggleMobileMenu(true);
  }
});

document.querySelectorAll("#navMenu a").forEach((link) => {
  link.addEventListener("click", () => toggleMobileMenu(true));
});

document.addEventListener("click", (event) => {
  const profileMenu = document.getElementById("profileMenu");
  const profilePill = document.querySelector(".profile-pill");
  const customizePanel = document.getElementById("customizePanel");
  const customizeBtn = document.querySelector(".customize-btn");

  if (
    profileMenu?.classList.contains("active") &&
    !profileMenu.contains(event.target) &&
    !profilePill?.contains(event.target)
  ) {
    toggleProfileMenu(false);
  }

  if (
    customizePanel?.classList.contains("active") &&
    !customizePanel.contains(event.target) &&
    !customizeBtn?.contains(event.target)
  ) {
    toggleCustomizePanel(false);
  }
});

applyDashboardLayout();

function setAuthMode(mode = "login") {
  const isCreate = mode === "create";
  const title = document.getElementById("authTitle");
  const subtitle = document.getElementById("authSubtitle");
  const loginTab = document.getElementById("authLoginTab");
  const createTab = document.getElementById("authCreateTab");
  const loginBtn = document.getElementById("loginSubmitBtn");
  const createBtn = document.getElementById("registerSubmitBtn");
  const password = document.getElementById("loginPassword");
  const nameInput = document.getElementById("loginName");
  const loginBox = document.querySelector(".login-box");

  title && (title.textContent = isCreate ? "Create Your Journal" : "Welcome Back");
  subtitle && (subtitle.textContent = isCreate
    ? "Start a private RamPath account to save and review every trade."
    : "Login with your email and password to open your trading journal.");

  loginTab?.classList.toggle("active", !isCreate);
  createTab?.classList.toggle("active", isCreate);
  loginBtn?.classList.toggle("muted-action", isCreate);
  createBtn?.classList.toggle("primary-create", isCreate);
  loginBox?.classList.toggle("login-mode", !isCreate);
  loginBox?.classList.toggle("create-mode", isCreate);

  if (password) {
    password.autocomplete = isCreate ? "new-password" : "current-password";
  }

  if (nameInput) {
    nameInput.required = isCreate;
    nameInput.disabled = !isCreate;
    nameInput.placeholder = "Your trading name";
    if (!isCreate) nameInput.value = "";
  }
}

window.forgotPassword = async function () {
  const email = getLoginEmail();
  if (!email) return;

  try {
    setAuthLoading(true, "Sending...");
    setLoginStatus("Sending password reset link...", "info");
    await sendPasswordResetEmail(auth, email);
    setLoginStatus("Password reset link sent. Please check your inbox or spam folder.", "success");
  } catch (error) {
    setLoginStatus(error.message, "error");
  } finally {
    setAuthLoading(false);
  }
};

window.registerUser = async function () {
  const credentials = getLoginCredentials();
  if (!credentials) return;

  try {
    setAuthLoading(true, "Creating...");
    setLoginStatus("Creating your journal account...", "info");
    const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    await saveUserProfile(userCredential.user, credentials.name);
    setAppMode(userCredential.user);
    updateAccountBadge(userCredential.user);
    updateHeroAccountButton(userCredential.user);
    updateMonthlyTargetWidget();
    await loadBlogPostsFromFirebase();
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
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    await loadUserProfile(userCredential.user);

await loadTradesFromFirebase();
await loadBlogPostsFromFirebase();
updateAccountBadge(userCredential.user);
updateHeroAccountButton(userCredential.user);
updateMonthlyTargetWidget();
setAppMode(userCredential.user);

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
    await loadUserProfile(user);
    setAppMode(user);
    loginBtn.textContent = "Logout";
    loginBtn.title = user.email || "Logged in";
    updateAccountBadge(user);
    updateHeroAccountButton(user);
    updateMonthlyTargetWidget();
    updateFloatingAuthButton(user);

    loginBtn.onclick = logoutCurrentUser;

    await loadTradesFromFirebase();
    await loadBlogPostsFromFirebase();
    updateAccountBadge(user);
    updateHeroAccountButton(user);
    updateMonthlyTargetWidget();
    updateFloatingAuthButton(user);

  } else {
    trades = [];
    blogPosts = [];
    currentUserProfile = null;
    setAppMode(null);

    updateDashboard();
    renderTradeHistory();
    updateBestTradeShowcase();
    updateTradeReplay(null);
    updateEquityCurve();
    updateCalendarHeatmap();
    updateDailyPnlChart();
    updatePeriodSummary();
    updatePsychologyVerdict();
    renderBlogPosts();

    loginBtn.textContent = "Login";
    loginBtn.title = "";
    loginBtn.onclick = () => openLoginPopup();
    updateAccountBadge(null);
    updateHeroAccountButton(null);
    updateMonthlyTargetWidget();
    updateFloatingAuthButton(null);
  }
});

  document.getElementById('year').textContent = new Date().getFullYear();

  const reveals = document.querySelectorAll('.reveal');
let trades = [];
let editingTradeId = null;
let pendingTradeModalAfterLogin = false;
let tradeWizardStep = 1;

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
  gradeElement.innerText = "Elite Discipline Trader";
}

else if (traderScore >= 85) {
  gradeElement.innerText = "Professional Trader";
}

else if (traderScore >= 70) {
  gradeElement.innerText = "Consistent Trader";
}

else if (traderScore >= 50) {
  gradeElement.innerText = "Developing Trader";
}

else {
  gradeElement.innerText = "Undisciplined Trader";
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

function calculateTradePnl(entry, exit, qty) {
  if (!entry || !exit || !qty) return 0;
  return (exit - entry) * qty;
}

function updateTradePreview() {
  const entry = Number(document.getElementById("tradeEntry").value);
  const sl = Number(document.getElementById("tradeSl").value);
  const target = Number(document.getElementById("tradeTarget").value);
  const exit = Number(document.getElementById("tradeExit").value);
  const qty = Number(document.getElementById("tradeQty").value);

  calculateRR();

  const risk = entry && sl && qty ? Math.abs(entry - sl) * qty : 0;
  const reward = entry && target && qty ? Math.abs(target - entry) * qty : 0;
  const pnl = calculateTradePnl(entry, exit, qty);

  safeText("previewPnl", money(pnl));
  safeText("previewRisk", money(risk));
  safeText("previewReward", money(reward));
  safeText("previewRR", risk ? `1 : ${(reward / risk).toFixed(2)}` : "0 : 0");
  safeText("previewPnlMode", "Exit - Entry");
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
    dateInput.value = formatDisplayDate(now, "");
  }

  if (timeInput && !timeInput.value) {
    timeInput.value = now.toTimeString().slice(0, 5);
  }
}

function setTradeStep(step = 1) {
  const totalSteps = 4;
  tradeWizardStep = Math.max(1, Math.min(totalSteps, Number(step) || 1));

  document.querySelectorAll("[data-step-trigger]").forEach((button) => {
    const buttonStep = Number(button.dataset.stepTrigger);
    button.classList.toggle("active", buttonStep === tradeWizardStep);
    button.classList.toggle("completed", buttonStep < tradeWizardStep);
  });

  document.querySelectorAll("[data-step-panel]").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.stepPanel) === tradeWizardStep);
  });

  const backBtn = document.getElementById("tradeStepBackBtn");
  const nextBtn = document.getElementById("tradeStepNextBtn");
  const footer = document.querySelector(".wizard-footer");

  if (backBtn) backBtn.disabled = tradeWizardStep === 1;
  if (nextBtn) nextBtn.textContent = tradeWizardStep === totalSteps - 1 ? "Review Trade" : "Next Step";
  footer?.classList.toggle("is-final", tradeWizardStep === totalSteps);

  const activePanel = document.querySelector(`[data-step-panel="${tradeWizardStep}"]`);
  activePanel?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function nextTradeStep() {
  setTradeStep(tradeWizardStep + 1);
}

function previousTradeStep() {
  setTradeStep(tradeWizardStep - 1);
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
  setTradeStep(1);
  updateTradePreview();
  calculateDisciplineScore();
}

function closeTradeModal() {
  document.getElementById("tradeModal").style.display = "none";
}

window.openTradeModal = openTradeModal;
window.closeTradeModal = closeTradeModal;
window.setTradeStep = setTradeStep;
window.nextTradeStep = nextTradeStep;
window.previousTradeStep = previousTradeStep;

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
  const tradeDate = normalizeDateInput(document.getElementById("tradeDate").value);

if (!tradeDate || !entry || !exit || !qty || !direction) {
    alert("Please fill trade date in DD-MM-YYYY format, entry, exit, quantity and direction.");

    saveBtn.disabled = false;
    saveBtn.innerText = "Save Trade";

    return;
}

 const finalQty = qty;
 const pnl = calculateTradePnl(entry, exit, finalQty);

  const trade = {
    date: tradeDate,
    time: document.getElementById("tradeTime").value,
    symbol: document.getElementById("tradeSymbol").value,
    segment: document.getElementById("tradeSegment").value,
optionType: document.getElementById("optionType")?.value || "",
strikePrice: document.getElementById("strikePrice")?.value || "",
expiryDate: normalizeDateInput(document.getElementById("expiryDate")?.value || ""),
premium: "",
lotSize: "",
lots: "",
futureExpiry: normalizeDateInput(document.getElementById("futureExpiry")?.value || ""),
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
  updateMonthlyTargetWidget();
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
  return `${INR}${Number(value || 0).toFixed(2)}`;
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
    const tradeDate = getDateFromDateKey(getTradeDateKey(trade));
    if (!tradeDate) return false;
    return tradeDate >= weekStart && tradeDate <= now;
  });

  const monthTrades = trades.filter((trade) => {
    const tradeDate = getDateFromDateKey(getTradeDateKey(trade));
    if (!tradeDate) return false;
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
    const dateKey = getTradeDateKey(trade);
    if (!dateKey) return;
    dayStats[dateKey] = (dayStats[dateKey] || 0) + (Number(trade.pnl) || 0);
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
          <p>Best: ${bestDay ? `${formatDisplayDate(bestDay[0])} (${money(bestDay[1])})` : "No data"} | Worst: ${worstDay ? `${formatDisplayDate(worstDay[0])} (${money(worstDay[1])})` : "No data"}</p>
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
    const tradeDay = getTradeDateKey(trade);
    if (!tradeDay) return false;
    const [year, month] = tradeDay.split("-").map(Number);
    return month - 1 === currentMonth && year === currentYear;
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
    const tradeDay = getTradeDateKey(trade);
    if (!tradeDay) return;
    if (!dayStats[tradeDay]) dayStats[tradeDay] = 0;
    dayStats[tradeDay] += getTradePnl(trade);
  });

  let bestDay = "No Data";
  let worstDay = "No Data";
  let bestDayPnl = -Infinity;
  let worstDayPnl = Infinity;

  Object.entries(dayStats).forEach(([date, pnl]) => {
    if (pnl > bestDayPnl) {
      bestDayPnl = pnl;
      bestDay = `${formatDisplayDate(date)} ₹${pnl.toFixed(2)}`;
    }

    if (pnl < worstDayPnl) {
      worstDayPnl = pnl;
      worstDay = `${formatDisplayDate(date)} ₹${pnl.toFixed(2)}`;
    }
  });

  let greenDays = 0;
  let redDays = 0;
  let flatDays = 0;

  Object.values(dayStats).forEach((pnl) => {
    if (pnl > 0) greenDays++;
    if (pnl < 0) redDays++;
    if (pnl === 0) flatDays++;
  });
  const tradingDays = Object.keys(dayStats).length;

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
  safeText("proTradingDays", tradingDays);
  safeText("proGreenDays", greenDays);
  safeText("proRedDays", redDays);
  safeText(
    "tradeDayExplanation",
    `${monthTrades} trade ${monthTrades === 1 ? "entry" : "entries"} over ${tradingDays} trading ${tradingDays === 1 ? "day" : "days"}. Green ${greenDays}, red ${redDays}${flatDays ? `, flat ${flatDays}` : ""}.`
  );

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
    `Warning: ${worstSetup}
     is currently your worst setup
     (₹${lowestPnl.toFixed(2)})`;

}

else {

  worstSetupWarning.innerHTML =
    "No losing setup detected yet.";
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
    `Warning: ${worstTime} is your weakest time slot (₹${worstTimePnl.toFixed(2)}).`;
} else {
  worstTimeWarning.innerHTML =
    "No weak time slot detected yet.";
}
  document.getElementById("totalTrades").innerText = totalTrades;
  document.getElementById("totalPnl").innerText = money(totalPnl);
  document.getElementById("winRate").innerText = winRate + "%";
  document.getElementById("rulesRate").innerText = rulesRate + "%";
  document.getElementById("heroPnl").innerText = money(totalPnl);
document.getElementById("heroWinRate").innerText = winRate + "%";
document.getElementById("proTotalTrades").innerText = totalTrades;
document.getElementById("proBestTrade").innerText = money(bestTrade);
document.getElementById("proWorstTrade").innerText = money(worstTrade);
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
    warningBox.innerText = "Profit hua, lekin process weak tha. Aise trades repeat mat karo.";
    warningBox.className = "process-warning warning";
  }

  else if (tradeClass === "Losing Trade + Good Process") {
    warningBox.innerText = "Loss hua, lekin process strong tha. Ye acceptable trading hai.";
    warningBox.className = "process-warning good";
  }

  else if (tradeClass === "Winning Trade + Good Process") {
    warningBox.innerText = "Excellent trade. Profit bhi aur process bhi strong.";
    warningBox.className = "process-warning good";
  }

  else {
    warningBox.innerText = "Loss bhi hua aur process bhi weak tha. Is trade ko deeply review karo.";
    warningBox.className = "process-warning danger";
  }
}
function updateCalendarHeatmap() {
  const box = document.getElementById("calendarHeatmap");
  if (!box) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  const dayStats = {};

  trades.forEach((trade) => {
    const d = getDateFromDateKey(getTradeDateKey(trade));
    if (!d) return;
    if (d.getMonth() !== month || d.getFullYear() !== year) return;

    const day = d.getDate();

    if (!dayStats[day]) {
      dayStats[day] = {
        pnl: 0,
        trades: 0
      };
    }

    dayStats[day].pnl += getTradePnl(trade);
    dayStats[day].trades++;
  });

  const pnlValues = Object.values(dayStats).map((day) => Math.abs(day.pnl));
  const maxAbsPnl = Math.max(...pnlValues, 1);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let cells = "";

  for (let blank = 0; blank < firstDay; blank++) {
    cells += `<div class="activity-day empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const data = dayStats[day];
    let cls = "activity-day no-trade";
    const displayDate = formatDisplayDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    let info = `${displayDate}: No trade`;
    let details = `<span>No trade</span>`;

    if (data) {
      const intensity = Math.max(1, Math.min(4, Math.ceil((Math.abs(data.pnl) / maxAbsPnl) * 4)));
      cls = `activity-day ${data.pnl >= 0 ? "profit" : "loss"} level-${intensity}`;
      info = `${displayDate}: ${data.trades} trade${data.trades > 1 ? "s" : ""} | P&L ${money(data.pnl)}`;
      details = `<span>${data.trades} trade${data.trades > 1 ? "s" : ""}</span><strong>${money(data.pnl)}</strong>`;
    }

    cells += `
      <div class="${cls}" title="${escapeHtml(info)}" data-tooltip="${escapeHtml(info)}" aria-label="${escapeHtml(info)}">
        <b>${day}</b>
        ${details}
      </div>
    `;
  }

  const totalCells = firstDay + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let blank = 0; blank < trailing; blank++) {
    cells += `<div class="activity-day empty"></div>`;
  }

  const monthlyPnl = Object.values(dayStats).reduce((sum, day) => sum + day.pnl, 0);
  const monthlyTrades = Object.values(dayStats).reduce((sum, day) => sum + day.trades, 0);

  box.innerHTML = `
    <div class="activity-calendar">
      <div class="activity-calendar-head">
        <div>
          <h4>${monthName}</h4>
          <p>${monthlyTrades} trades | ${money(monthlyPnl)} monthly P&L</p>
        </div>
        <div class="activity-legend">
          <span class="legend-profit"></span> Profit
          <span class="legend-loss"></span> Loss
          <span class="legend-flat"></span> No trade
        </div>
      </div>
      <div class="activity-weekdays">
        ${weekdays.map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="activity-month-grid">
        ${cells}
      </div>
    </div>
  `;
}
function updateEquityCurve() {
  const chart = document.getElementById("equityCurve");
  if (!chart) return;
  chart.innerHTML = "";

  if (!trades.length) {
    chart.innerHTML = `<text x="250" y="112" text-anchor="middle" class="chart-empty-label">Performance will appear here</text>`;
    return;
  }

  let runningTotal = 0;
  const orderedTrades = [...trades].sort((a, b) => {
    const aTime = new Date(`${getTradeDateKey(a) || "1970-01-01"}T${a.time || a.tradeTime || "00:00"}`).getTime();
    const bTime = new Date(`${getTradeDateKey(b) || "1970-01-01"}T${b.time || b.tradeTime || "00:00"}`).getTime();
    return aTime - bTime;
  });
  const points = orderedTrades.map((trade) => {
    runningTotal += getTradePnl(trade);
    return runningTotal;
  });

  const width = 500;
  const height = 220;
  const paddingX = 36;
  const paddingY = 28;

  const min = Math.min(...points, 0);
  const max = Math.max(...points, 0);

  const range = max - min || 1;

  const getX = (index) => {
    if (points.length === 1) return width / 2;
    return paddingX + (index * (width - paddingX * 2)) / (points.length - 1);
  };

  const getY = (value) => {
    return height - paddingY - ((value - min) / range) * (height - paddingY * 2);
  };

  const zeroY = getY(0);

  [0.25, 0.5, 0.75].forEach((ratio) => {
    const y = paddingY + (height - paddingY * 2) * ratio;
    chart.innerHTML += `<line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" class="chart-grid-line" />`;
  });

  chart.innerHTML += `
    <line
      x1="${paddingX}"
      y1="${zeroY}"
      x2="${width - paddingX}"
      y2="${zeroY}"
      class="equity-zero-line"
    />
  `;

  const pathData = points
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point)}`;
    })
    .join(" ");

  const areaData = `${pathData} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  chart.innerHTML += `
    <path d="${areaData}" class="equity-area"></path>
  `;

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

  chart.innerHTML += `
    <text x="${paddingX}" y="${height - 8}" class="chart-axis-label">Start</text>
    <text x="${width - paddingX}" y="${height - 8}" text-anchor="end" class="chart-axis-label">${money(points.at(-1))}</text>
  `;
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
    const tradeDay = getTradeDateKey(trade);
    if (!tradeDay) return;
    dayStats[tradeDay] = (dayStats[tradeDay] || 0) + getTradePnl(trade);
  });

  const entries = Object.entries(dayStats).sort((a, b) => new Date(a[0]) - new Date(b[0])).slice(-14);
  if (!entries.length) {
    chart.innerHTML = `<text x="250" y="110" text-anchor="middle" class="chart-empty-label">Daily P&L will appear here</text>`;
    return;
  }

  const values = entries.map((entry) => entry[1]);

  const width = 500;
  const height = 220;
  const paddingX = 36;
  const paddingY = 30;
  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 1);
  const zeroY = height / 2;
  const barGap = entries.length > 8 ? 6 : 10;
  const availableWidth = width - paddingX * 2;
  const barWidth = Math.max(10, Math.min(34, (availableWidth - barGap * (entries.length - 1)) / entries.length));
  const chartWidth = entries.length * barWidth + barGap * (entries.length - 1);
  const startX = paddingX + (availableWidth - chartWidth) / 2;

  [0.25, 0.5, 0.75].forEach((ratio) => {
    const y = paddingY + (height - paddingY * 2) * ratio;
    chart.innerHTML += `<line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" class="chart-grid-line" />`;
  });

  chart.innerHTML += `
    <line x1="${paddingX}" y1="${zeroY}" x2="${width - paddingX}" y2="${zeroY}" class="equity-zero-line" />
  `;

  entries.forEach(([date, pnl], index) => {
    const barHeight = Math.max(5, (Math.abs(pnl) / maxAbs) * (height / 2 - paddingY - 8));
    const x = startX + index * (barWidth + barGap);
    const y = pnl >= 0 ? zeroY - barHeight : zeroY;
    const cls = pnl >= 0 ? "daily-bar profit-bar" : "daily-bar loss-bar";
    const day = new Date(date).getDate();

    chart.innerHTML += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" class="${cls}">
        <title>${formatDisplayDate(date)}: ${money(pnl)}</title>
      </rect>
      <text x="${x + barWidth / 2}" y="${height - 8}" text-anchor="middle" class="chart-axis-label">${day}</text>
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

      <h4>Best Trade Ever</h4>

      <p>
        ${bestTrade.symbol || "N/A"}
        |
        ${bestTrade.segment || "N/A"}
      </p>

      <p>
        Date:
        ${formatDisplayDate(bestTrade.date)}
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
      <div>${formatDisplayDate(new Date())}</div>
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
      <p>Date: ${formatDisplayDate(trade.date)}</p>
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
  if (!filter) return true;

  const tradeDate = getDateFromDateKey(getTradeDateKey(trade));
  if (!tradeDate) return false;
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
    const from = fromValue ? getDateFromDateKey(normalizeDateInput(fromValue)) : null;
    const to = toValue ? getDateFromDateKey(normalizeDateInput(toValue)) : null;
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
        <div>${formatDisplayDate(trade.date)}</div>
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

["tradeDate", "expiryDate", "futureExpiry", "dateFromFilter", "dateToFilter"].forEach((id) => {
  document.getElementById(id)?.addEventListener("blur", (event) => {
    const normalized = normalizeDateInput(event.target.value);
    if (normalized) {
      event.target.value = formatDisplayDate(normalized, "");
    }
  });
});

function openTradeDetail(tradeId) {
  const trade = trades.find((item) => item.id === tradeId);
  const modal = document.getElementById("tradeDetailModal");
  const content = document.getElementById("tradeDetailContent");

  if (!trade || !modal || !content) return;

  const pnlClass = trade.pnl >= 0 ? "profit" : "loss";

  content.innerHTML = `
    <h3>${trade.symbol || "N/A"} <span>${trade.segment || "N/A"}</span></h3>
    <div class="detail-grid">
      <div><span>Date</span><strong>${formatDisplayDate(trade.date)}</strong></div>
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
  `${formatDisplayDate(trade.date, "")},` +
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

    setDisplayDateInput("tradeDate", trade.date || "");
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
    setDisplayDateInput("expiryDate", trade.expiryDate || "");
    setDisplayDateInput("futureExpiry", trade.futureExpiry || "");

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
    setAuthMode("login");
    document.getElementById("loginPopup").style.display = "flex";
    setTimeout(() => document.getElementById("loginEmail")?.focus(), 50);
  }

  function closeLoginPopup() {
    document.getElementById("loginPopup").style.display = "none";
  }

  window.addEventListener('scroll', () => {
    revealSections();
    updateFloatingAuthButton();
  });
  document.getElementById("tradeModal")?.addEventListener("click", (event) => {
    if (event.target.id === "tradeModal") {
      closeTradeModal();
    }
  });

  document.getElementById("profileModal")?.addEventListener("click", (event) => {
    if (event.target.id === "profileModal") {
      closeProfileModal();
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
  updateFloatingAuthButton();
window.saveTrade = saveTrade;
window.toggleOptionFields = toggleOptionFields;
window.toggleAdvancedAnalytics = toggleAdvancedAnalytics;
window.exportTradesCSV = exportTradesCSV;
window.deleteTrade = deleteTrade;
window.editTrade = editTrade;
window.openLoginPopup = openLoginPopup;
window.closeLoginPopup = closeLoginPopup;
window.openJournalGate = openJournalGate;
window.toggleLoginPassword = toggleLoginPassword;
window.toggleMobileMenu = toggleMobileMenu;
window.setAuthMode = setAuthMode;
window.openTradeDetail = openTradeDetail;
window.closeTradeDetail = closeTradeDetail;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.renderProfileView = renderProfileView;
window.renderProfileEdit = renderProfileEdit;
window.saveProfileDetails = saveProfileDetails;
window.saveQuickMonthlyTarget = saveQuickMonthlyTarget;
window.saveBlogPost = saveBlogPost;
window.deleteBlogPost = deleteBlogPost;
window.clearBlogForm = clearBlogForm;
window.logoutCurrentUser = logoutCurrentUser;
window.toggleProfileMenu = toggleProfileMenu;
window.toggleCustomizePanel = toggleCustomizePanel;
window.setDashboardLayout = setDashboardLayout;
// ================= ADVANCED JOURNAL ANALYTICS =================

function updateAdvancedAnalytics() {
  updateDecisionCoach();

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

function getTradeDateKey(trade) {
  const rawDate = trade?.date || trade?.tradeDate || trade?.createdAt?.toDate?.();
  if (!rawDate) return "";

  if (typeof rawDate === "string" && /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(rawDate.trim())) {
    const [day, month, year] = rawDate.trim().split(/[/-]/);
    return `${year}-${month}-${day}`;
  }

  if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
    return rawDate.slice(0, 10);
  }

  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value, fallback = "N/A") {
  if (!value) return fallback;

  if (typeof value === "string" && /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(value.trim())) {
    const [day, month, year] = value.trim().split(/[/-]/);
    return `${day}-${month}-${year}`;
  }

  const dateKey = getTradeDateKey({ date: value });
  if (!dateKey) return fallback;

  const [year, month, day] = dateKey.split("-");
  return `${day}-${month}-${year}`;
}

function normalizeDateInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const ddmmyyyy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, "0");
    const month = ddmmyyyy[2].padStart(2, "0");
    const year = ddmmyyyy[3];
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));

    if (
      parsed.getFullYear() === Number(year) &&
      parsed.getMonth() === Number(month) - 1 &&
      parsed.getDate() === Number(day)
    ) {
      return `${year}-${month}-${day}`;
    }
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setDisplayDateInput(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = formatDisplayDate(value, "");
}

function getDateFromDateKey(dateKey) {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatMoney(value) {
  return `${INR}${Number(value || 0).toFixed(2)}`;
}

function isRuleFollowed(trade) {
  return trade.rules === true || trade.rules === "Yes" || trade.rules === "Followed";
}

function getCurrentMonthTradesForAnalytics() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return trades.filter((trade) => {
    const dateKey = getTradeDateKey(trade);
    if (!dateKey) return false;
    const tradeDate = new Date(`${dateKey}T00:00:00`);
    return tradeDate.getMonth() === month && tradeDate.getFullYear() === year;
  });
}

function getTradeTimeSlot(trade) {
  const raw = String(trade.time || trade.tradeTime || "").trim();
  if (!raw) return "";

  let hour = 0;
  let minute = 0;
  const amPmMatch = raw.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)/i);
  const twentyFourMatch = raw.match(/(\d{1,2})[:.](\d{2})/);

  if (amPmMatch) {
    hour = Number(amPmMatch[1]);
    minute = Number(amPmMatch[2]);
    const period = amPmMatch[3].toUpperCase();
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
  } else if (twentyFourMatch) {
    hour = Number(twentyFourMatch[1]);
    minute = Number(twentyFourMatch[2]);
  } else {
    return "";
  }

  const minutes = hour * 60 + minute;
  const slots = [
    ["09:15 - 10:00", 9 * 60 + 15, 10 * 60],
    ["10:00 - 11:00", 10 * 60, 11 * 60],
    ["11:00 - 12:00", 11 * 60, 12 * 60],
    ["12:00 - 01:00", 12 * 60, 13 * 60],
    ["01:00 - 02:00", 13 * 60, 14 * 60],
    ["02:00 - 03:30", 14 * 60, 15 * 60 + 30]
  ];

  const slot = slots.find((item) => minutes >= item[1] && minutes < item[2]);
  return slot ? slot[0] : "";
}

function parseTradeRR(trade) {
  if (Number.isFinite(Number(trade.rr))) return Number(trade.rr);
  const raw = String(trade.rrRatio || trade.riskReward || "").trim();
  const match = raw.match(/1\s*:\s*([\d.]+)/);
  return match ? Number(match[1]) || 0 : 0;
}

function makeDecisionStat() {
  return { trades: 0, wins: 0, losses: 0, pnl: 0, lossCost: 0 };
}

function addTradeToDecisionStat(stat, trade) {
  const pnl = getTradePnl(trade);
  stat.trades += 1;
  stat.pnl += pnl;
  if (pnl > 0) stat.wins += 1;
  if (pnl < 0) {
    stat.losses += 1;
    stat.lossCost += Math.abs(pnl);
  }
}

function getWinRate(stat) {
  return stat?.trades ? Math.round((stat.wins / stat.trades) * 100) : 0;
}

function renderDecisionInsight(type, label, title, text) {
  return `
    <div class="decision-insight ${type}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${text}</p>
    </div>
  `;
}

function updateDecisionCoach() {
  const box = document.getElementById("decisionCoachBox");
  if (!box) return;

  if (!Array.isArray(trades) || trades.length === 0) {
    box.innerHTML = renderDecisionInsight(
      "neutral",
      "Waiting for data",
      "Add trades to unlock decisions",
      "Your journal will show setup edge, weak time slots, mistake cost, and next rules."
    );
    return;
  }

  const monthTrades = getCurrentMonthTradesForAnalytics();
  const activeTrades = monthTrades.length ? monthTrades : trades;
  const scopeLabel = monthTrades.length ? "this month" : "all saved trades";
  const setupStats = {};
  const mistakeStats = {};
  const timeStats = {};
  const dayStats = {};
  const ruleFollowed = makeDecisionStat();
  const ruleBroken = makeDecisionStat();
  let rrTotal = 0;
  let rrCount = 0;

  activeTrades.forEach((trade) => {
    const setup = trade.setup || "No Setup";
    setupStats[setup] = setupStats[setup] || makeDecisionStat();
    addTradeToDecisionStat(setupStats[setup], trade);

    getTradeMistakes(trade).forEach((mistake) => {
      if (!mistake || mistake === "No Mistake") return;
      mistakeStats[mistake] = mistakeStats[mistake] || makeDecisionStat();
      addTradeToDecisionStat(mistakeStats[mistake], trade);
    });

    const slot = getTradeTimeSlot(trade);
    if (slot) {
      timeStats[slot] = timeStats[slot] || makeDecisionStat();
      addTradeToDecisionStat(timeStats[slot], trade);
    }

    const dateKey = getTradeDateKey(trade);
    if (dateKey) {
      dayStats[dateKey] = dayStats[dateKey] || makeDecisionStat();
      addTradeToDecisionStat(dayStats[dateKey], trade);
    }

    addTradeToDecisionStat(isRuleFollowed(trade) ? ruleFollowed : ruleBroken, trade);

    const rr = parseTradeRR(trade);
    if (rr > 0) {
      rrTotal += rr;
      rrCount += 1;
    }
  });

  const setups = Object.entries(setupStats);
  const mistakes = Object.entries(mistakeStats);
  const times = Object.entries(timeStats);
  const days = Object.entries(dayStats);

  const bestSetup = setups.length ? [...setups].sort((a, b) => b[1].pnl - a[1].pnl)[0] : null;
  const worstSetup = setups.length ? [...setups].sort((a, b) => a[1].pnl - b[1].pnl)[0] : null;
  const biggestMistake = mistakes.length ? [...mistakes].sort((a, b) => b[1].lossCost - a[1].lossCost)[0] : null;
  const worstTime = times.length ? [...times].sort((a, b) => a[1].pnl - b[1].pnl)[0] : null;
  const bestTime = times.length ? [...times].sort((a, b) => b[1].pnl - a[1].pnl)[0] : null;
  const overtradeDay = days
    .filter((item) => item[1].trades >= 2 && item[1].pnl < 0)
    .sort((a, b) => b[1].trades - a[1].trades || a[1].pnl - b[1].pnl)[0];
  const avgRR = rrCount ? rrTotal / rrCount : 0;
  const followedAvg = ruleFollowed.trades ? ruleFollowed.pnl / ruleFollowed.trades : 0;
  const brokenAvg = ruleBroken.trades ? ruleBroken.pnl / ruleBroken.trades : 0;
  const actionList = [];
  const cards = [];

  if (biggestMistake && biggestMistake[1].lossCost > 0) {
    actionList.push(`Block ${biggestMistake[0]} for the next 5 trades.`);
    cards.push(renderDecisionInsight(
      "warning",
      "Biggest leak",
      biggestMistake[0],
      `Loss cost ${formatMoney(biggestMistake[1].lossCost)} across ${biggestMistake[1].trades} trade${biggestMistake[1].trades > 1 ? "s" : ""} in ${scopeLabel}. Make a hard rule before taking this setup again.`
    ));
  } else {
    cards.push(renderDecisionInsight(
      "good",
      "Mistake control",
      "No major mistake cost yet",
      `No repeated loss-making mistake is visible in ${scopeLabel}. Keep writing notes after every exit.`
    ));
  }

  if (bestSetup) {
    cards.push(renderDecisionInsight(
      "good",
      "Best setup",
      bestSetup[0],
      `${getWinRate(bestSetup[1])}% win rate, ${formatMoney(bestSetup[1].pnl)} P&L. This is your current edge. Prefer this only when entry rules are clean.`
    ));
  }

  if (worstSetup && worstSetup[1].pnl < 0) {
    actionList.push(`Reduce size or pause ${worstSetup[0]} until reviewed.`);
    cards.push(renderDecisionInsight(
      "warning",
      "Weak setup",
      worstSetup[0],
      `${formatMoney(worstSetup[1].pnl)} P&L with ${getWinRate(worstSetup[1])}% win rate. Review screenshots before taking this setup again.`
    ));
  } else {
    cards.push(renderDecisionInsight(
      "neutral",
      "Setup risk",
      "No losing setup flagged",
      "No setup is clearly damaging the account yet. Continue collecting samples before scaling size."
    ));
  }

  if (worstTime && worstTime[1].pnl < 0) {
    actionList.push(`Avoid ${worstTime[0]} until it gives 5 clean journal entries.`);
    cards.push(renderDecisionInsight(
      "warning",
      "Weak time slot",
      worstTime[0],
      `${formatMoney(worstTime[1].pnl)} P&L. Avoid this slot or trade half quantity until the data improves.`
    ));
  } else if (bestTime) {
    cards.push(renderDecisionInsight(
      "good",
      "Best time slot",
      bestTime[0],
      `${formatMoney(bestTime[1].pnl)} P&L with ${getWinRate(bestTime[1])}% win rate. Your better execution is appearing here.`
    ));
  }

  if (ruleBroken.trades && brokenAvg < followedAvg) {
    actionList.push("Take no trade unless the Rules Followed checkbox is honestly true.");
    cards.push(renderDecisionInsight(
      "warning",
      "Rules impact",
      "Rule breaks are costly",
      `Rules followed avg ${formatMoney(followedAvg)} vs rules broken avg ${formatMoney(brokenAvg)}. This is process leakage, not market problem.`
    ));
  } else {
    cards.push(renderDecisionInsight(
      "good",
      "Rules impact",
      "Rules are protecting you",
      `Rules followed P&L is ${formatMoney(ruleFollowed.pnl)} in ${scopeLabel}. Keep execution boring and repeatable.`
    ));
  }

  if (avgRR && avgRR < 1.5) {
    actionList.push("Skip trades below 1 : 1.5 planned R:R.");
    cards.push(renderDecisionInsight(
      "warning",
      "Risk reward",
      `Avg R:R ${avgRR.toFixed(2)}`,
      "Your average planned reward is too close to risk. Improve target placement or skip weak entries."
    ));
  } else if (avgRR) {
    cards.push(renderDecisionInsight(
      "good",
      "Risk reward",
      `Avg R:R ${avgRR.toFixed(2)}`,
      "Planned R:R is healthy. Now focus on entry quality and rule discipline."
    ));
  }

  if (overtradeDay) {
    actionList.push(`Use a daily trade limit after ${overtradeDay[1].trades} trades.`);
    cards.push(renderDecisionInsight(
      "warning",
      "Overtrading alert",
      overtradeDay[0],
      `${overtradeDay[1].trades} trades and ${formatMoney(overtradeDay[1].pnl)} P&L on this day. Add a daily stop after repeated entries.`
    ));
  }

  const fallbackActions = [
    "Journal entry reason before every trade.",
    "Review losing trades at market close.",
    "Trade only the best setup until data improves."
  ];
  const finalActions = [...actionList, ...fallbackActions].slice(0, 3);
  cards.push(renderDecisionInsight(
    "neutral",
    "Next 3 actions",
    "For the next trading day",
    finalActions.map((action, index) => `${index + 1}. ${escapeHtml(action)}`).join("<br>")
  ));

  box.innerHTML = cards.join("");
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
  safeText("ruleBreakCost", formatMoney(brokenPnl < 0 ? Math.abs(brokenPnl) : 0));
  safeText("rulesFollowedPnlAdvanced", formatMoney(followedPnl));
  safeText("rulesBrokenPnlAdvanced", formatMoney(brokenPnl));

  document.getElementById("rulesFollowedPnl").className = followedPnl >= 0 ? "profit-text" : "loss-text";
  document.getElementById("rulesBrokenPnl").className = brokenPnl >= 0 ? "profit-text" : "loss-text";
  const ruleCost = document.getElementById("ruleBreakCost");
  const followedAdvanced = document.getElementById("rulesFollowedPnlAdvanced");
  const brokenAdvanced = document.getElementById("rulesBrokenPnlAdvanced");
  if (ruleCost) ruleCost.className = brokenPnl < 0 ? "loss-text" : "profit-text";
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
    const tradeDate = getDateFromDateKey(getTradeDateKey(trade));
    if (!tradeDate) return false;
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
  const profitFactor = totalLoss ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? "\u221e" : "0";

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
    : formatMoney(0);

  document.getElementById("worstTradeBox").innerText = worstTrade
    ? `${worstTrade.symbol || "Trade"} | ${formatMoney(getTradePnl(worstTrade))}`
    : formatMoney(0);

  document.getElementById("bestTradeBox").className = "profit-text";
  document.getElementById("worstTradeBox").className = "loss-text";
}

// 5. Trader Score
function updateTraderScore() {
  const totalTrades = trades.length;
  if (!totalTrades) {
    safeText("traderScoreBox", "0/100");
    safeText("traderScoreText", "Start journaling to build your score");
    return;
  }

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
  const disciplineScore = (Math.min(avgDiscipline, 25) / 25) * 15;

  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(winRateScore + ruleScore + mistakeScore + disciplineScore))
  );

  safeText("traderScoreBox", finalScore + "/100");

  let scoreText = "Needs improvement";

  if (finalScore >= 80) {
    scoreText = "Excellent discipline. Keep it up.";
  } else if (finalScore >= 60) {
    scoreText = "Good progress. Thoda aur consistency chahiye.";
  } else if (finalScore >= 40) {
    scoreText = "Average. Mistakes aur rule break kam karo.";
  }

  safeText("traderScoreText", scoreText);
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




