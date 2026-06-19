
/* ═══════════════════════════════════
   ai.js — AI Coach via Supabase Edge Function
   ═══════════════════════════════════ */

async function askGemini(userMessage) {
  const sb = getSupabase();
  if (!sb || !isSupabaseConfigured()) return null;

  const { data, error } = await sb.functions.invoke('ai-coach', {
    body: { message: userMessage },
  });

  if (error) throw new Error(error.message || 'AI Coach request failed');
  if (data?.error) throw new Error(data.error);
  return data?.reply?.trim() || null;
}

function isAiCoachAvailable() {
  return isSupabaseConfigured();
}

/* ── Progress helpers (DB-backed when session exists) ── */
async function saveDailyProgress(total, done) {
  if (session?.id && getSupabase()) {
    await saveDailyProgressToDb(session.id, total, done);
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const prog  = JSON.parse(localStorage.getItem('afp_progress') || '{}');
  prog[today] = { total, done };
  const keys = Object.keys(prog).sort();
  if (keys.length > 30) delete prog[keys[0]];
  localStorage.setItem('afp_progress', JSON.stringify(prog));
}

async function getProgressHistory(days) {
  if (session?.id && getSupabase()) {
    const dbHistory = await getProgressHistoryFromDb(session.id, days);
    if (dbHistory) return dbHistory;
  }
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

async function getStreak() {
  if (session?.id && getSupabase()) {
    return await getStreakFromDb(session.id);
  }
  const prog = JSON.parse(localStorage.getItem('afp_progress') || '{}');
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (prog[key] && prog[key].done > 0) streak++;
    else break;
  }
  return streak;
}
