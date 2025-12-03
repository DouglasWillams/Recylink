// frontend/assets/js/dashboard.js
import {
    getToken,
    logout,
    getUser,
    isLoggedIn, 
    updateNavbarStatus
} from './auth.js';

// Importa as funções de lógica de renderização
import {
    renderHomeContent,
    renderProfileContent,
    renderMyRegistrations,
    renderSuggestEvent,
    renderAddPointForm,
    fetchMyCreatedEventsForEditing,
    setDependencies
} from './user-home-logic.js';

// Base da API: Usando caminho relativo para o Vercel rotear
const API_BASE = '/api'; 

function qs(sel) {
    return document.querySelector(sel);
}

// =================================================================
// FUNÇÕES DE UTILIDADE (Fetch e Escape)
// =================================================================

/**
 * Wrapper de fetch para API. Adiciona Token de Autenticação.
 */
async function fetchJson(path, opts = {}) {
    const token = getToken();
    const headers = opts.headers || {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (opts.method !== 'GET' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Garante que a URL seja montada corretamente: /api/path
    const url = path.startsWith(API_BASE) ? path : `${API_BASE}/${path.replace(/^\/+/, '')}`;

    const res = await fetch(url, { ...opts, headers });

    if (res.status === 204) { return {}; }
    
    let jsonResult;

    try {
        jsonResult = await res.json();
    } catch (err) {
        const text = await res.text().catch(() => 'Conteúdo não legível');
        console.error('[fetchJson] Falha ao parsear JSON. Status:', res.status, 'Resposta:', text, 'Erro:', err);
        jsonResult = { message: res.statusText || 'Erro desconhecido ao processar resposta do servidor.' };
    }

    if (!res.ok) {
        // TRATAMENTO CRÍTICO DE AUTENTICAÇÃO (401/403)
        if (res.status === 401 || res.status === 403) {
            console.warn('[fetchJson] 401/403 detectado, forçando logout.');
            logout('/pages/login.html?error=Sessão expirada. Faça login novamente.');
        }
        throw new Error(jsonResult.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return jsonResult;
}

export { fetchJson };

export function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

// =================================================================
// LÓGICA PRINCIPAL DO DASHBOARD
// =================================================================

/**
 * Função para proteger a página.
 */
function protectPage(redirectUrl) {
    if (!isLoggedIn()) {
        console.warn('[Dashboard] Não autenticado. Redirecionando...');
        window.location.href = redirectUrl;
    }
}

(async function init() {
    // 1. Injeta as dependências na lógica de renderização
    setDependencies({ fetchJson, escapeHtml, API_BASE });

    // 2. Protege a página e verifica o login
    protectPage('/pages/login.html'); 

    // 3. Carrega o perfil completo do usuário
    const userProfile = await loadUserProfile();

    // 4. Configura a navegação e listeners
    if (userProfile) {
        setupSidebarNavigation(userProfile);
        
        // 5. Verifica se há um parâmetro de URL para forçar a abertura de uma aba
        const urlParams = new URLSearchParams(window.location.search);
        const targetPage = urlParams.get('page');

        // Inicia na aba solicitada ou na Home
        if (targetPage) {
            showPage(targetPage);
        } else {
            showPage('home');
        }
    }
    
    // 6. Atualiza a Navbar globalmente 
    updateNavbarStatus();
    
})();

/**
 * Carrega o perfil completo do usuário logado usando a rota /api/profile.
 */
async function loadUserProfile() {
    const displayNameElement = qs('#user-display-name');
    const displayLevelElement = qs('#user-display-level');
    const avatarElement = qs('#user-avatar');
    const localUser = getUser() || {};

    try {
        // Rota: '/api/profile'
        const user = await fetchJson('/profile'); 
        
        // 1. Preenche dados de exibição
        const realName = user.nome || 'Usuário';
        const realLevel = user.nivel_acesso || 'População';
        
        if (displayNameElement) displayNameElement.textContent = realName;
        if (displayLevelElement) displayLevelElement.textContent = realLevel;

        // 2. Armazena dados no DOM para formulários
        document.body.dataset.userName = user.nome;
        document.body.dataset.userPhone = user.telefone || '';
        document.body.dataset.userEmail = user.email;
        document.body.dataset.userCreatedAt = user.data_cadastro;
        
        // 3. Coloca as iniciais no avatar
        if (avatarElement && realName) {
            const initials = realName.split(' ').map(n => n ? n[0] : '').join('').toUpperCase().slice(0, 2);
            avatarElement.innerHTML = initials.length > 0 ? initials : `<i class="ph ph-user"></i>`;
        }

        return user;

    } catch (err) {
        console.error('Erro ao carregar perfil:', err.message); 
        
        // Tenta a rota /status para debug
        try {
            await fetchJson('/status'); 
            console.warn("Servidor Railway UP, mas a rota /profile FALHOU. O PROBLEMA É APENAS NO ROUTER do PROFILE NO RAILWAY.");
        } catch (statusErr) {
            console.error("ERRO CRÍTICO: Servidor Railway não está respondendo, ou CORS/FRONTEND_URL está incorreta. Verifique FRONTEND_URL.");
        }

        if (displayNameElement) displayNameElement.textContent = localUser.nome || 'Erro no Carregamento';
        if (displayLevelElement) displayLevelElement.textContent = localUser.nivel_acesso || 'N/A';
        
        return localUser;
    }
}

/**
 * Configura a navegação lateral e os listeners.
 */
function setupSidebarNavigation(userProfile) {
    const navItems = document.querySelectorAll('.action-button-dash');
    const contentArea = qs('#dynamic-content-area');

    function showPage(page) {
        navItems.forEach(item => item.classList.remove('active'));
        const activeItem = qs(`.action-button-dash[data-page="${page}"]`);
        if (activeItem) activeItem.classList.add('active');

        contentArea.innerHTML = '<p style="text-align: center; color: #9CA3AF; padding: 50px;">Carregando...</p>';
        
        // Esconde a lista de eventos criados por padrão
        const myCreatedEventsList = qs('#my-created-events-list');
        if (myCreatedEventsList) {
            myCreatedEventsList.style.display = 'none';
        }

        switch (page) {
            case 'home':
                renderHomeContent(contentArea);
                // Busca eventos para a home
                if (myCreatedEventsList) {
                    myCreatedEventsList.style.display = 'block';
                    fetchMyCreatedEventsForEditing(myCreatedEventsList);
                }
                break;
            case 'profile':
                renderProfileContent(contentArea, userProfile);
                break;
            case 'history':
                renderMyRegistrations(contentArea);
                break;
            case 'suggest-event':
                renderSuggestEvent(contentArea);
                // Garante que a lista de eventos criados aparece nesta aba
                if (myCreatedEventsList) {
                    myCreatedEventsList.style.display = 'block';
                    fetchMyCreatedEventsForEditing(myCreatedEventsList);
                }
                break;
            case 'add-point':
                renderAddPointForm(contentArea);
                break;
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(e.currentTarget.dataset.page);
        });
    });

    // Listener de Logout (para botões que não estão na sidebar principal)
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout('/pages/login.html');
        });
    });
    // Expõe showPage globalmente para ser chamada pela inicialização
    window.showPage = showPage;
}