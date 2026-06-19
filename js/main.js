
/* ═══════════════════════════════════
   main.js — Bootstrap / initialization
   ═══════════════════════════════════ */

(async function init() {
  initSupabase();

  if (isSupabaseConfigured()) {
    const restored = await restoreSession();
    if (restored) return;
  }

  // Legacy localStorage fallback (pre-Supabase sessions)
  const raw = localStorage.getItem('afp_sess');
  if (!raw) return;

  try {
    const user = JSON.parse(raw);
    session = user;
    if (user.onboarded) {
      await buildDashboard(user);
      go('s-dashboard');
    } else {
      go('s-ob1');
    }
  } catch (e) {
    localStorage.removeItem('afp_sess');
  }
})();
