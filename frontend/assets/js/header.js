// frontend/assets/js/header.js
import { getUserName, getUserRole, isLoggedIn, logout } from './auth.js';

/**
 * renderHeader(options)
 * - containerSelector: CSS selector onde injetar a header (default: '#site-header')
 * - showOnLoggedOut: se true, mostra links de login/cadastro para usuários não logados
 */
export function renderHeader({ containerSelector = '#site-header', showOnLoggedOut = true } = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const logged = isLoggedIn();
  const userName = getUserName();
  const role = getUserRole();

  // Use caminhos explícitos para suas páginas dentro da pasta /pages
  container.innerHTML = `
    <div class="site-topbar" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#fff;border-bottom:1px solid #eee">
      <div class="brand">
        <a href="/pages/index.html" style="text-decoration:none;color:#111;font-weight:700">Recylink</a>
      </div>
      <nav style="display:flex;gap:16px;align-items:center;">
        <a href="/pages/dashboard.html">Dashboard</a>
        <a href="/pages/mapa.html">Mapa</a>
        <a href="/pages/eventos.html">Eventos</a>
        <a href="/pages/comunidade.html">Comunidade</a>
        <span id="header-user-area"></span>
      </nav>
    </div>
  `;

  const userArea = container.querySelector('#header-user-area');
  if (!userArea) return;

  if (logged) {
    userArea.innerHTML = `
      <span style="margin-right:10px">Olá, <strong id="header-username">${escapeHtml(userName)}</strong></span>
      ${role === 'admin' ? '<a href="/admin-dashboard" style="margin-right:10px">Admin</a>' : ''}
      <button id="header-logout-btn" style="padding:6px 10px;border-radius:6px;border:0;background:#FBBF24;cursor:pointer">Sair</button>
    `;
    const btn = container.querySelector('#header-logout-btn');
    btn && btn.addEventListener('click', () => logout('/pages/login.html'));
  } else {
    if (showOnLoggedOut) {
      userArea.innerHTML = `
        <a href="/pages/login.html" style="margin-right:8px">Entrar</a>
        <a href="/pages/register.html">Cadastrar</a>
      `;
    } else {
      userArea.innerHTML = '';
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
