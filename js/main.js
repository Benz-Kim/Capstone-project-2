
/* ═══════════════════════════════════
   main.js — Bootstrap / initialization
   (runs last, after all other scripts)
   ═══════════════════════════════════ */

(function init() {
  const raw = localStorage.getItem('afp_sess');
  if (!raw) return; // no session → stay on login screen

  try {
    const user = JSON.parse(raw);
    session = user;
    if (user.onboarded) {
      buildDashboard(user);
      go('s-dashboard');
    } else {
      go('s-ob1');
    }
  } catch (e) {
    localStorage.removeItem('afp_sess'); // corrupted session → clear
  }
})();
