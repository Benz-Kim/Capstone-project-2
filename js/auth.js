
/* ═══════════════════════════════════
   auth.js — Login, Register, Logout
   ═══════════════════════════════════ */

/* ── State ── */
let users   = JSON.parse(localStorage.getItem('afp_users') || '[]');
let session = null;  // populated by main.js after data is ready
let selGender = '';
let googleTokenClient = null;

const SOCIAL_AUTH = {
  googleClientId: '999502593757-qhl0jkggg01k56bb0nlsmbbu06ehslvr.apps.googleusercontent.com',
};

function socialAuthReady() {
  return location.protocol !== 'file:' && !!SOCIAL_AUTH.googleClientId;
}

function providerLoginHint(provider) {
  if (location.protocol === 'file:') {
    toast(`${provider} login needs the app to run from http://localhost or a hosted domain.`);
    return true;
  }
  return false;
}

function providerUserId(provider, value) {
  return `${provider.toLowerCase()}_${value}`;
}

function decodeJwt(token) {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(atob(payload).split('').map(char => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
  return JSON.parse(json);
}

function upsertSocialSession(provider, providerId, name, email, picture) {
  const id = providerUserId(provider, providerId);
  let user = users.find(u => u.id === id || (u.provider === provider && u.providerId === providerId));

  if (!user) {
    const initials = (name || provider).split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    user = {
      name: name || `${provider} User`,
      id,
      pw: '',
      email: email || '',
      provider,
      providerId,
      picture: picture || '',
      initials,
      onboarded: false,
    };
    users.push(user);
  } else {
    user.name = name || user.name || `${provider} User`;
    user.email = email || user.email || '';
    user.picture = picture || user.picture || '';
    user.provider = provider;
    user.providerId = providerId;
    user.initials = (user.name || provider).split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  }

  localStorage.setItem('afp_users', JSON.stringify(users));
  session = user;
  localStorage.setItem('afp_sess', JSON.stringify(user));
  return user;
}

function initGoogleAuth() {
  if (!window.google?.accounts?.oauth2 || !SOCIAL_AUTH.googleClientId) return;
  googleTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: SOCIAL_AUTH.googleClientId,
    scope: 'openid profile email',
    callback: handleGoogleToken,
  });
}

async function handleGoogleToken(response) {
  if (response.error) {
    toast('Google sign-in was cancelled or failed.');
    return;
  }

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${response.access_token}` },
    });
    if (!res.ok) throw new Error('Unable to read Google profile.');
    const profile = await res.json();
    const user = upsertSocialSession('Google', profile.sub, profile.name || 'Google User', profile.email || '', profile.picture || '');
    toast('Signed in with Google.');
    user.onboarded ? (buildDashboard(user), go('s-dashboard')) : go('s-ob1');
  } catch (error) {
    toast('Google sign-in failed.');
  }
}

function initSocialProviders() {
  initGoogleAuth();
}

/* ── Login ── */
function doLogin() {
  const id = document.getElementById('li-id').value.trim();
  const pw = document.getElementById('li-pw').value;
  const user = users.find(u => u.id === id && u.pw === pw);
  showErr('li-err', !user);
  if (!user) return;

  session = user;
  localStorage.setItem('afp_sess', JSON.stringify(user));
  user.onboarded ? (buildDashboard(user), go('s-dashboard')) : go('s-ob1');
}

async function socialLogin(provider) {
  if (providerLoginHint(provider)) return;

  if (provider === 'Google') {
    if (!googleTokenClient) {
      toast('Google login is not configured yet.');
      return;
    }
    googleTokenClient.requestAccessToken({ prompt: 'select_account' });
    return;
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

function doRegister() {
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

  if (users.find(u => u.id === id)) {
    showErr('e-id', true);
    document.getElementById('e-id').textContent = 'This ID is already in use.';
    return;
  }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const user = { name, id, pw, email, dob, gender: selGender, initials, onboarded: false };
  users.push(user);
  localStorage.setItem('afp_users', JSON.stringify(users));

  session = user;
  localStorage.setItem('afp_sess', JSON.stringify(user));
  toast('Account created! Welcome 🎉');
  setTimeout(() => go('s-ob1'), 700);
}

/* ── Logout ── */
function doLogout() {
  localStorage.removeItem('afp_sess');
  session = null;
  resetObData();
  go('s-login');
  toast('Logged out successfully.');
}

window.addEventListener('load', initSocialProviders);
