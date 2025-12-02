// frontend/assets/js/inscricao-logic.js
import {
    isLoggedIn,
    getUser,
    getToken
} from './auth.js';
const API_BASE = '/api'; // Ajustado para caminho relativo /api
const DEFAULT_IMAGE = '../assets/images/placeholder.jpg';
document.addEventListener('DOMContentLoaded',
    () => {
        // Redireciona se não estiver logado
        if (!isLoggedIn()) {
            window.location.href = 'login.html?next=inscricao.html' + window.location.search;
            return;
        }
        const eventInfoContainer = document.getElementById('event-info-container');
        const inscricaoForm = document.getElementById('inscricao-form');
        const user = getUser();
        // Pré-preenche os campos do usuário (dados do localStorage)
        const nomeCompleto = user.userName || user.nome || 'Nome do Usuário';
        const emailUsuario = user.email || 'email@usuario.com';
        document.getElementById('nome-completo').value = nomeCompleto;
        document.getElementById('email').value = emailUsuario;
        // Puxa o ID do evento da URL (ex: inscricao.html?eventId=3)
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventId');
        if (!eventId) {
            eventInfoContainer.innerHTML = '<h2>Evento não encontrado.</h2><p>Verifique o link e tente novamente.</p>';
            return;
        }
        // Inicia o carregamento dos detalhes e configura o formulário
        fetchEventDetails(eventId, eventInfoContainer, inscricaoForm);
    });
// --- FUNÇÕES DE API ---
async function fetchJson(path, opts = {}) {
    const token = getToken();
    const headers = opts.headers || {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (opts.method !== 'GET' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    // CRÍTICO: Adiciona timestamp para evitar cache do navegador na checagem GET
    let url = path.startsWith(API_BASE) ? path : `${API_BASE}${path}`;
    
    // Apenas adiciona o timestamp se for a rota de inscrições, que é crítica para checagem de estado
    if (opts.method === 'GET' && path.includes('/evento/minhas-inscricoes')) {
        const timestamp = new Date().getTime();
        url += (path.includes('?') ? '&' : '?') + `ts=${timestamp}`;
    }
    const res = await fetch(url, { ...opts, headers });
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
/**
 * Checa o status de inscrição e atualiza a UI.
 */
async function checkRegistrationStatus(eventId) {
    const submitButton = document.querySelector('.btn-confirmar');
    // Converte o ID da URL para Integer
    const eventIdInt = parseInt(eventId);
    try {
        // GET para /api/evento/minhas-inscricoes
        const registrations = await fetchJson('/evento/minhas-inscricoes');
        // Compara estritamente com o Integer
        const isRegistered = registrations.some(reg => reg.id_evento === eventIdInt);
        if (isRegistered) {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'JÁ INSCRITO(A)';
                submitButton.style.backgroundColor = '#9CA3AF'; // Cor cinza/desabilitada
            }
            // Adiciona uma mensagem de sucesso no topo do formulário
            const formCard = document.querySelector('.inscricao-container');
            if (formCard) {
                formCard.insertAdjacentHTML('afterbegin', '<p style="color: #10B981; font-weight: bold; text-align: center; padding: 10px 0;">  ✅     Você já está inscrito(a) neste evento.</p>');
            }
            return true;
        }
        return false;
    } catch (error) {
        console.warn("Falha ao checar status de inscrição:", error);
        return false;
    }
}
/**
 * Busca detalhes do evento, preenche a UI e checa o status de inscrição.
 */
async function fetchEventDetails(eventId, container, form) {
    try {
        // 1. Carrega os detalhes do evento: /api/evento/eventos/:id
        const event = await fetchJson(`/evento/eventos/${eventId}`);
        // 2. Renderiza os detalhes do evento
        container.innerHTML = `
<div class="event-details">
<img src="${event.imagem_url || DEFAULT_IMAGE}"
alt="Imagem do Evento"
onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}';"
/>
<div>
<h2 style="color: var(--color-primary-green); margin-bottom: 10px;">${escapeHtml(event.titulo)}</h2>
<p style="margin-bottom: 15px;">${escapeHtml(event.descricao)}</p>
<div class="detail-item">
<i class="ph ph-calendar-blank" style="color: var(--color-primary-green);"></i>
<span>${new Date(event.data_evento).toLocaleString('pt-BR')}</span>
</div>
<div class="detail-item">
<i class="ph ph-map-pin" style="color: var(--color-primary-green);"></i>
<span>${escapeHtml(event.localizacao || 'Local Desconhecido')}</span>
</div>
</div>
</div>
`;
        // 3. CRÍTICO: Checa se já está inscrito e desabilita o botão (UX)
        const isAlreadyRegistered = await checkRegistrationStatus(eventId);
        // 4. Anexa o listener de submissão APENAS se não estiver inscrito
        if (!isAlreadyRegistered) {
            form.addEventListener('submit', (e) => handleInscricaoSubmit(e, eventId, event.titulo));
        }
    } catch (err) {
        console.error('Erro ao carregar evento:', err);
        container.innerHTML = `<h2>Erro ao carregar evento.</h2><p style="color: #DC2626;">${err.message}</p>`;
    }
}
/**
 * Lida com a submissão do formulário de inscrição.
 */
async function handleInscricaoSubmit(e, eventId, eventTitle) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('.btn-confirmar');
    const telefone = document.getElementById('telefone').value.trim();
    if (!telefone) {
        alert('Por favor, preencha o telefone para contato.');
        return;
    }
    btn.disabled = true;
    btn.textContent = 'Confirmando...';
    try {
        // POST para /api/evento/eventos/:id/inscrever (envia pedido)
        const result = await fetchJson(`/evento/eventos/${eventId}/inscrever`, {
            method: 'POST',
        });
        alert(result.message || `Inscrição confirmada para o evento: ${eventTitle}!`);
        // Redireciona para o dashboard após o sucesso
        window.location.href = 'user-home.html?status=inscricao_ok';
    } catch (err) {
        console.error('Erro ao inscrever:', err);
        const errorMessage = err.message || 'Erro de servidor.';
        // LÓGICA SOLICITADA: Se já estiver inscrito, redireciona para a aba de inscrições
        if (errorMessage.includes('Você já está inscrito neste evento')) {
            alert('Você já está inscrito neste evento! Redirecionando para a aba Minhas Inscrições.');
            // Redireciona para o user-home e usa o parâmetro 'tab' para abrir a aba correta
            window.location.href = 'user-home.html?tab=inscricoes';
        } else {
            // Outros erros
            alert('Falha na inscrição: ' + errorMessage);
        }
    } finally {
        btn.disabled = false;
        btn.textContent = 'CONFIRMAR INSCRIÇÃO';
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