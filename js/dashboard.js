
/* ═══════════════════════════════════
   dashboard.js — Build & interact with the dashboard
   ═══════════════════════════════════ */

const CHAT_REPLIES = [
  'Yes! Focus on the hardest part today and keep your momentum going. 💪',
  "You are doing well so far! This pace is strong enough to reach your goal.",
  "It's okay to take a break for a day. We'll redistribute the missed work over the next three days.",
  'Focusing on your weakest area is the fastest way to improve!',
  'Consistency is key. Take one step towards your goal today. 🎯',
];
let chatIndex = 0;

function subjectDisplayName(s) {
  return (s || '').replace('s-','').replace('math','Math').replace('cs','CS')
    .replace('sat','SAT').replace('sci','Science').replace('eng','English')
    .replace('lang','Language Arts').replace('soc','Social Studies');
}

async function buildDashboard(user) {
  const ob    = (user && user.obData) || { track:'abroad', goal:'My Goal', year:2027, sem:'Second half', level:{}, hours:'3-4 hours' };
  let   track = ob.track || 'abroad';

  if (!TRACK_CAPS[track])       track = 'abroad';
  if (!TRACK_MILESTONES[track]) track = 'abroad';
  if (!TRACK_BARS[track])       track = 'abroad';
  if (!TRACK_TASKS[track])      track = 'abroad';

  const firstName = (user && user.name) ? user.name.split(' ')[0] : 'Student';
  const initials  = (user && user.initials) || firstName.slice(0, 2).toUpperCase();

  document.getElementById('d-avatar').textContent = initials;
  document.getElementById('d-name').textContent   = `Hi, ${firstName} 👋`;

  const now       = new Date();
  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MON_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const streak    = await getStreak();
  document.getElementById('d-date').textContent = `${DAY_NAMES[now.getDay()]}, ${MON_NAMES[now.getMonth()]} ${now.getDate()} · 🔥 ${streak} day streak`;

  document.getElementById('d-goal-title').textContent = ob.goal || 'My Goal';
  document.getElementById('d-goal-sub').textContent   = `${TRACK_NAMES[track]} · ${ob.year || 2027} ${ob.sem || 'Second half'}`;

  document.getElementById('d-caps').innerHTML = getCapsForDisplay(track)
    .map(c => `<span class="gtag">${c}</span>`).join('');

  const verse = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
  document.getElementById('verse-txt').textContent = verse.text;
  document.getElementById('verse-ref').textContent = verse.ref;

  const targetDate = new Date(ob.year || 2027, ob.sem === 'First half' ? 5 : 11, 1);
  const monthsLeft = Math.max(1, Math.round((targetDate - now) / (1000 * 60 * 60 * 24 * 30)));
  const ms         = getMilestonesForDisplay(track);
  const overallPct = calcOverallProgress(ms);

  document.getElementById('d-stats').innerHTML = `
    <div class="gstat"><div class="gstat-val">${monthsLeft} months</div><div class="gstat-lbl">Time left</div></div>
    <div class="gstat"><div class="gstat-val">${overallPct}%</div><div class="gstat-lbl">Overall progress</div></div>
    <div class="gstat"><div class="gstat-val">${ob.year || 2027}</div><div class="gstat-lbl">Target year</div></div>`;

  let stHTML = '';
  ms.forEach((m, i) => {
    const state = m[1] === 'Complete' ? 'dn' : m[1] === 'In Progress' ? 'ac' : 'ft';
    if (i > 0) {
      const prevState = ms[i-1][1] === 'Complete' ? 'dn' : ms[i-1][1] === 'In Progress' ? 'ac' : 'ft';
      stHTML += `<div class="sline ${prevState}"></div>`;
    }
    stHTML += `<div class="stone"><div class="scircle ${state}">${state === 'dn' ? CHECK_SVG : i + 1}</div><div class="slabel">${m[0]}</div></div>`;
  });
  stHTML += `<div class="sline ft"></div><div class="stone"><div class="scircle ft" style="background:#FAEEDA;border-color:#EF9F27;color:#633806;font-size:15px;">🎓</div><div class="slabel">Final goal</div></div>`;
  document.getElementById('d-stones').innerHTML = stHTML;

  const bars      = getBarsForDisplay(track, ob);
  const levelKeys = Object.keys(ob.level || {});
  document.getElementById('d-bars').innerHTML = bars.map((b, i) => {
    const subj = levelKeys[i] || b[0];
    const raw  = (ob.level && ob.level[subj]) || 3;
    const pct  = Math.round((raw / 5) * 60) + 10;
    return `
      <div class="ms-item">
        <div class="ms-row"><span class="ms-name">${b[0]}</span><span class="ms-pct" style="color:${b[1]};">${pct}%</span></div>
        <div class="bar"><div class="bfill" style="width:${pct}%;background:${b[1]};"></div></div>
      </div>`;
  }).join('');

  const tasks = getTasksForDisplay(track);
  document.getElementById('d-tasks').innerHTML = tasks.map((t) => {
    const done  = t.done;
    const sname = subjectDisplayName(t.s);
    return `
      <div class="task-row${done ? ' dn' : ''}" data-task-id="${t.id || ''}" onclick="toggleTask(this)">
        <div class="chk${done ? ' dn' : ''}">${done ? CHECK_SVG : ''}</div>
        <div class="tinfo"><div class="tnm">${t.n}</div><div class="tdur">${t.d}${done ? ' · completed' : ''}</div></div>
        <span class="tsubj ${t.s}">${sname}</span>
      </div>`;
  }).join('');
  await updateSummary();

  Object.keys(_tabBuilt).forEach(k => delete _tabBuilt[k]);
}

