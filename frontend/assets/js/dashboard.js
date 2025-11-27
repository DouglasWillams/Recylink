// frontend/assets/js/dashboard.js
import { protectPage, getUser, getToken, logout, getUserName } from './auth.js';
import { renderHeader } from './header.js';

const API_BASE = 'http://localhost:3000/api';

function qs(sel) { return document.querySelector(sel); }

(async function init() {
  // Renderiza header (injetando nav)
  renderHeader({ containerSelector: '#site-header', showOnLoggedOut: true });

  // Protege a página (redireciona ao login se não estiver logado)
  protectPage('/pages/login.html');

  // Mostra o nome do usuário
  const user = getUser();
  const name = getUserName() || (user && (user.nome || user.name)) || 'Usuário';
  const welcome = qs('#welcome-name');
  if (welcome) welcome.textContent = name;

  // logout button attach
  const btnLogout = qs('#btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', () => logout('/pages/login.html'));

  // carregar dados
  await loadPontos();
  await loadEventos();
  await loadPosts();
})();

async function fetchJson(path, opts = {}) {
  const token = getToken();
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const txt = await res.text().catch(()=>null);
    throw new Error(`HTTP ${res.status} : ${txt || res.statusText}`);
  }
  return res.json();
}

async function loadPontos() {
  const target = qs('#pontos-list');
  if (!target) return;
  try {
    const dados = await fetchJson('/pontos-coleta');
    if (!dados || dados.length === 0) {
      target.innerHTML = '<p>Nenhum ponto de coleta cadastrado.</p>';
      return;
    }
    const html = dados.map(p => `
      <div style="padding:8px;border:1px solid #eee;border-radius:8px;margin-bottom:8px">
        <strong>${escapeHtml(p.nome)}</strong><br/>
        ${escapeHtml(p.endereco)} — ${escapeHtml(p.cidade)}<br/>
        Tipo: ${escapeHtml(p.tipo_material)} | Status: ${escapeHtml(p.status || '')}
      </div>
    `).join('');
    target.innerHTML = html;
  } catch (err) {
    console.error('loadPontos error', err);
    target.innerHTML = `<p>Erro ao carregar pontos: ${escapeHtml(err.message)}</p>`;
  }
}

async function loadEventos() {
  const target = qs('#eventos-list');
  if (!target) return;
  try {
    const dados = await fetchJson('/eventos');
    if (!dados || dados.length === 0) {
      target.innerHTML = '<p>Sem eventos no momento.</p>';
      return;
    }
    const html = dados.map(ev => `
      <div style="padding:8px;border:1px solid #eee;border-radius:8px;margin-bottom:8px">
        <strong>${escapeHtml(ev.titulo)}</strong>
        <div style="color:#666">${new Date(ev.data_evento).toLocaleString()}</div>
        <div>${escapeHtml(ev.descricao || '')}</div>
      </div>
    `).join('');
    target.innerHTML = html;
  } catch (err) {
    console.error('loadEventos error', err);
    target.innerHTML = `<p>Erro ao carregar eventos: ${escapeHtml(err.message)}</p>`;
  }
}

async function loadPosts() {
  const target = qs('#posts-list');
  if (!target) return;
  try {
    const dados = await fetchJson('/posts');
    if (!dados || dados.length === 0) {
      target.innerHTML = '<p>Sem posts.</p>';
      return;
    }
    const html = dados.map(p => `
      <div style="padding:8px;border:1px solid #eee;border-radius:8px;margin-bottom:8px">
        <div style="font-weight:700">${escapeHtml(p.autor || p.nome || '')}</div>
        <div>${escapeHtml(p.conteudo)}</div>
        <div style="font-size:12px;color:#666">${new Date(p.data_publicacao).toLocaleString()}</div>
      </div>
    `).join('');
    target.innerHTML = html;
  } catch (err) {
    console.error('loadPosts error', err);
    target.innerHTML = `<p>Erro ao carregar posts: ${escapeHtml(err.message)}</p>`;
  }
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
