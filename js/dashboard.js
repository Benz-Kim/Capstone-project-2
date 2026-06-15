/* ═══════════════════════════════════
   dashboard.js — Build & interact with the dashboard
   ═══════════════════════════════════ */

const CHAT_REPLIES = [
  "Yes! Focus on the hardest part today and keep your momentum going. 💪",
  "You are doing well so far! This pace is strong enough to reach your goal.",
  "It’s okay to take a break for a day. We’ll redistribute the missed work over the next three days.",
  "Focusing on your weakest area is the fastest way to improve!",
  "Consistency is key. Take one step towards your goal today. 🎯",
];
let chatIndex = 0;

/* ── Build the entire dashboard from user + obData ── */
function buildDashboard(user) {
  const ob = (user && user.obData) || {
    track: "abroad",
    goal: "My Goal",
    year: 2027,
    sem: "Second half",
    level: {},
    hours: "3-4 hours",
  };
  let track = ob.track || "abroad";

  // Safety guard — fall back to 'abroad' if track key is missing
  if (!TRACK_CAPS[track]) track = "abroad";
  if (!TRACK_MILESTONES[track]) track = "abroad";
  if (!TRACK_BARS[track]) track = "abroad";
  if (!TRACK_TASKS[track]) track = "abroad";

  const firstName = user && user.name ? user.name.split(" ")[0] : "Student";
  const initials =
    (user && user.initials) || firstName.slice(0, 2).toUpperCase();

  // ── Header ──
  document.getElementById("d-avatar").textContent = initials;
  document.getElementById("d-name").textContent = `Hi, ${firstName} 👋`;

  const now = new Date();
  const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const MON_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  document.getElementById("d-date").textContent =
    `${DAY_NAMES[now.getDay()]}, ${MON_NAMES[now.getMonth()]} ${now.getDate()} · Day 1 streak`;

  // ── Goal card ──
  document.getElementById("d-goal-title").textContent = ob.goal || "My Goal";
  document.getElementById("d-goal-sub").textContent =
    `${TRACK_NAMES[track]} · ${ob.year || 2027} ${ob.sem || "Second half"}`;

  document.getElementById("d-caps").innerHTML = TRACK_CAPS[track]
    .map((c) => `<span class="gtag">${c}</span>`)
    .join("");

  const verse = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
  document.getElementById("verse-txt").textContent = verse.text;
  document.getElementById("verse-ref").textContent = verse.ref;

  const targetDate = new Date(
    ob.year || 2027,
    ob.sem === "First half" ? 5 : 11,
    1,
  );
  const monthsLeft = Math.max(
    1,
    Math.round((targetDate - now) / (1000 * 60 * 60 * 24 * 30)),
  );
  document.getElementById("d-stats").innerHTML = `
    <div class="gstat"><div class="gstat-val">${monthsLeft} months</div><div class="gstat-lbl">Time left</div></div>
    <div class="gstat"><div class="gstat-val">5%</div><div class="gstat-lbl">Overall progress</div></div>
    <div class="gstat"><div class="gstat-val">${ob.year || 2027}</div><div class="gstat-lbl">Target year</div></div>`;

  // ── Stepping stones ──
  const ms = TRACK_MILESTONES[track];
  let stHTML = "";
  ms.forEach((m, i) => {
    const state =
      m[1] === "Complete" ? "dn" : m[1] === "In Progress" ? "ac" : "ft";
    if (i > 0) {
      const prevState =
        ms[i - 1][1] === "Complete"
          ? "dn"
          : ms[i - 1][1] === "In Progress"
            ? "ac"
            : "ft";
      stHTML += `<div class="sline ${prevState}"></div>`;
    }
    stHTML += `<div class="stone"><div class="scircle ${state}">${state === "dn" ? CHECK_SVG : i + 1}</div><div class="slabel">${m[0]}</div></div>`;
  });
  stHTML += `<div class="sline ft"></div><div class="stone"><div class="scircle ft" style="background:#FAEEDA;border-color:#EF9F27;color:#633806;font-size:15px;">🎓</div><div class="slabel">Final goal</div></div>`;
  document.getElementById("d-stones").innerHTML = stHTML;

  // ── Milestone progress bars ──
  const bars = TRACK_BARS[track];
  const levelKeys = Object.keys(ob.level || {});
  document.getElementById("d-bars").innerHTML = bars
    .map((b, i) => {
      const subj = levelKeys[i] || b[0];
      const raw = (ob.level && ob.level[subj]) || 3;
      const pct = Math.round((raw / 5) * 60) + 10; // maps 1–5 → 22–70 %
      return `
      <div class="ms-item">
        <div class="ms-row">
          <span class="ms-name">${b[0]}</span>
          <span class="ms-pct" style="color:${b[1]};">${pct}%</span>
        </div>
        <div class="bar"><div class="bfill" style="width:${pct}%;background:${b[1]};"></div></div>
      </div>`;
    })
    .join("");

  // ── Today's tasks ──
  const tasks = TRACK_TASKS[track];
  document.getElementById("d-tasks").innerHTML = tasks
    .map((t, i) => {
      const done = i < 1;
      const sname = t.s
        .replace("s-", "")
        .replace("math", "Math")
        .replace("cs", "CS")
        .replace("sat", "SAT")
        .replace("sci", "Science")
        .replace("eng", "English")
        .replace("lang", "Language Arts")
        .replace("soc", "Social Studies");
      return `
      <div class="task-row${done ? " dn" : ""}">
        <div class="chk${done ? " dn" : ""}" onclick="toggleTask(this.parentElement)">${done ? CHECK_SVG : ""}</div>
        <div class="tinfo" onclick="toggleTask(this.parentElement)">
          <div class="tnm">${t.n}</div>
          <div class="tdur">${t.d}${done ? " · completed" : ""}</div>
        </div>
        <span class="tsubj ${t.s}">${sname}</span>
        <button class="task-delete" onclick="deleteTask(this.parentElement)" title="Delete task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>`;
    })
    .join("");
  updateSummary();

  // ── AI chat greeting ──
  document.getElementById("chat-prev").textContent =
    `${firstName}, your goal analysis is ready! Shall we start your first study session today? 💪`;
}

