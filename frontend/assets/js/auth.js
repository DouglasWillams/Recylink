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
    return localStorage.getItem('token') || null;
}

export function setToken(t) {
    if (!t) {
        localStorage.removeItem('token');
    } else {
        localStorage.setItem('token', t);
    }
}

export function isLoggedIn() {
    return !!getToken();
}

export function logout() {
    // limpa token e redireciona para a página pública
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    // use caminho absoluto do deploy (rotas definidas no vercel.json)
    window.location.href = '/pages/index.html';
}

/*
 updateNavbarStatus:
 - procura por um link "Login" existente e troca por botão "Perfil/Logout" quando estiver logado
 - evita criar elementos adicionais se já existirem
*/
export function updateNavbarStatus() {
    try {
        const nav = document.querySelector('.nav-menu ul');
        if (!nav) return;

        // procura um elemento com href contendo "login.html" (ou texto "Login")
        const loginLink = Array.from(nav.querySelectorAll('a')).find(a => {
            const href = a.getAttribute('href') || '';
            const text = (a.textContent || '').toLowerCase().trim();
            return href.includes('login.html') || text === 'login';
        });

        // Remove previamente injetados (se tiverem sido criados por esse script) para evitar duplicatas
        const existingInjected = nav.querySelector('.injected-auth');
        if (existingInjected) existingInjected.remove();

        if (isLoggedIn()) {
            // criar elemento perfil + logout
            const li = document.createElement('li');
            li.className = 'injected-auth';
            li.innerHTML = `
                <a href="/pages/user-home.html" class="nav-profile">Perfil</a>
            `;
            // se houver loginLink, substitui (mantendo a mesma posição)
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
            // criar um segundo botão/ação de logout no final (opcional)
            // adicionar listener global para logout em um botão com id "logoutButton" se existir
            const logoutBtn = document.getElementById('logoutButton');
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
                logoutBtn.addEventListener('click', logout);
            }
        } else {
            // está deslogado: garante que haja um link para /pages/login.html
            if (!loginLink) {
                const li = document.createElement('li');
                li.className = 'injected-auth';
                li.innerHTML = `<a href="/pages/login.html">Login</a>`;
                nav.appendChild(li);
            } else {
                // se existe mas não aponta para /pages/ — corrige
                if (!loginLink.getAttribute('href').startsWith('/pages/')) {
                    loginLink.setAttribute('href', '/pages/login.html');
                }
            }
        }
    } catch (e) {
        // não quebrar a página se algo falhar aqui
        console.error('[updateNavbarStatus]', e);
    }
}