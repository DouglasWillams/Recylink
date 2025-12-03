// frontend/assets/js/events.js

import {
    isLoggedIn,
    getToken,
    getUser
} from './auth.js'; // 🌟 CORREÇÃO: Importação direta de funções de auth.js

const API_BASE = '/api';
const eventsContainer = document.getElementById('events-list-container');
if (!eventsContainer) console.error('Container #events-list-container não encontrado.');

// -------------------------
// Helper Functions (Padronizadas)
// -------------------------
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

async function fetchJson(path, opts = {}) {
    try {
        // Lógica de obtenção de token
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

        // Montagem da URL: Usa a base relativa '/api'
        const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
        const url = path.startsWith('http') ? path : `${API_BASE}/${normalizedPath}`;

        const res = await fetch(url, { ...opts, headers });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                console.warn('[fetchJson] 401/403 detectado');
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

function formatEventDate(dateStr) {
    if (!dateStr) return 'Data não definida';
    const d = new Date(dateStr);
    if (isNaN(d)) return 'Data inválida';
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// -------------------------
// API Calls (Usando as rotas do backend)
// -------------------------

async function fetchEvents() {
    // ROTA: /api/evento
    const events = await fetchJson('evento');
    return Array.isArray(events) ? events : events.data || [];
}

async function enrollInEvent(id_evento) {
    // ROTA: /api/inscricao_evento (POST para criar inscrição)
    return fetchJson('inscricao_evento', {
        method: 'POST',
        body: JSON.stringify({ id_evento })
    });
}

async function unenrollFromEvent(id_evento) {
    // ROTA: /api/inscricao_evento/:id_evento (DELETE para remover inscrição)
    return fetchJson(`inscricao_evento/${id_evento}`, {
        method: 'DELETE'
    });
}

// -------------------------
// Rendering and Interaction
// -------------------------

function createEventElement(event, isLogged, isEnrolled) {
    const wrapper = document.createElement('div');
    wrapper.className = 'event-card';
    wrapper.dataset.eventId = event.id_evento;

    const formattedDate = formatEventDate(event.data_evento);
    const eventStatus = event.status_aprovacao === 'aprovado' ? 
        '<span class="badge badge-approved">Aprovado</span>' :
        '<span class="badge badge-pending">Pendente</span>';
    
    // Lógica do Botão de Ação
    let actionButton = '';
    if (isLogged) {
        if (isEnrolled) {
            actionButton = `<button class="btn-action btn-unenroll" data-event-id="${event.id_evento}">
                Desinscrever
            </button>`;
        } else {
            actionButton = `<button class="btn-action btn-enroll" data-event-id="${event.id_evento}">
                Inscrever-se
            </button>`;
        }
    } else {
        actionButton = `<a href="login.html" class="btn-action btn-login">Login para Inscrever</a>`;
    }

    wrapper.innerHTML = `
        <div class="event-image" style="background-image: url('${escapeHtml(event.imagem_url || 'placeholder.jpg')}')"></div>
        <div class="event-details">
            <h3 class="event-title">${escapeHtml(event.titulo)}</h3>
            <p class="event-date">📅 ${formattedDate}</p>
            <p class="event-location">📍 ${escapeHtml(event.localizacao || 'Local não informado')}</p>
            <p class="event-description">${escapeHtml(event.descricao || 'Sem descrição detalhada.')}</p>
            <div class="event-footer">
                ${eventStatus}
                ${actionButton}
            </div>
        </div>
    `;

    return wrapper;
}

function renderEvents(events, userEnrollments) {
    if (!eventsContainer) return;
    eventsContainer.innerHTML = '';
    
    const isLogged = isLoggedIn();
    const enrolledIds = new Set(userEnrollments.map(e => String(e.id_evento)));

    const approvedEvents = events.filter(e => e.status_aprovacao === 'aprovado');

    if (approvedEvents.length === 0) {
        eventsContainer.innerHTML = '<p class="loading-message">Nenhum evento aprovado encontrado no momento.</p>';
        return;
    }

    approvedEvents.forEach(event => {
        const isEnrolled = enrolledIds.has(String(event.id_evento));
        const eventElement = createEventElement(event, isLogged, isEnrolled);
        eventsContainer.appendChild(eventElement);
    });
    
    attachEventListeners();
}

async function fetchUserEnrollments() {
    if (!isLoggedIn()) return [];
    // ROTA: /api/inscricao_evento (GET deve retornar as inscrições do usuário logado)
    try {
        const enrollments = await fetchJson('inscricao_evento');
        // O backend deve retornar um array de objetos, cada um com id_evento
        return Array.isArray(enrollments) ? enrollments : enrollments.data || [];
    } catch (error) {
        console.error('Falha ao buscar inscrições do usuário:', error);
        return [];
    }
}

function attachEventListeners() {
    if (!eventsContainer) return;

    // Listener para inscrição
    eventsContainer.querySelectorAll('.btn-enroll').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id_evento = e.currentTarget.dataset.eventId;
            if (!id_evento) return;

            e.currentTarget.disabled = true;
            e.currentTarget.textContent = 'Inscrevendo...';
            
            try {
                await enrollInEvent(id_evento);
                alert('Inscrição realizada com sucesso!');
                // Re-renderizar o feed para atualizar o status do botão
                initEvents(); 
            } catch (err) {
                alert('Erro ao se inscrever: ' + (err.message || String(err)));
                e.currentTarget.disabled = false;
                e.currentTarget.textContent = 'Inscrever-se';
            }
        });
    });
    
    // Listener para desinscrição
    eventsContainer.querySelectorAll('.btn-unenroll').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id_evento = e.currentTarget.dataset.eventId;
            if (!id_evento) return;

            e.currentTarget.disabled = true;
            e.currentTarget.textContent = 'Removendo...';
            
            try {
                await unenrollFromEvent(id_evento);
                alert('Desinscrição realizada com sucesso.');
                // Re-renderizar o feed para atualizar o status do botão
                initEvents();
            } catch (err) {
                alert('Erro ao se desinscrever: ' + (err.message || String(err)));
                e.currentTarget.disabled = false;
                e.currentTarget.textContent = 'Desinscrever';
            }
        });
    });
}

// -------------------------
// Initialization
// -------------------------

async function initEvents() {
    if (!eventsContainer) return;

    eventsContainer.innerHTML = '<p class="loading-message">Carregando eventos...</p>';
    
    try {
        // Busca eventos e inscrições do usuário em paralelo
        const [events, userEnrollments] = await Promise.all([
            fetchEvents(),
            fetchUserEnrollments()
        ]);
        
        renderEvents(events, userEnrollments);
        
    } catch (err) {
        eventsContainer.innerHTML = `<p class="loading-message error-message">
            Falha ao carregar eventos: ${escapeHtml(err.message || String(err))}
        </p>`;
    }
}

document.addEventListener('DOMContentLoaded', initEvents);