
/* ═══════════════════════════════════
   auth.js — Supabase Auth (Google + email/password)
   ═══════════════════════════════════ */

let session = null;
let selGender = '';

function authReady() {
  return isSupabaseConfigured() && !!getSupabase();
}

function providerLoginHint(provider) {
  if (!authReady()) {
    toast('Set your Supabase anon key in js/config.js first.');
    return true;
  }
  if (location.protocol === 'file:') {
    toast(`${provider} login needs http://localhost or a hosted domain.`);
    return true;
  }
  return false;
}

async function routeAfterAuth(user) {
  session = await buildSessionFromSupabase(user);
  if (!session) return;
  if (session.onboarded && session.obData) {
    await loadDashboardData(session.id, session.obData.track || 'abroad');
    await buildDashboard(session);
    go('s-dashboard');
  } else {
    go('s-ob1');
  }
}

async function initAuthListener() {
  const sb = initSupabase();
  if (!sb) return;

  sb.auth.onAuthStateChange(async (event, authSession) => {
    if (event === 'SIGNED_IN' && authSession?.user) {
      await ensureProfile(authSession.user);
      session = await buildSessionFromSupabase(authSession.user);
    }
    if (event === 'SIGNED_OUT') {
      session = null;
    }
  });
}

async function restoreSession() {
  const sb = getSupabase();
  if (!sb) return false;

  const { data: { session: authSession } } = await sb.auth.getSession();
  if (!authSession?.user) return false;

  await ensureProfile(authSession.user);
  session = await buildSessionFromSupabase(authSession.user);
  if (!session) return false;

  if (session.onboarded && session.obData) {
    await loadDashboardData(session.id, session.obData.track || 'abroad');
    await buildDashboard(session);
    go('s-dashboard');
  } else {
    go('s-ob1');
  }
  return true;
}

/* ── Login ── */
async function doLogin() {
  if (!authReady()) { providerLoginHint('Email'); return; }

  const email = document.getElementById('li-email').value.trim();
  const pw    = document.getElementById('li-pw').value;

  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
  showErr('li-err', !!error);
  if (error) {
    document.getElementById('li-err').textContent = error.message || 'Email or password is incorrect.';
    return;
  }
  await routeAfterAuth(data.user);
}

async function socialLogin(provider) {
  if (providerLoginHint(provider)) return;

  if (provider === 'Google') {
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) toast(error.message || 'Google sign-in failed.');
  }
}

/* ── Register ── */
function selectGender(g) {
  selGender = g;
  ['m', 'f', 'o'].forEach(x => document.getElementById('g-' + x).classList.remove('sel'));
  document.getElementById('g-' + g).classList.add('sel');
}

function checkPw() {
  const pw = document.getElementById('r-pw').value;
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  const bar  = document.getElementById('pwbar');
  const hint = document.getElementById('pwhint');
  const cols = ['#E24B4A', '#EF9F27', '#1D9E75'];
  const lbs  = ['Weak', 'Fair', 'Strong'];

  if (!pw.length) { bar.style.width = '0'; hint.textContent = ''; return; }
  bar.style.width      = (score * 33) + '%';
  bar.style.background = cols[score - 1] || cols[0];
  hint.textContent     = lbs[score - 1]  || 'Weak';
  hint.style.color     = cols[score - 1] || cols[0];
}

async function doRegister() {
  if (!authReady()) { providerLoginHint('Register'); return; }

  const name  = document.getElementById('r-name').value.trim();
  const id    = document.getElementById('r-id').value.trim();
  const pw    = document.getElementById('r-pw').value;
  const pw2   = document.getElementById('r-pw2').value;
  const email = document.getElementById('r-email').value.trim();
  const dob   = document.getElementById('r-dob').value;

  let ok = true;
  const chk = (errId, cond) => { showErr(errId, !cond); if (!cond) ok = false; };

  chk('e-name',   !!name);
  chk('e-id',     /^[a-zA-Z0-9]{4,20}$/.test(id));
  chk('e-pw',     pw.length >= 8 && /[0-9]/.test(pw));
  chk('e-pw2',    pw === pw2);
  chk('e-email',  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  chk('e-dob',    !!dob);
  chk('e-gender', !!selGender);
  if (!ok) return;

  const sb = getSupabase();
  const { data, error } = await sb.auth.signUp({
    email,
    password: pw,
    options: {
      data: {
        full_name: name,
        username: id,
        dob,
        gender: selGender,
      },
    },
  });

  if (error) {
    toast(error.message || 'Registration failed.');
    return;
  }

  if (data.user) {
    await ensureProfile(data.user);
    session = await buildSessionFromSupabase(data.user);
    toast('Account created! Welcome 🎉');
    setTimeout(() => go('s-ob1'), 700);
  }
}

/* ── Logout ── */
async function doLogout() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  session = null;
  resetObData();
  dashboardData = { milestones: [], tasks: [], capabilities: [], source: 'static' };
  go('s-login');
  toast('Logged out successfully.');
}

window.addEventListener('load', () => initAuthListener());