function toggleGoal() {
  const d = document.getElementById('gdet');
  const b = document.getElementById('gexpbtn');
  const l = document.getElementById('gexplbl');
  d.classList.toggle('open');
  b.classList.toggle('open');
  l.textContent = d.classList.contains('open') ? 'hide details' : 'see details';
}

async function toggleTask(row) {
  const chk = row.querySelector('.chk');
  const dur = row.querySelector('.tdur');
  const dn  = row.classList.toggle('dn');
  chk.classList.toggle('dn', dn);
  chk.innerHTML = dn ? CHECK_SVG : '';
  if (dn  && !dur.textContent.includes('completed')) dur.textContent += ' · completed';
  if (!dn) dur.textContent = dur.textContent.replace(' · completed', '');

  const taskId = row.dataset.taskId;
  if (taskId) await toggleTaskInDb(taskId, dn);

  await updateSummary();
  if (_tabBuilt['progress']) {
    delete _tabBuilt['progress'];
    buildProgressTab();
  }
}

async function updateSummary() {
  const all  = document.querySelectorAll('#d-tasks .task-row').length;
  const done = document.querySelectorAll('#d-tasks .task-row.dn').length;
  document.getElementById('t-summary').textContent = `${done} / ${all} tasks completed`;
  await saveDailyProgress(all, done);
}

function toggleAdd() {
  const area = document.getElementById('addarea');
  area.classList.toggle('open');
  if (area.classList.contains('open')) document.getElementById('newt').focus();
}

async function addTask() {
  const input  = document.getElementById('newt');
  const select = document.getElementById('new-subject');
  const val    = input.value.trim();
  if (!val) return;
  const subject     = select.value;
  const subjectName = select.selectedOptions[0].textContent || 'Task';

  if (session?.id && getSupabase()) {
    try {
      await addTaskToDb(session.id, val, subject, '— min');
      await loadDashboardData(session.id, session.obData?.track || 'abroad');
      await buildDashboard(session);
      input.value = '';
      select.selectedIndex = 0;
      document.getElementById('addarea').classList.remove('open');
      return;
    } catch (e) {
      toast('Could not save task.');
    }
  }

  const row  = document.createElement('div');
  row.className = 'task-row';
  row.onclick   = function() { toggleTask(this); };
  row.innerHTML = `
    <div class="chk"></div>
    <div class="tinfo"><div class="tnm">${val}</div><div class="tdur">— min</div></div>
    <span class="tsubj ${subject}">${subjectName}</span>`;
  document.getElementById('d-tasks').appendChild(row);
  input.value = '';
  select.selectedIndex = 0;
  document.getElementById('addarea').classList.remove('open');
  await updateSummary();
}

const _tabBuilt = {};

function switchTab(tabName) {
  goTab(tabName);
  if (_tabBuilt[tabName]) return;
  _tabBuilt[tabName] = true;
  if (tabName === 'roadmap')  buildRoadmapTab();
  if (tabName === 'coach')    buildCoachTab();
  if (tabName === 'progress') buildProgressTab();
  if (tabName === 'profile')  buildProfileTab();
}

