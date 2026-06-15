
/* ═══════════════════════════════════
   ai.js — Gemini API integration
   ═══════════════════════════════════ */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/* ── Key management ── */
function getGeminiKey()      { return localStorage.getItem('afp_gemini_key') || ''; }
function setGeminiKey(key)   { localStorage.setItem('afp_gemini_key', key.trim()); }
function clearGeminiKey()    { localStorage.removeItem('afp_gemini_key'); }

/* ── Build a context prompt from the current session ── */
function buildSystemContext() {
  const user = session || {};
  const ob   = user.obData || {};
  const track = ob.track || 'abroad';
  const trackName = (typeof TRACK_NAMES !== 'undefined' && TRACK_NAMES[track]) || track;
  const tasks = (typeof TRACK_TASKS !== 'undefined' && TRACK_TASKS[track]) || [];
  const taskList = tasks.map(t => t.n).join(', ') || 'none set';

  return `You are an AI study coach inside "AI Future Planner", a student planning app.
Student profile:
- Name: ${user.name || 'Student'}
- Goal: ${ob.goal || 'Not set'}
- Academic track: ${trackName}
- Target: ${ob.year || '?'} ${ob.sem || ''}
- Daily study hours: ${ob.hours || 'Not set'}
- Today's tasks: ${taskList}

Your role: Give concise (2-3 sentences max), motivating, actionable advice specific to this student's goal and tasks.
Always be warm, supportive, and specific. Never be generic.`;
}

/* ── Core API call ── */
async function askGemini(userMessage) {
  const key = getGeminiKey();
  if (!key) return null; // caller handles fallback

  const prompt = buildSystemContext() + '\n\nStudent: "' + userMessage + '"\n\nCoach:';

  const res = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 200 }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No response received.';
}

/* ── Save today's progress to localStorage ── */
function saveDailyProgress(total, done) {
  const today = new Date().toISOString().slice(0, 10);
  const prog  = JSON.parse(localStorage.getItem('afp_progress') || '{}');
  prog[today] = { total, done };
  // keep only last 30 days
  const keys = Object.keys(prog).sort();
  if (keys.length > 30) delete prog[keys[0]];
  localStorage.setItem('afp_progress', JSON.stringify(prog));
}

/* ── Get progress history (last N days) ── */
function getProgressHistory(days) {
  const prog = JSON.parse(localStorage.getItem('afp_progress') || '{}');
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, ...(prog[key] || { total: 0, done: 0 }) });
  }
  return result;
}

/* ── Calculate streak (consecutive days with ≥1 done) ── */
function getStreak() {
  const prog = JSON.parse(localStorage.getItem('afp_progress') || '{}');
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (prog[key] && prog[key].done > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
