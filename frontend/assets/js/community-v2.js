// frontend/assets/js/community-v2.js
// Assumimos que existe um módulo auth.js que exporta:
// isLoggedIn, getUserName, getToken, logout, getUser
import {
  isLoggedIn,
  getUserName,
  getToken,
  logout,
  getUser
} from './auth.js';
// Base da API: Agora usa o caminho relativo /api, que o Vercel irá rotear.
const API_BASE = '/api';

// -------------------------
// Helpers
// -------------------------
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

// ---------- FETCH HELPERS (CORRIGIDO PARA EVITAR DUPLICIDADE de /posts) ----------
async function fetchJson(path, opts = {}) {
    
    try {
        // 1) Lógica de obtenção e normalização do token (mantida)
        let token = (typeof getToken === 'function') ? getToken() : null;

        if (!token) {
            try {
                token = localStorage.getItem('token')
                    || localStorage.getItem('userToken') || null;
            } catch (e) {
                console.debug('[fetchJson] falha ao ler localStorage', e);
                token = null;
            }
        }

        const cleanToken = token ? String(token).replace(/^Bearer\s+/i, '').trim() : null;
        const headers = opts.headers ? { ...opts.headers } : {};

        if (cleanToken) headers['Authorization'] = `Bearer ${cleanToken}`;
        if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

        // 🌟 CORREÇÃO: Monta a URL usando a base relativa '/api'
        // Assume que 'path' já contém a rota completa do backend (ex: 'posts', 'posts/1/like')
        const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
        
        // Se a rota for apenas 'posts', o resultado é '/api/posts'
        // Se a rota for 'posts/1/like', o resultado é '/api/posts/1/like'
        const url = path.startsWith('http') ? path : `${API_BASE}/${normalizedPath}`;

        console.debug('[fetchJson] request', {
            url,
            method: opts.method || 'GET',
            authSent: !!cleanToken,
            tokenPreview: cleanToken ? (cleanToken.slice(0, 10) + '...') : null
        });

        const res = await fetch(url, { ...opts, headers });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                console.warn('[fetchJson] 401/403 detectado, forçando logout');
                if (typeof logout === 'function') logout();
            }
            const txt = await res.text().catch(() => null);
            let message;
            try {
                message = JSON.parse(txt).message;
            } catch (_) {
                message = txt || res.statusText || `HTTP ${res.status}`;
            }
            throw new Error(message);
        }

        if (res.status === 204) return {};

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) return res.json();
        return res.text();

    } catch (err) {
        throw err;
    }
}

function escapeHtml(unsafe) {
    if (!unsafe && unsafe !== 0) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}
// ... (O resto do setup DOM permanece o mesmo) ...
let feedContainer = document.getElementById('community-feed-container');
if (!feedContainer) {
    console.warn('[community-v2] container #community-feed-container não existe; criando um.');
    const main = document.querySelector('main') || document.body;
    const wrapper = document.createElement('section');
    wrapper.id = 'community-feed-container';
    wrapper.className = 'community-page-container';
    main.appendChild(wrapper);
    feedContainer = wrapper;
}
let POSTS = [];

function renderLoginPrompt(container) {
    container.innerHTML = `
<div class="create-post-card">
<div class="login-prompt">
<h2>Faça login para interagir</h2>
<p>Entre para publicar e curtir.</p>
<a href="login.html" class="btn-post">Fazer Login</a>
</div>
</div>
`;
}

