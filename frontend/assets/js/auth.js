// frontend/assets/js/auth.js

export function saveSession(userObj, token) {
  try {
    if (!userObj || !token) return;
    localStorage.setItem('user', JSON.stringify(userObj));
    // garante que token seja string limpa (sem "Bearer ")
    localStorage.setItem('token', String(token).trim());
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
  // retorna token limpo ou null
  try {
    const t = localStorage.getItem('token');
    return t ? String(t).trim() : null;
  } catch (err) {
    return null;
  }
}

export function getUserName() {
  return localStorage.getItem('userName') || '';
}

export function getUserRole() {
  return localStorage.getItem('userRole') || '';
}

export function isLoggedIn() {
  // evita tokens vazios com apenas espaços
  const t = getToken();
  return Boolean(t && t.length > 0);
}

export function logout() {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  } catch (err) { /* ignore */ }

  // redireciona para home - ajuste conforme seu ambiente de deploy
  const base = window.location.origin.includes('5500') ? window.location.origin : 'http://127.0.0.1:5500';
  window.location.href = `${base}/frontend/pages/index.html`;
}

export function protectPage(redirect = '/pages/login.html') {
  if (!isLoggedIn()) {
    const loginPath = `/pages/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    const base = window.location.origin.includes('5500') ? window.location.origin : 'http://127.0.0.1:5500';
    window.location.href = `${base}/frontend${loginPath}`;
  }
}

export function updateNavbarStatus() {
  const logged = isLoggedIn();
  const navMenu = document.querySelector('.nav-menu ul');
  const userName = getUserName();
  if (!navMenu) return;
  navMenu.querySelectorAll('.dynamic-link').forEach(el => el.remove());

  if (logged) {
    let loginLink = navMenu.querySelector('a[href="login.html"]');
    if (loginLink) loginLink.parentNode.remove();

    const dashboardItem = document.createElement('li');
    dashboardItem.className = 'dynamic-link';
    dashboardItem.innerHTML = `<a href="user-home.html">Dashboard</a>`;
    navMenu.appendChild(dashboardItem);

    const logoutItem = document.createElement('li');
    logoutItem.className = 'dynamic-link';
    logoutItem.innerHTML = `<a href="#" class="logout-btn">Logout (${userName.split(' ')[0]})</a>`;
    navMenu.appendChild(logoutItem);
    logoutItem.querySelector('.logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    if (!navMenu.querySelector('a[href="login.html"]')) {
      const loginItem = document.createElement('li');
      loginItem.innerHTML = `<a href="login.html">Login</a>`;
      navMenu.appendChild(loginItem);
    }
  }
}
