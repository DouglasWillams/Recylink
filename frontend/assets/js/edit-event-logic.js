// frontend/assets/js/edit-event-logic.js
// IMPORTANT: This script relies on fetchJson, API_BASE, and escapeHtml being accessible.
// Assuming they are defined in dashboard.js or globally available in the module scope.
const API_BASE = 'http://localhost:3000/api';
// --- Placeholder/Helper Functions (Needed if not imported globally) ---
// Note: In a large modular app, these should be imported from a utility file.
function qs(sel) { return document.querySelector(sel); }
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
// Function to fetch data with JWT token (Re-defined for robustness)
async function fetchJson(path, opts = {}) {
    const token = localStorage.getItem('token');
    const headers = opts.headers || {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (opts.method !== 'GET' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    // Garante que a URL seja montada corretamente: API_BASE + path
    const url = path.startsWith(API_BASE) ? path : `${API_BASE}${path}`;

    const res = await fetch(url, { ...opts, headers });
    if (res.status === 204) { return {}; }
    let jsonResult;
    try {
        jsonResult = await res.json();
    } catch (err) {
        jsonResult = { message: res.statusText || 'Erro desconhecido' };
    }
    if (!res.ok) {
        throw new Error(jsonResult.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return jsonResult;
}
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id'); // Get ID from URL: edit-event.html?id=2
    const statusMessage = document.getElementById('edit-event-status-message');
    const editForm = document.getElementById('edit-event-form');
    if (!eventId) {
        statusMessage.textContent = 'Erro: ID do evento não fornecido. Redirecionando...';
        statusMessage.classList.add('error-message');
        setTimeout(() => window.location.href = 'user-home.html', 2000);
        return;
    }
    await loadEventData(eventId, statusMessage, editForm);
});
/**
 * Fetches existing event data and populates the form fields.
 */
async function loadEventData(eventId, statusMessage, editForm) {
    statusMessage.textContent = `Carregando dados do Evento ID ${eventId}...`;
    try {
        // ⭐ CORREÇÃO APLICADA: Adiciona o prefixo '/evento' antes de '/eventos/:id' ⭐
        // 1. Fetch Event Data: GET /api/evento/eventos/:id
        const eventData = await fetchJson(`/evento/eventos/${eventId}`);
        
        // 2. Preenche o formulário
        qs('#event-id').value = eventData.id_evento;
        qs('#event-title').value = escapeHtml(eventData.titulo);
        qs('#event-desc').value = escapeHtml(eventData.descricao || '');
        qs('#event-location').value = escapeHtml(eventData.localizacao || '');
        qs('#event-image').value = escapeHtml(eventData.imagem_url || '');
        
        // Formata a data para o input datetime-local (CRÍTICO: YYYY-MM-DDTHH:mm)
        if (eventData.data_evento) {
            const date = new Date(eventData.data_evento);
            // Slice(0, 16) formats the date correctly for datetime-local input
            const formattedDate = date.toISOString().slice(0, 16);
            qs('#event-date').value = formattedDate;
        }

        statusMessage.style.display = 'none'; // Esconde a mensagem de carregamento
        editForm.style.display = 'block';     // Mostra o formulário
        
        // 3. Anexa o listener de submit para salvar
        editForm.addEventListener('submit', (e) => handleEditSubmit(e, eventId));
    } catch (error) {
        console.error(' ❌  Erro ao carregar evento para edição:', error);
        statusMessage.textContent = `Erro ao carregar evento: ${error.message}. Verifique a rota /api/evento/eventos/:id.`;
        statusMessage.classList.add('error-message');
        statusMessage.classList.remove('loading-message');
    }
}
/**
 * Handles the form submission (PUT request) to update the event.
 */
async function handleEditSubmit(e, eventId) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]');
    const titulo = qs('#event-title').value.trim();
    const data_evento = qs('#event-date').value;
    
    if (!titulo || !data_evento) return alert('Título e Data são obrigatórios.');

    const eventData = {
        titulo: titulo,
        descricao: qs('#event-desc').value.trim(),
        localizacao: qs('#event-location').value.trim(),
        data_evento: data_evento, // Enviado como YYYY-MM-DDTHH:mm
        imagem_url: qs('#event-image').value.trim() || null
    };

    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        // 1. PUT Event Data: PUT /api/evento/eventos/meus/:id
        // CRÍTICO: Rota protegida para eventos criados pelo usuário
        const result = await fetchJson(`/evento/eventos/meus/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });

        alert(result.message || 'Evento atualizado com sucesso!');

        // Redirecionar de volta ao dashboard
        window.location.href = 'user-home.html?status=edited';
    } catch (err) {
        console.error(' ❌  Falha ao salvar edição:', err);
        alert('Falha ao salvar evento: ' + (err.message || 'Erro de rede.'));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar Alterações';
    }
}