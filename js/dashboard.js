
/* ═══════════════════════════════════
   dashboard.js — Build & interact with the dashboard
   ═══════════════════════════════════ */

const CHAT_REPLIES = [
  '네! 오늘 어려운 부분은 내일로 미루고 집중할 과목을 먼저 해결해요. 💪',
  '현재 진행 상황을 보면 잘 하고 계세요! 이 속도라면 목표 달성 충분해요.',
  '하루 빠지는 건 괜찮아요. 빠진 분량은 3일에 걸쳐 나눠서 채울게요.',
  '가장 약한 부분에 집중하는 게 가장 빠른 성장 방법이에요!',
  '목표까지 꾸준히 가는 게 중요해요. 오늘도 한 걸음씩 나아가봐요 🎯',
];
let chatIndex = 0;

/* ── Build the entire dashboard from user + obData ── */
function buildDashboard(user) {
  const ob    = (user && user.obData) || { track:'abroad', goal:'My Goal', year:2027, sem:'하반기', level:{}, hours:'3~4시간' };
  let   track = ob.track || 'abroad';

  // Safety guard — fall back to 'abroad' if track key is missing
  if (!TRACK_CAPS[track])       track = 'abroad';
  if (!TRACK_MILESTONES[track]) track = 'abroad';
  if (!TRACK_BARS[track])       track = 'abroad';
  if (!TRACK_TASKS[track])      track = 'abroad';

  const firstName = (user && user.name) ? user.name.split(' ')[0] : 'Student';
  const initials  = (user && user.initials) || firstName.slice(0, 2).toUpperCase();

  // ── Header ──
  document.getElementById('d-avatar').textContent = initials;
  document.getElementById('d-name').textContent   = `Hi, ${firstName} 👋`;

  const now       = new Date();
  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MON_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('d-date').textContent = `${DAY_NAMES[now.getDay()]}, ${MON_NAMES[now.getMonth()]} ${now.getDate()} · Day 1 streak`;

  // ── Goal card ──
  document.getElementById('d-goal-title').textContent = ob.goal || 'My Goal';
  document.getElementById('d-goal-sub').textContent   = `${TRACK_NAMES[track]} · ${ob.year || 2027}년 ${ob.sem || '하반기'}`;

  document.getElementById('d-caps').innerHTML = TRACK_CAPS[track]
    .map(c => `<span class="gtag">${c}</span>`)
    .join('');

  const targetDate = new Date(ob.year || 2027, ob.sem === '상반기' ? 5 : 11, 1);
  const monthsLeft = Math.max(1, Math.round((targetDate - now) / (1000 * 60 * 60 * 24 * 30)));
  document.getElementById('d-stats').innerHTML = `
    <div class="gstat"><div class="gstat-val">${monthsLeft}개월</div><div class="gstat-lbl">남은 기간</div></div>
    <div class="gstat"><div class="gstat-val">5%</div><div class="gstat-lbl">전체 진행률</div></div>
    <div class="gstat"><div class="gstat-val">${ob.year || 2027}</div><div class="gstat-lbl">목표 연도</div></div>`;

  // ── Stepping stones ──
  const ms = TRACK_MILESTONES[track];
  let stHTML = '';
  ms.forEach((m, i) => {
    const state = m[1] === '완료' ? 'dn' : m[1] === '진행 중' ? 'ac' : 'ft';
    if (i > 0) {
      const prevState = ms[i-1][1] === '완료' ? 'dn' : ms[i-1][1] === '진행 중' ? 'ac' : 'ft';
      stHTML += `<div class="sline ${prevState}"></div>`;
    }
    stHTML += `<div class="stone"><div class="scircle ${state}">${state === 'dn' ? CHECK_SVG : i + 1}</div><div class="slabel">${m[0]}</div></div>`;
  });
  stHTML += `<div class="sline ft"></div><div class="stone"><div class="scircle ft" style="background:#FAEEDA;border-color:#EF9F27;color:#633806;font-size:15px;">🎓</div><div class="slabel">최종 목표</div></div>`;
  document.getElementById('d-stones').innerHTML = stHTML;

  // ── Milestone progress bars ──
  const bars      = TRACK_BARS[track];
  const levelKeys = Object.keys(ob.level || {});
  document.getElementById('d-bars').innerHTML = bars.map((b, i) => {
    const subj = levelKeys[i] || b[0];
    const raw  = (ob.level && ob.level[subj]) || 3;
    const pct  = Math.round((raw / 5) * 60) + 10;   // maps 1–5 → 22–70 %
    return `
      <div class="ms-item">
        <div class="ms-row">
          <span class="ms-name">${b[0]}</span>
          <span class="ms-pct" style="color:${b[1]};">${pct}%</span>
        </div>
        <div class="bar"><div class="bfill" style="width:${pct}%;background:${b[1]};"></div></div>
      </div>`;
  }).join('');

  // ── Today's tasks ──
  const tasks = TRACK_TASKS[track];
  document.getElementById('d-tasks').innerHTML = tasks.map((t, i) => {
    const done  = i < 1;
    const sname = t.s.replace('s-','').replace('math','Math').replace('cs','CS')
                    .replace('sat','SAT').replace('sci','Science').replace('eng','English')
                    .replace('kor','국어').replace('soc','사회');
    return `
      <div class="task-row${done ? ' dn' : ''}" onclick="toggleTask(this)">
        <div class="chk${done ? ' dn' : ''}">${done ? CHECK_SVG : ''}</div>
        <div class="tinfo">
          <div class="tnm">${t.n}</div>
          <div class="tdur">${t.d}${done ? ' · completed' : ''}</div>
        </div>
        <span class="tsubj ${t.s}">${sname}</span>
      </div>`;
  }).join('');
  updateSummary();

  // ── AI chat greeting ──
  document.getElementById('chat-prev').textContent = `${firstName}님의 목표 분석이 완료됐어요! 오늘 첫 번째 학습을 시작해볼까요? 💪`;
}

