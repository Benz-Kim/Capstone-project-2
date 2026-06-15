
/* ═══════════════════════════════════
   main.js — Bootstrap / initialization
   (runs last, after all other scripts)
   ═══════════════════════════════════ */

(function init() {
  // Initialize dark mode
  const isDarkMode = localStorage.getItem("afp_dark_mode") === "true";
  if (isDarkMode) {
    document.documentElement.style.colorScheme = "dark";
  }
  
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