function renderPostForm(container, userName) {
    const safeName = typeof userName === 'string' ? userName : 'Você';
    const initials = safeName.split(' ')
        .map(n => (n || '')[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const wrapper = document.createElement('div');
    wrapper.className = 'create-post-card';
    wrapper.innerHTML = `
<form id="post-form" class="post-form-wrapper" onsubmit="return false;">
<div class="avatar">${initials}</div>
<div style="flex:1;">
<textarea id="new-post-content" class="post-textarea"
placeholder="Compartilhe sua ideia sustentável..."></textarea>
<div
style="display:flex; justify-content:space-between; align-items:center;
margin-top:10px;">
<select id="new-post-categoria"
style="padding:8px;border-radius:6px;background:#23343f;color:#fff;border:1px
solid #374151;">
<option value="geral">Geral</option>
<option value="dicas">Dicas</option>
<option value="conquistas">Conquistas</option>
<option value="eventos">Eventos</option>
<option value="perguntas">Perguntas</option>
</select>
<button type="button" id="btn-post-submit"
class="btn-post">Publicar</button>
</div>
</div>
</form>
`;

    container.prepend(wrapper);

    const btn = wrapper.querySelector('#btn-post-submit');
    btn.addEventListener('click', async () => {
        const textarea = wrapper.querySelector('#new-post-content');
        const categoria = wrapper.querySelector('#new-post-categoria').value
            || 'geral';
        const content = textarea.value.trim();

        if (!content) return alert('O conteúdo da postagem é obrigatório.');

        btn.disabled = true;
        btn.textContent = 'Publicando...';

        try {
            await createPost(content, categoria);
            textarea.value = '';
            await fetchAndRenderFeed();
        } catch (err) {
            let msg = err.message || String(err);
            try {
                const parsed = JSON.parse(msg);
                if (parsed?.message) msg = parsed.message;
            } catch (_) {}
            alert('Erro ao publicar: ' + msg);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Publicar';
        }
    });
}

function createPostElement(post, logged) {
    const authorName = post?.autor_nome || post?.autor || post?.nome_autor ||
        'Usuário';
    const initials = authorName.split(' ')
        .map(n => (n || '')[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const time = formatDate(post?.data_criacao || post?.data_publicacao || post?.created_at);
    const postId = post?.id_post ?? post?.id ?? post?._id ?? '';
    const likes = post?.likes_count ?? 0;

    const currentUserId =
        typeof getUser === 'function' ?
        (getUser() ?.id_usuario ?? getUser() ?.id) :
        null;

    const wrapper = document.createElement('div');
    wrapper.className = 'post-card';
    wrapper.dataset.postId = postId;

    wrapper.innerHTML = `
<div class="post-header">
<div class="avatar">${initials}</div>
<div class="post-author-info">
<div class="post-author">${escapeHtml(authorName)}</div>
<div class="post-time">${time}</div>
</div>
<div style="margin-left:auto">
<span class="badge"
style="background:#111827;color:#fff;padding:6px;border-radius:8px;font-size:12px;">
${escapeHtml((post?.categoria || 'geral').toUpperCase())}
</span>
</div>
</div>
<div class="post-content">${escapeHtml(post?.conteudo)}</div>
<div class="post-actions">
<button class="action-button btn-like" data-post-id="${postId}">
<i class="ph ph-heart"></i> <span
class="like-count">${likes}</span>
</button>
${
    logged && String(post?.id_usuario) === String(currentUserId)
?
    `<button class="action-button btn-delete"
data-post-id="${postId}" style="color:#f87171;">
<i class="ph ph-trash-simple"></i>
</button>`
:
    ''
    }
</div>
`;

    return wrapper;
}

function renderFeed() {
    const old = document.getElementById('posts-feed');
    if (old) old.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'posts-feed';

    const logged = isLoggedIn();

    POSTS.forEach(p => wrapper.appendChild(createPostElement(p, logged)));

    feedContainer.appendChild(wrapper);

    attachInteractionListeners(wrapper);
}

// -------------------------
// API ACTIONS
// -------------------------
async function fetchAndRenderFeed() {
    try {
        // ROTA: Usa a rota base do post routes -> /api/posts
        const posts = await fetchJson('posts'); 

        POSTS = Array.isArray(posts) ? posts : posts.data ?? [];

        renderFeed();
    } catch (err) {
        const msg = err.message || String(err);
        feedContainer.innerHTML = `
<p class="loading-message" style="color:#DC2626;">
Falha ao carregar posts: ${escapeHtml(msg)}
</p>`;
    }
}

async function createPost(conteudo, categoria = 'geral') {
    // ROTA: Usa a rota base do post routes -> /api/posts
    return fetchJson('posts', {
        method: 'POST',
        body: JSON.stringify({ conteudo, categoria })
    });
}

async function likePost(postId) {
    // Rota: posts/:id/like -> /api/posts/:id/like
    return fetchJson(`posts/${postId}/like`, { method: 'POST' });
}

async function unlikePost(postId) {
    // Rota: posts/:id/like (com DELETE) -> /api/posts/:id/like
    return fetchJson(`posts/${postId}/like`, { method: 'DELETE' });
}

async function fetchLikesCount(postId) {
    try {
        // Rota: posts/:id/likes -> /api/posts/:id/likes
        const r = await fetchJson(`posts/${postId}/likes`);
        return r.cnt ?? r.count ?? r.CNT ?? 0;
    } catch {
        return 0;
    }
}

async function deletePost(postId) {
    // Rota: posts/:id -> /api/posts/:id
    return fetchJson(`posts/${postId}`, { method: 'DELETE' });
}

// -------------------------
// Listeners
// -------------------------
function attachInteractionListeners(container) {
    container.querySelectorAll('.btn-like').forEach(btn => {
        btn.addEventListener('click', async () => {
            const postId = btn.dataset.postId;
            if (!postId) return;

            if (!isLoggedIn()) {
                alert('Você precisa estar logado para curtir!');
                return;
            }

            btn.disabled = true;
            try {
                const isLiked = btn.classList.contains('liked');
                if (!isLiked) {
                    await likePost(postId);
                    btn.classList.add('liked');
                } else {
                    await unlikePost(postId);
                    btn.classList.remove('liked');
                }

                // Recarrega a contagem de likes
                const cnt = await fetchLikesCount(postId);
                btn.querySelector('.like-count').textContent = cnt;

            } catch (err) {
                alert('Erro ao atualizar curtida: ' + (err.message || String(err)));
            } finally {
                btn.disabled = false;
            }
        });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const postId = btn.dataset.postId;
            if (!postId) return;

            if (!isLoggedIn()) {
                alert('Você precisa estar logado para excluir!');
                return;
            }
            if (!confirm('Deseja realmente excluir este post?')) return;

            btn.disabled = true;
            try {
                await deletePost(postId);
                container.querySelector(`.post-card[data-post-id="${postId}"]`)
                    ?.remove();
                alert('Post removido com sucesso.');
            } catch (err) {
                alert('Falha ao excluir: ' + (err.message || String(err)));
            } finally {
                btn.disabled = false;
            }
        });
    });
}

// -------------------------
// Inicialização
// -------------------------
async function initCommunity() {
    const logged = isLoggedIn();

    if (logged) {
        const user =
            getUserName() ||
            getUser() ?.full_name ||
            getUser() ?.nome ||
            'Você';
        renderPostForm(feedContainer, user);
    } else {
        renderLoginPrompt(feedContainer);
    }

    await fetchAndRenderFeed();
}

document.addEventListener('DOMContentLoaded', () => {
    initCommunity().catch(err => console.error(err));
});