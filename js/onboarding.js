
/* ═══════════════════════════════════
   onboarding.js — 6-step onboarding flow
   ═══════════════════════════════════ */

/* ── State ── */
let obData = { grade: '', track: '', goal: '', year: '', sem: '', level: {}, hours: '' };
let selYear = '';
let selSem  = '';

function resetObData() {
  obData = { grade: '', track: '', goal: '', year: '', sem: '', level: {}, hours: '' };
  selYear = '';
  selSem  = '';
}

/* ── Navigation ── */
function goOb(step) {
  go('s-ob' + step);
  if (step === 3) buildPresets();
  if (step === 4) buildYears();
  if (step === 5) buildLevels();
}

/* ── Step 1: Grade ── */
function selGrade(val, el) {
  obData.grade = val;
  document.querySelectorAll('#s-ob1 .grade-item').forEach(e => e.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('next1').disabled = false;
}

/* ── Step 2: Track ── */
function selTrack(val, el) {
  obData.track = val;
  document.querySelectorAll('#s-ob2 .opt-card').forEach(e => e.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('next2').disabled = false;
}

/* ── Step 3: Goal ── */
function buildPresets() {
  const list = TRACK_PRESETS[obData.track] || TRACK_PRESETS['abroad'];
  document.getElementById('preset-wrap').innerHTML = list
    .map(p => `<button class="preset-tag" onclick="setGoal(this)">${p}</button>`)
    .join('');
}

function setGoal(btn) {
  document.getElementById('ob-goal').value = btn.textContent;
  document.getElementById('next3').disabled = false;
}

function onGoalInput() {
  document.getElementById('next3').disabled = !document.getElementById('ob-goal').value.trim();
}

/* ── Step 4: Target date ── */
function buildYears() {
  const now  = new Date().getFullYear();
  const grid = document.getElementById('year-grid');
  grid.innerHTML = '';
  for (let y = now; y <= now + 5; y++) {
    const btn = document.createElement('button');
    btn.className   = 'year-btn';
    btn.textContent = y;
    btn.onclick = () => {
      selYear = y;
      document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      checkYearSem();
    };
    grid.appendChild(btn);
  }
}

function pickSem(val, btn) {
  selSem = val;
  document.querySelectorAll('.sem-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  checkYearSem();
}

function checkYearSem() {
  if (selYear && selSem) {
    obData.year = selYear;
    obData.sem  = selSem;
    document.getElementById('next4').disabled = false;
  }
}

/* ── Step 5: Current level ── */
function buildLevels() {
  const subjects = TRACK_SUBJECTS[obData.track] || TRACK_SUBJECTS['abroad'];
  let html = '<div style="padding:0 0 12px;">';
  subjects.forEach(subj => {
    if (!obData.level[subj]) obData.level[subj] = 3;
    const cur = obData.level[subj];
    html += `
      <div class="level-item">
        <div class="level-row">
          <span class="level-subj">${subj}</span>
          <span class="level-val" id="lv-${subj}">${LVL_LABELS[cur - 1]}</span>
        </div>
        <div class="level-btns">
          ${[1,2,3,4,5].map(n =>
            `<button class="lvl-btn${cur === n ? ' sel' : ''}" data-subj="${subj}" data-n="${n}" onclick="setLevel(this)">
              ${LVL_LABELS[n - 1]}
            </button>`
          ).join('')}
        </div>
      </div>`;
  });
  html += '</div>';
  document.getElementById('level-body').innerHTML = html;
}

function setLevel(btn) {
  const subj = btn.dataset.subj;
  const n    = parseInt(btn.dataset.n);
  obData.level[subj] = n;
  btn.closest('.level-btns').querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  document.getElementById('lv-' + subj).textContent = LVL_LABELS[n - 1];
}

/* ── Step 6: Daily hours ── */
function selHours(val, el) {
  obData.hours = val;
  document.querySelectorAll('.hour-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('next6').disabled = false;
}

/* ── Analyzing & finalize ── */
function startAnalyzing() {
  obData.goal = document.getElementById('ob-goal').value.trim();
  go('s-analyzing');

  ['an1','an2','an3','an4','an5'].forEach((id, i) => {
    setTimeout(() => document.getElementById(id).classList.add('done'), 700 * (i + 1));
  });

  setTimeout(finalizeOnboarding, 4200);
}

function finalizeOnboarding() {
  if (session) {
    session.obData    = obData;
    session.onboarded = true;
    const idx = users.findIndex(u => u.id === session.id);
    if (idx >= 0) { users[idx] = session; localStorage.setItem('afp_users', JSON.stringify(users)); }
    localStorage.setItem('afp_sess', JSON.stringify(session));
  }
  buildDashboard(session);
  go('s-dashboard');
}
