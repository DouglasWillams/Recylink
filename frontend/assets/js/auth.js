// frontend/assets/js/auth.js

/**
 * Funções utilitárias para gerenciar o estado de autenticação.
 * Módulo padrão do Recylink.
 */

// Define as chaves de localStorage usadas globalmente
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const USER_NAME_KEY = 'userName';
const USER_ROLE_KEY = 'userRole';

/**
 * Salva os dados da sessão (usuário e token) no localStorage.
 * @param {Object} userObj - Objeto com dados do usuário (nome, email, nivel_acesso, etc.).
 * @param {string} token - O token JWT.
 */
export function saveSession(userObj, token) {
    try {
        if (!userObj || !token) return;

        // 1. Limpa e salva o token
        const pureToken = String(token).replace(/^Bearer\s+/i, '').trim();
        localStorage.setItem(TOKEN_KEY, pureToken);

        // 2. Salva o objeto do usuário (para fácil acesso a todos os dados)
        localStorage.setItem(USER_KEY, JSON.stringify(userObj));

        // 3. Salva atributos específicos para display rápido (UX)
        const userName = userObj.nome || userObj.name || userObj.email || '';
        localStorage.setItem(USER_NAME_KEY, userName);

        const role = userObj.nivel_acesso || userObj.role || '';
        if (role) localStorage.setItem(USER_ROLE_KEY, role);

        console.info('[Auth] Sessão salva com sucesso.');

    } catch (err) {
        console.warn('[Auth] Erro ao salvar sessão local:', err);
    }
}

/**
 * Obtém o objeto completo do usuário do localStorage.
 * @returns {Object|null}
 */
export function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        return null;
    }
}

/**
 * Obtém o token JWT.
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY) || null;
}

/**
 * Obtém o nome do usuário para exibição.
 * @returns {string|null}
 */
export function getUserName() {
    return localStorage.getItem(USER_NAME_KEY) || null;
}

/**
 * Obtém o nível de acesso (role) do usuário.
 * @returns {string|null}
 */
export function getUserRole() {
    return localStorage.getItem(USER_ROLE_KEY) || null;
}

/**
 * Verifica se o usuário está logado.
 * @returns {boolean}
 */
export function isLoggedIn() {
    return !!getToken();
}

/**
 * Encerra a sessão e redireciona.
 * @param {string} [redirectTo='/pages/login.html'] - URL para onde redirecionar após o logout.
 */
export function logout(redirectTo = '/pages/login.html') {
    // 1. Limpa todas as chaves de sessão
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    
    console.info('[Auth] Sessão encerrada.');

    // 2. Redireciona usando caminho absoluto (Vercel/routes)
    window.location.href = redirectTo;
}

/*
 * updateNavbarStatus:
 * - Procura links de Login/Cadastro e os substitui por Perfil/Dashboard + Logout
 * - Deve ser chamada após o DOM carregar e em cada mudança de estado de login.
 */
export function updateNavbarStatus() {
    try {
        const nav = document.querySelector('.nav-menu ul');
        if (!nav) return;

        // Procura e remove elementos injetados previamente para evitar duplicatas
        const existingInjected = nav.querySelector('.injected-auth');
        if (existingInjected) existingInjected.remove();
        
        // Remove links de login/cadastro existentes na marcação
        const loginLink = Array.from(nav.querySelectorAll('a')).find(a => {
            const href = a.getAttribute('href') || '';
            const text = (a.textContent || '').toLowerCase().trim();
            return href.includes('login.html') || text === 'login';
        });

        if (isLoggedIn()) {
            // Se logado: Injeta link para Perfil/Dashboard
            const li = document.createElement('li');
            li.className = 'injected-auth';
            li.innerHTML = `
                <a href="/pages/user-home.html" class="nav-profile">Perfil</a>
            `;
            
            // Se houver um link de login no HTML, substitui (mantendo a posição)
            if (loginLink) {
                const parentLi = loginLink.closest('li');
                if (parentLi) {
                    parentLi.replaceWith(li);
                } else {
                    nav.appendChild(li);
                }
            } else {
                nav.appendChild(li);
            }
            
            // Anexa listener de logout a um botão de ID específico (se existir no HTML)
            const logoutBtn = document.getElementById('logoutButton');
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
                logoutBtn.addEventListener('click', () => logout('/pages/login.html'));
            }

        } else {
            // Se deslogado: Garante que o link de login exista
            if (!loginLink) {
                const li = document.createElement('li');
                li.className = 'injected-auth';
                li.innerHTML = `<a href="/pages/login.html">Login</a>`;
                nav.appendChild(li);
            }
        }
    } catch (e) {
        console.error('[updateNavbarStatus] Falha ao atualizar navbar:', e);
    }
}