function buildRoadmapTab() {
  const user  = session || {};
  const ob    = user.obData || {};
  let track   = ob.track || 'abroad';
  if (!TRACK_MILESTONES[track]) track = 'abroad';

  document.getElementById('rm-sub').textContent =
    `${ob.goal || 'My Goal'} · ${ob.year || '?'} ${ob.sem || ''}`;

  const ms   = getMilestonesForDisplay(track);
  const bars = getBarsForDisplay(track, ob);
  const ICONS = ['🎯','📚','🔬','🏆','✈️'];

  let html = '';
  ms.forEach((m, i) => {
    const state    = m[1];
    const cls      = state === 'Complete' ? 'dn' : state === 'In Progress' ? 'ac' : 'ft';
    const barColor = bars[i] ? bars[i][1] : '#185FA5';
    const pct      = state === 'Complete' ? 100 : state === 'In Progress' ? 40 : 0;
    html += `
      <div class="rm-step">
        <div class="rm-left">
          <div class="rm-dot ${cls}">${state === 'Complete' ? CHECK_SVG : i + 1}</div>
          ${i < ms.length - 1 ? '<div class="rm-line"></div>' : ''}
        </div>
        <div class="rm-card">
          <div class="rm-card-top">
            <span class="rm-icon">${ICONS[i] || '📌'}</span>
            <div class="rm-info">
              <div class="rm-title">${m[0]}</div>
              <div class="rm-status ${cls}-txt">${state}</div>
            </div>
          </div>
          <div class="rm-bar-wrap">
            <div class="rm-bar"><div class="rm-bfill" style="width:${pct}%;background:${barColor};"></div></div>
            <span class="rm-pct">${pct}%</span>
          </div>
          ${bars[i] ? `<div class="rm-focus">Focus area: <strong>${bars[i][0]}</strong></div>` : ''}
        </div>
      </div>`;
  });

  html += `
    <div class="rm-step">
      <div class="rm-left"><div class="rm-dot goal">🎓</div></div>
      <div class="rm-card rm-final">
        <div class="rm-final-txt">${ob.goal || 'Final Goal'}</div>
        <div class="rm-final-sub">${ob.year || '?'} · ${ob.sem || ''}</div>
      </div>
    </div>`;

  document.getElementById('roadmap-body').innerHTML = html;
}

let coachMessages = [];

function buildCoachTab() {
  const user      = session || {};
  const firstName = user.name ? user.name.split(' ')[0] : 'Student';
  const hasAi     = isAiCoachAvailable();

  const statusEl = document.getElementById('coach-status');
  if (statusEl) {
    statusEl.textContent = hasAi ? '✅ AI Coach connected' : '⚠️ Configure Supabase in js/config.js';
    statusEl.style.color = hasAi ? 'var(--green)' : 'var(--amber)';
  }

  coachMessages = [{
    role: 'ai',
    text: hasAi
      ? `Hi ${firstName}! I'm your AI study coach. Ask me anything about your studies or goal! 🎯`
      : `Hi ${firstName}! Configure Supabase to unlock real AI coaching. For now I'll use coaching tips 💡`
  }];
  renderCoachMessages();
}

function renderCoachMessages() {
  const el = document.getElementById('coach-messages');
  if (!el) return;
  el.innerHTML = coachMessages.map(m => `
    <div class="cmsg ${m.role}">
      ${m.role === 'ai' ? '<div class="cmsg-avatar">🤖</div>' : ''}
      <div class="cmsg-bubble">${m.text}</div>
    </div>`).join('');
  el.scrollTop = el.scrollHeight;
}

async function sendCoachMessage() {
  const inp = document.getElementById('coach-in');
  const txt = inp ? inp.value.trim() : '';
  if (!txt) return;
  inp.value = '';

  coachMessages.push({ role: 'user', text: txt });
  coachMessages.push({ role: 'ai', text: '...' });
  renderCoachMessages();

  try {
    const reply = await askGemini(txt);
    coachMessages.pop();
    coachMessages.push({ role: 'ai', text: reply || CHAT_REPLIES[chatIndex++ % CHAT_REPLIES.length] });
  } catch (e) {
    coachMessages.pop();
    coachMessages.push({ role: 'ai', text: `⚠️ ${e.message || 'AI Coach unavailable.'}` });
  }
  renderCoachMessages();
}