/* ── Goal card expand/collapse ── */
function toggleGoal() {
  const d = document.getElementById('gdet');
  const b = document.getElementById('gexpbtn');
  const l = document.getElementById('gexplbl');
  d.classList.toggle('open');
  b.classList.toggle('open');
  l.textContent = d.classList.contains('open') ? 'hide details' : 'see details';
}

/* ── Task interactions ── */
function toggleTask(row) {
  const chk = row.querySelector('.chk');
  const dur = row.querySelector('.tdur');
  const dn  = row.classList.toggle('dn');
  chk.classList.toggle('dn', dn);
  chk.innerHTML = dn ? CHECK_SVG : '';
  if (dn  && !dur.textContent.includes('completed')) dur.textContent += ' · completed';
  if (!dn) dur.textContent = dur.textContent.replace(' · completed', '');
  updateSummary();
}

function updateSummary() {
  const all  = document.querySelectorAll('#d-tasks .task-row').length;
  const done = document.querySelectorAll('#d-tasks .task-row.dn').length;
  document.getElementById('t-summary').textContent = `${done} / ${all} tasks completed`;
}

function toggleAdd() {
  const area = document.getElementById('addarea');
  area.classList.toggle('open');
  if (area.classList.contains('open')) document.getElementById('newt').focus();
}

function addTask() {
  const input = document.getElementById('newt');
  const val   = input.value.trim();
  if (!val) return;

  const idx  = Math.floor(Math.random() * TASK_SUBJECT_LIST.length);
  const row  = document.createElement('div');
  row.className = 'task-row';
  row.onclick   = function() { toggleTask(this); };
  row.innerHTML = `
    <div class="chk"></div>
    <div class="tinfo"><div class="tnm">${val}</div><div class="tdur">— min</div></div>
    <span class="tsubj ${TASK_SUBJECT_LIST[idx]}">${TASK_SUBJECT_NAMES[idx]}</span>`;
  document.getElementById('d-tasks').appendChild(row);
  input.value = '';
  document.getElementById('addarea').classList.remove('open');
  updateSummary();
}

/* ── AI chat ── */
function sendChat() {
  const inp = document.getElementById('chat-in');
  if (!inp.value.trim()) return;
  inp.value = '';
  document.getElementById('chat-prev').textContent = '생각 중...';
  setTimeout(() => {
    document.getElementById('chat-prev').textContent = CHAT_REPLIES[chatIndex % CHAT_REPLIES.length];
    chatIndex++;
  }, 700);
}
