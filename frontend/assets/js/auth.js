// frontend/assets/js/auth.js
// Utilitários de sessão (sem dependências)

export function saveSession(userObj, token) {
  try {
    if (!userObj || !token) return;
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', token);
    const userName = userObj.nome || userObj.name || userObj.email || '';
    localStorage.setItem('userName', userName);
    const role = userObj.nivel_acesso || userObj.role || '';
    if (role) localStorage.setItem('userRole', role);
  } catch (err) {
    console.warn('saveSession error', err);
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUserName() {
  return localStorage.getItem('userName') || '';
}

export function getUserRole() {
  return localStorage.getItem('userRole') || '';
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout(redirect = '/pages/login.html') {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  } catch (err) { /* ignore */ }
  // redirect relative to 127.0.0.1:5500 if necessary
  if (redirect.startsWith('http')) {
    window.location.href = redirect;
  } else {
    // keep compatibility with your local static server path
    const base = window.location.origin.includes('5500') ? window.location.origin : 'http://127.0.0.1:5500';
    window.location.href = `${base}${redirect.startsWith('/') ? '' : '/'}${redirect.replace(/^\//, '')}`;
  }
}

export function protectPage(redirect = '/pages/login.html') {
  if (!isLoggedIn()) {
    logout(redirect);
  }
}