async function buildProgressTab() {
  const history  = await getProgressHistory(7);
  const streak   = await getStreak();
  const today    = history[history.length - 1] || { total: 0, done: 0 };
  const todayPct = today.total > 0 ? Math.round((today.done / today.total) * 100) : 0;
  const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const r    = 42;
  const circ = Math.round(2 * Math.PI * r);
  const dash = Math.round(circ * (1 - todayPct / 100));

  const barsHtml = history.map(d => {
    const pct    = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
    const date   = new Date(d.date + 'T00:00:00');
    const label  = DAY_SHORT[date.getDay()];
    const isToday = d.date === new Date().toISOString().slice(0, 10);
    return `
      <div class="pg-bar-col">
        <div class="pg-bar-track">
          <div class="pg-bar-fill${isToday ? ' today' : ''}" style="height:${pct}%"></div>
        </div>
        <div class="pg-bar-lbl${isToday ? ' today' : ''}">${label}</div>
      </div>`;
  }).join('');

  document.getElementById('progress-body').innerHTML = `
    <div class="pg-streak-banner">
      <span class="pg-flame">🔥</span>
      <span class="pg-streak-num">${streak}</span>
      <span class="pg-streak-lbl">day streak</span>
    </div>
    <div class="pg-ring-wrap">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--bg2)" stroke-width="9"/>
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--blue)" stroke-width="9"
          stroke-linecap="round"
          stroke-dasharray="${circ}" stroke-dashoffset="${dash}"
          transform="rotate(-90 50 50)"
          style="transition:stroke-dashoffset .6s ease"/>
      </svg>
      <div class="pg-ring-center">
        <div class="pg-ring-pct">${todayPct}%</div>
        <div class="pg-ring-lbl">Today</div>
      </div>
    </div>
    <div class="pg-section-lbl">Last 7 days</div>
    <div class="pg-bars-wrap">${barsHtml}</div>
    <div class="pg-summary-row">
      <div class="pg-stat"><div class="pg-stat-val">${today.done}</div><div class="pg-stat-lbl">Done today</div></div>
      <div class="pg-stat"><div class="pg-stat-val">${history.filter(d => d.done > 0).length}</div><div class="pg-stat-lbl">Active days</div></div>
      <div class="pg-stat"><div class="pg-stat-val">${history.reduce((s,d) => s + d.done, 0)}</div><div class="pg-stat-lbl">Total (7d)</div></div>
    </div>`;
}

function buildProfileTab() {
  const user = session || {};
  const ob   = user.obData || {};
  const track = ob.track || 'abroad';
  const trackName = TRACK_NAMES[track] || 'Study Abroad';
  const initials  = user.initials || (user.name || 'ST').slice(0,2).toUpperCase();
  const avatarHtml = user.picture
    ? `<img src="${user.picture}" alt="" class="pf-avatar-img" />`
    : `<div class="pf-avatar">${initials}</div>`;

  document.getElementById('profile-body').innerHTML = `
    <div class="pf-hero">
      ${avatarHtml}
      <div class="pf-name">${user.name || 'Student'}</div>
      <div class="pf-email">${user.email || ''}</div>
    </div>
    <div class="pf-section">
      <div class="pf-label">GOAL</div>
      <div class="pf-goal-box">
        <div class="pf-goal-txt">${ob.goal || 'Not set'}</div>
        <div class="pf-goal-meta">${trackName} · ${ob.year || '?'} ${ob.sem || ''} · ${ob.hours || '?'} / day</div>
      </div>
    </div>
    <div class="pf-section">
      <div class="pf-label">AI COACH</div>
      <div class="pf-api-hint">${isAiCoachAvailable() ? '✅ Connected via Supabase Edge Function' : '⚠️ Set Supabase anon key in js/config.js'}</div>
    </div>
    <div class="pf-section">
      <div class="pf-label">ACCOUNT</div>
      <button class="pf-btn outline" onclick="toast('Re-onboarding coming soon!')">✏️ Edit goals &amp; preferences</button>
      <button class="pf-btn danger" onclick="doLogout()">Sign out</button>
    </div>
    <div style="height:16px;"></div>`;
}
