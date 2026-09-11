// public/js/auth.js
// Lógica de login, logout y verificación de sesión

// ============ HANDLERS ============
async function handleAuth(e) {
  e.preventDefault();
  const username = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const msg = document.getElementById('authMsg');

  try {
    const data = await API.login(username, password);
    document.getElementById('userName').textContent = data.user.name;
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    await loadMonth();
  } catch (err) {
    console.error(err);
    msg.style.color = 'var(--red)';
    msg.textContent = err.message || 'Error de conexión';
  }
}

async function logout() {
  await API.logout();
  BUCK.monthData = null;
  BUCK.currentUser = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('authForm').reset();
  document.getElementById('authMsg').textContent = '';
}

async function checkSession() {
  document.getElementById('loadingScreen').classList.remove('hidden');

  const session = await API.checkSession();

  if (session) {
    BUCK.currentUser = session.user;
    document.getElementById('userName').textContent = session.user.name || 'Administrador';
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('loadingScreen').classList.add('hidden');
    await loadMonth();
  } else {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
  }
}

// ============ EXPORTAR ============
window.handleAuth = handleAuth;
window.logout = logout;
window.checkSession = checkSession;