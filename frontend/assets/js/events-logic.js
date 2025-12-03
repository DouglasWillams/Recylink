// frontend/assets/js/events-logic.js
import {
  isLoggedIn,
  getToken
} from './auth.js';

const API_BASE = '/api'; 
const DEFAULT_IMAGE = '../assets/images/placeholder.jpg'; 

document.addEventListener('DOMContentLoaded',
() => {
 
  const eventsListContainer = document.getElementById('events-list-container');
 
  if (eventsListContainer) {
      fetchAndRenderEvents(eventsListContainer);
  }
});

// -------------------------
// FUNÇÕES DE UTILIDADE (Fetch e Escape)
// -------------------------
function escapeHtml(str)
{
 
  if (!str && str !== 0) return '';
 
  return String(str).replace(/[&<>"']/g, (m) => ({
 
      '&': '&amp;',
 
      '<': '&lt;',
 
      '>': '&gt;',
 
      '"': '&quot;',
 
      "'": '&#39;'
 
  }[m]));
}

async function fetchJson(path, opts = {}) {
 
  const token = getToken();
  const headers = opts.headers || {};
 
  if (token) {
      headers['Authorization'] = `Bearer ${token}`;
  }
 
  if (opts.method !== 'GET' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
  }
    
    // Monta a URL corretamente: /api/path
    const url = path.startsWith(API_BASE) ? path : `${API_BASE}/${path.replace(/^\/+/, '')}`;
 
  const res = await fetch(url, { ...opts, headers });
 
  if (res.status === 204) { return {}; }
 
  let jsonResult;
 
  try {
      jsonResult = await res.json();
  } catch (err) {
        jsonResult = { message: res.statusText
|| 'Erro desconhecido' };
    }

    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            alert("Sessão expirada. Faça login novamente.");
            window.location.href = '/pages/login.html'; 
        }
        throw new Error(jsonResult.message
|| `HTTP ${res.status}: ${res.statusText}`);
    }
 
    return jsonResult;
}

// -------------------------
// LÓGICA PRINCIPAL
// -------------------------

/**
 * Função que verifica o status de login e redireciona (ou
inscreve).
 */
function handleParticipation(eventId)
{
 
  if (isLoggedIn()) {
      // Se logado: vai direto para a página de Inscrição
      window.location.href = `/pages/inscricao.html?eventId=${eventId}`; 
 
  } else {
        // Se não logado: vai para a tela de login
        alert('Você precisa estar logado para se inscrever! Redirecionando para o login.');
        // Passamos o destino final como parâmetro 'next'
        window.location.href = `/pages/login.html?next=/pages/inscricao.html?eventId=${eventId}`; 
 
  }
}

/**
 * Busca eventos APROVADOS da API e renderiza.
 */
async function fetchAndRenderEvents(container) {
 
  container.innerHTML = '<p class="loading-message">Carregando eventos...</p>';
 
  try {
        // GET para /api/evento/eventos (eventoController.getAll - lista somente aprovados)
        const events = await fetchJson('evento/eventos');
 
      container.innerHTML = ''; // Limpa o loading
 
      if (!events || events.length === 0) {
          container.innerHTML = '<p class="loading-message">Nenhum evento encontrado no momento.</p>';
          return;
      }
 
      renderEvents(container, events);
 
  } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        container.innerHTML = `<p class="loading-message" style="color: #DC2626;">Erro ao carregar eventos: ${err.message}</p>`;
  }
}

/** * Renderiza a lista de eventos no container.
 * (Corrigido para evitar erros de String Literal)
 */
function renderEvents(container, events) {
 
  events.forEach(event => {
 
      const card = document.createElement('div');
      card.className = 'event-card';
      const imageUrl = event.imagem_url;

      // 1. Lógica Condicional para o Visual do Card (Em linha)
      const eventVisual = imageUrl ?
          `<img src="${imageUrl}" alt="Imagem do evento ${event.titulo}" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}';" />` :
          `<div class="no-image"><i class="ph ph-calendar-blank"></i><p>${escapeHtml(event.titulo)}</p></div>`;
      
      const imageContainerClass = imageUrl ? '' : 'no-image'; 

      // 2. Cria o HTML do Card (Em linha)
      card.innerHTML = `
<div class="event-image-container ${imageContainerClass}">
${eventVisual}
</div>
<div class="event-content">
<div class="event-badges">
<span class="badge">${event.category || 'Voluntariado'}</span>
<div class="participants">
<i class="ph ph-users meta-icon" style="color: #9CA3AF;"></i>
<span>${event.participants || 0}</span>
</div>
</div>
<h3 class="event-title">${escapeHtml(event.titulo)}</h3>
<p class="event-description">${escapeHtml(event.descricao)}</p>
<div class="event-meta">
<div class="meta-item">
<i class="ph ph-calendar-blank meta-icon"></i>
<span>${new Date(event.data_evento).toLocaleDateString('pt-BR')}</span>
</div>
<div class="meta-item">
<i class="ph ph-map-pin meta-icon"></i>
<span>${escapeHtml(event.localizacao || 'Local Desconhecido')}</span>
</div>
</div>
<button class="btn-participate" data-event-id="${event.id_evento}">Participar</button>
</div>
`;
      container.appendChild(card);
 
  });
 
  // 3. Anexa Listeners de Participação
  document.querySelectorAll('.btn-participate').forEach(button => {
      button.addEventListener('click',
          (e) => {
              const eventId = e.currentTarget.getAttribute('data-event-id');
              handleParticipation(eventId);
          });
  });
}