/* ── Goal card expand/collapse ── */
function toggleGoal() {
  const d = document.getElementById("gdet");
  const b = document.getElementById("gexpbtn");
  const l = document.getElementById("gexplbl");
  d.classList.toggle("open");
  b.classList.toggle("open");
  l.textContent = d.classList.contains("open") ? "hide details" : "see details";
}

/* ── Task interactions ── */
function toggleTask(row) {
  const chk = row.querySelector(".chk");
  const dur = row.querySelector(".tdur");
  const dn = row.classList.toggle("dn");
  chk.classList.toggle("dn", dn);
  chk.innerHTML = dn ? CHECK_SVG : "";
  if (dn && !dur.textContent.includes("completed"))
    dur.textContent += " · completed";
  if (!dn) dur.textContent = dur.textContent.replace(" · completed", "");
  updateSummary();
}

function updateSummary() {
  const all = document.querySelectorAll("#d-tasks .task-row").length;
  const done = document.querySelectorAll("#d-tasks .task-row.dn").length;
  document.getElementById("t-summary").textContent =
    `${done} / ${all} tasks completed`;
}

function toggleAdd() {
  const area = document.getElementById("addarea");
  area.classList.toggle("open");
  if (area.classList.contains("open")) document.getElementById("newt").focus();
}

function addTask() {
  const input = document.getElementById("newt");
  const select = document.getElementById("new-subject");
  const val = input.value.trim();
  if (!val) return;

  const subject = select.value;
  const subjectName = select.selectedOptions[0].textContent || "Task";
  const row = document.createElement("div");
  row.className = "task-row";
  row.innerHTML = `
    <div class="chk" onclick="toggleTask(this.parentElement)"></div>
    <div class="tinfo" onclick="toggleTask(this.parentElement)"><div class="tnm">${val}</div><div class="tdur">— min</div></div>
    <span class="tsubj ${subject}">${subjectName}</span>
    <button class="task-delete" onclick="deleteTask(this.parentElement)" title="Delete task">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
    </button>`;
  document.getElementById("d-tasks").appendChild(row);
  input.value = "";
  select.selectedIndex = 0;
  document.getElementById("addarea").classList.remove("open");
  updateSummary();
}

/* ── Delete task ── */
function deleteTask(row) {
  row.remove();
  updateSummary();
}

/* ── AI chat ── */
function sendChat() {
  const inp = document.getElementById("chat-in");
  if (!inp.value.trim()) return;
  inp.value = "";
  document.getElementById("chat-prev").textContent = "Thinking...";
  setTimeout(() => {
    document.getElementById("chat-prev").textContent =
      CHAT_REPLIES[chatIndex % CHAT_REPLIES.length];
    chatIndex++;
  }, 700);
}

/* ══════════════════════════════════
   SETTINGS MODAL FUNCTIONS
   ═════════════════════════════════ */

/* ── Open settings modal ── */
function openSettings() {
  const overlay = document.getElementById("settings-modal-overlay");
  overlay.classList.add("open");
  
  // Load dark mode toggle state
  const isDarkMode = localStorage.getItem("afp_dark_mode") === "true";
  document.getElementById("dark-mode-toggle").checked = isDarkMode;
}

/* ── Close settings modal ── */
function closeSettings(event) {
  // If clicked on overlay background (not modal content), close
  if (
    event &&
    event.target !== document.getElementById("settings-modal-overlay")
  )
    return;
  const overlay = document.getElementById("settings-modal-overlay");
  overlay.classList.remove("open");
}

/* ── View Account Info ── */
function viewAccountInfo() {
  if (!session) return;
  const name = session.name || "User";
  const email = session.email || "user@email.com";
  showToast(`Account: ${name} (${email})`);
}

/* ── Change Profile Picture ── */
function changeProfilePicture() {
  showToast("📷 Profile picture upload coming soon");
}

/* ── Toggle Dark Mode ── */
function toggleDarkMode() {
  const isDarkMode = document.getElementById("dark-mode-toggle").checked;
  localStorage.setItem("afp_dark_mode", isDarkMode);
  
  if (isDarkMode) {
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.style.colorScheme = "light";
  }
  
  showToast(isDarkMode ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
}

/* ── Delete Account ── */
function deleteAccount() {
  const confirmed = confirm(
    "⚠️ Are you sure you want to delete your account? This cannot be undone."
  );
  if (confirmed) {
    const finalConfirm = confirm(
      "This will permanently delete all your data. Continue?"
    );
    if (finalConfirm) {
      localStorage.removeItem("afp_sess");
      localStorage.removeItem("afp_dark_mode");
      window.location.reload();
    }
  }
}

/* ── Show toast notification ── */
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("on");
  setTimeout(() => toast.classList.remove("on"), 2000);
}
