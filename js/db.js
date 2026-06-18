
/* ═══════════════════════════════════
   db.js — Supabase data layer
   ═══════════════════════════════════ */

let dashboardData = {
  milestones: [],
  tasks: [],
  capabilities: [],
  source: 'static',
};

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function obDataFromRow(row) {
  if (!row) return null;
  return {
    grade: row.grade || '',
    track: row.track || 'abroad',
    goal: row.goal || '',
    year: row.target_year || '',
    sem: row.target_sem || '',
    level: row.subject_levels || {},
    hours: row.daily_hours || '',
  };
}

async function buildSessionFromSupabase(authUser) {
  const sb = getSupabase();
  if (!sb || !authUser) return null;

  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  const { data: onboarding } = await sb
    .from('onboarding_profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .maybeSingle();

  const meta = authUser.user_metadata || {};
  const name = profile?.name || meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Student';
  const initials = profile?.initials || name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return {
    id: authUser.id,
    name,
    email: profile?.email || authUser.email || '',
    picture: profile?.avatar_url || meta.avatar_url || meta.picture || '',
    initials,
    onboarded: profile?.onboarded ?? false,
    obData: obDataFromRow(onboarding),
  };
}

async function ensureProfile(authUser) {
  const sb = getSupabase();
  if (!sb || !authUser) return;
  const meta = authUser.user_metadata || {};
  const name = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Student';
  await sb.from('profiles').upsert({
    id: authUser.id,
    name,
    email: authUser.email,
    avatar_url: meta.avatar_url || meta.picture || null,
    initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    updated_at: new Date().toISOString(),
  });
}

async function saveOnboardingProfile(userId, ob) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from('onboarding_profiles').upsert({
    user_id: userId,
    grade: ob.grade,
    track: ob.track || 'abroad',
    goal: ob.goal,
    target_year: ob.year ? parseInt(ob.year, 10) : null,
    target_sem: ob.sem,
    subject_levels: ob.level || {},
    daily_hours: ob.hours,
    updated_at: new Date().toISOString(),
  });
  await sb.from('profiles').update({ onboarded: true, updated_at: new Date().toISOString() }).eq('id', userId);
}

async function loadDashboardData(userId, track) {
  const sb = getSupabase();
  if (!sb) {
    dashboardData = { milestones: [], tasks: [], capabilities: [], source: 'static' };
    return dashboardData;
  }

  const today = todayDateStr();

  const { data: milestones } = await sb
    .from('milestones')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order');

  const { data: tasks } = await sb
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('task_date', today)
    .order('sort_order');

  if (milestones?.length) {
    dashboardData.milestones = milestones;
    dashboardData.tasks = tasks || [];
    dashboardData.source = 'db';

    const { data: roadmap } = await sb
      .from('roadmaps')
      .select('raw_json')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    dashboardData.capabilities = roadmap?.raw_json?.capabilities || TRACK_CAPS[track] || TRACK_CAPS.abroad;
    return dashboardData;
  }

  dashboardData = { milestones: [], tasks: [], capabilities: [], source: 'static' };
  return dashboardData;
}

async function generateRoadmapViaEdge(ob) {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase not configured' };

  const { data, error } = await sb.functions.invoke('generate-roadmap', {
    body: { onboarding: ob },
  });

  if (error) return { ok: false, error: error.message };
  if (data?.error) return { ok: false, error: data.error };
  return { ok: true, data };
}

function getMilestonesForDisplay(track) {
  if (dashboardData.milestones?.length) {
    return dashboardData.milestones.map(m => [m.title, m.status]);
  }
  return TRACK_MILESTONES[track] || TRACK_MILESTONES.abroad;
}

function getBarsForDisplay(track, ob) {
  if (dashboardData.milestones?.length) {
    return dashboardData.milestones.map(m => [m.focus_area || m.title, m.bar_color || '#185FA5']);
  }
  return TRACK_BARS[track] || TRACK_BARS.abroad;
}

function getTasksForDisplay(track) {
  if (dashboardData.tasks?.length) {
    return dashboardData.tasks.map(t => ({
      id: t.id,
      n: t.title,
      d: t.duration || '—',
      s: t.subject || 's-eng',
      done: t.done,
    }));
  }
  return (TRACK_TASKS[track] || TRACK_TASKS.abroad).map((t, i) => ({ ...t, done: i < 1 }));
}

function getCapsForDisplay(track) {
  if (dashboardData.capabilities?.length) return dashboardData.capabilities;
  return TRACK_CAPS[track] || TRACK_CAPS.abroad;
}

function calcOverallProgress(milestones) {
  if (!milestones?.length) return 0;
  const complete = milestones.filter(m => {
    const status = Array.isArray(m) ? m[1] : m.status;
    return status === 'Complete';
  }).length;
  const inProgress = milestones.filter(m => {
    const status = Array.isArray(m) ? m[1] : m.status;
    return status === 'In Progress';
  }).length;
  return Math.min(100, Math.round(((complete + inProgress * 0.4) / milestones.length) * 100));
}

async function toggleTaskInDb(taskId, done) {
  const sb = getSupabase();
  if (!sb || !taskId) return;
  await sb.from('daily_tasks').update({ done, updated_at: new Date().toISOString() }).eq('id', taskId);
}

async function addTaskToDb(userId, title, subject, duration) {
  const sb = getSupabase();
  if (!sb) return null;
  const today = todayDateStr();
  const sortOrder = dashboardData.tasks?.length || 0;
  const { data, error } = await sb.from('daily_tasks').insert({
    user_id: userId,
    task_date: today,
    title,
    subject,
    duration: duration || '—',
    source: 'user',
    sort_order: sortOrder,
  }).select().single();
  if (error) throw error;
  if (data) dashboardData.tasks.push(data);
  return data;
}

async function saveDailyProgressToDb(userId, total, done) {
  const sb = getSupabase();
  if (!sb || !userId) return;
  const today = todayDateStr();
  await sb.from('daily_progress').upsert({
    user_id: userId,
    progress_date: today,
    total_tasks: total,
    done_tasks: done,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,progress_date' });
}

async function getProgressHistoryFromDb(userId, days) {
  const sb = getSupabase();
  if (!sb || !userId) return null;

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startStr = start.toISOString().slice(0, 10);

  const { data } = await sb
    .from('daily_progress')
    .select('progress_date, total_tasks, done_tasks')
    .eq('user_id', userId)
    .gte('progress_date', startStr)
    .order('progress_date');

  const map = {};
  (data || []).forEach(row => {
    map[row.progress_date] = { total: row.total_tasks, done: row.done_tasks };
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, ...(map[key] || { total: 0, done: 0 }) });
  }
  return result;
}

async function getStreakFromDb(userId) {
  const sb = getSupabase();
  if (!sb || !userId) return 0;

  const { data } = await sb
    .from('daily_progress')
    .select('progress_date, done_tasks')
    .eq('user_id', userId)
    .gt('done_tasks', 0)
    .order('progress_date', { ascending: false })
    .limit(365);

  if (!data?.length) return 0;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = data.find(r => r.progress_date === key);
    if (row && row.done_tasks > 0) streak++;
    else break;
  }
  return streak;
}
