// frontend/assets/js/login.js
// Versão final: endpoint correto, seletores robustos e armazenamento compatível

// Base da API: Usa caminho relativo /api, que será roteado pelo Vercel para o Railway.
const API_BASE_URL = '/api'; 
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`; 

// Importa a função de salvar sessão do módulo auth.js (Assumindo que este módulo é carregado via script tag)
// Se você estiver usando <script type="module"> no HTML, descomente a linha abaixo e remova a exportação no final:
// import { saveSession } from './auth.js'; 

// Mensagem na UI (usando a função interna displayMessage para UX)
function displayMessage(message, type = 'error') {
    let container = document.getElementById('form-message');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'form-message';
        container.style.margin = '14px auto';
        container.style.padding = '10px 14px';
        container.style.borderRadius = '8px';
        container.style.maxWidth = '520px';
        container.style.fontWeight = '600';
        const formWrap = document.querySelector('.auth-card') || document.body;
        formWrap.prepend(container);
    }
    
    container.textContent = message;
    
    if (type === 'success') {
        container.style.background = '#10B981';
        container.style.color = '#fff';
    } else {
        container.style.background = '#EF4444';
        container.style.color = '#fff';
    }
    
    container.style.display = 'block';
    
    clearTimeout(container._hideTimeout);
    container._hideTimeout = setTimeout(() => container.style.display = 'none', 5000);
}

// Salva sessão (Cópia da função do auth.js para garantir que está disponível)
function saveSession(userObj, token) {
    try {
        if (!token) return;
        
        const pureToken = String(token).replace(/^Bearer\s+/i, '').trim();
        
        // Usa apenas 'token' (Consistente com app.js e auth.js)
        localStorage.setItem('token', pureToken);
        localStorage.setItem('user', JSON.stringify(userObj || {}));
        
        const userName = userObj?.nome || userObj?.name || userObj?.email || '';
        if (userName) localStorage.setItem('userName', userName);
        
        const role = userObj?.nivel_acesso || userObj?.role || '';
        if (role) localStorage.setItem('userRole', role);
        
        console.info('[login] sessão salva: token length=', pureToken.length, 'userName=', userName);

    } catch (err) {
        console.warn('[login] falha ao salvar sessão local:', err);
    }
}

// ==============================
// FUNÇÃO PRINCIPAL DE LOGIN
// ==============================
async function handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget || document.getElementById('login-form') || document.querySelector('form');
    
    if (!form) {
        displayMessage('Formulário de login não encontrado.', 'error');
        return;
    }

    const emailEl = form.querySelector('#email') || form.querySelector('input[type="email"]');
    const passEl = form.querySelector('#password') || form.querySelector('#senha') || form.querySelector('input[type="password"]');
    
    if (!emailEl || !passEl) {
        console.error('[login] inputs não encontrados', { emailEl, passEl });
        displayMessage('Campos de e-mail/senha ausentes. Atualize a página.', 'error');
        return;
    }

    const email = (emailEl.value || '').trim();
    const senha = (passEl.value || '').trim();
    
    if (!email || !senha) {
        displayMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.oldText = submitBtn.textContent;
        submitBtn.textContent = 'Entrando...';
    }

    console.info('[login] POST', LOGIN_ENDPOINT, 'email:', email);

    try {
        // ⭐ CHAMADA PARA O ENDPOINT CORRETO NO VERCEL (/api/auth/login) ⭐
        const loginData = { email, password: senha };

        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData) 
        });

        let data = {};
        let rawText = '';

        // Tenta ler o JSON; se falhar, tenta ler como texto
        try { 
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                rawText = await response.text();
            }
        } catch (err) {
            console.warn('[login] Falha ao parsear JSON:', err);
        }
        
        if (!response.ok) {
            const textMsg = rawText ? `: ${rawText.substring(0, 100)}...` : '';
            
            const msg = (data && (data.message || data.error)) 
                            ? (data.message || data.error) 
                            : `Erro: ${response.status}${textMsg}`; 

            displayMessage(msg, 'error');
            console.error('[login] resposta não OK:', response.status, msg, data);
            return;
        }

        displayMessage(data.message || 'Login realizado com sucesso!', 'success');

        const token = data.token || data.accessToken || data.jwt || data.access_token;
        const user = data.user || data.usuario || data.userData;

        if (!token) {
            console.warn('[login] resposta não incluiu token.');
            // Tenta salvar o que for possível
            if (data.token) localStorage.setItem('token', data.token);
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            saveSession(user || {}, token);
        }

        setTimeout(() => {
            // O padrão de redirecionamento para o Vercel deve ser /pages/user-home.html
            const redirect = (data && data.redirectUrl) 
                                ? data.redirectUrl 
                                : 'user-home.html';
            
            // ⭐ CORREÇÃO: Garante o redirecionamento absoluto no Vercel
            if (redirect.startsWith('http')) {
                window.location.href = redirect;
            } else {
                // Remove prefixos "/pages/" duplicados
                const cleanRedirect = redirect.replace(/^\/pages\//, ''); 
                window.location.href = `/pages/${cleanRedirect}`;
            }
        }, 700);

    } catch (err) {
        console.error('[login] erro de rede:', err);
        displayMessage('Não foi possível conectar ao servidor. Verifique o status da API.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.oldText || 'Entrar';
        }
    }
}

document.addEventListener('DOMContentLoaded',
() => {
    const form = document.getElementById('login-form') || document.querySelector('form');
    
    if (!form) {
        console.warn('[login] formulário não encontrado');
        return;
    }

    form.addEventListener('submit', handleLoginSubmit);
});

// Nota: Removidas as exportações no final para que este arquivo funcione
// como um script tradicional anexado ao login.html.