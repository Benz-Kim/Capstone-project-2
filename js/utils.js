
/* ═══════════════════════════════════
   utils.js — Shared utility helpers
   ═══════════════════════════════════ */

/** Switch visible screen */
function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/** Show a short toast notification */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2600);
}

/** Toggle password visibility */
function toggleEye(inputId) {
  const inp = document.getElementById(inputId);
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

/** Show / hide an inline error element */
function showErr(id, visible) {
  document.getElementById(id).classList.toggle('on', visible);
}
