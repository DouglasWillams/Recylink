// frontend/assets/js/login.js
// URL base da sua API. Deve corresponder ao seu servidor Node.js/Express.
const API_BASE_URL = 'http://localhost:3000/api';
const LOGIN_ENDPOINT = `${API_BASE_URL}/login`;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  } else {
    console.error("Erro: Formulário de login (ID 'login-form') não encontrado.");
  }

  // Verifica se há mensagens de erro/sucesso na URL (após ativação, etc.)
  checkUrlMessages();
});

/**
 * Exibe mensagens de feedback para o usuário.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success' | 'error'} type - O tipo de mensagem (para styling).
 */
function displayMessage(message, type) {
  let messageContainer = document.getElementById('form-message');

  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'form-message';
    messageContainer.style.marginTop = '20px';
    messageContainer.style.padding = '10px';
    messageContainer.style.borderRadius = '6px';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.fontWeight = 'bold';

    const authCard = document.querySelector('.auth-card') || document.body;
    authCard.prepend(messageContainer);
  }

  messageContainer.textContent = message || '';

  if (type === 'success') {
    messageContainer.style.backgroundColor = '#10B981'; // Verde
    messageContainer.style.color = '#fff';
  } else {
    messageContainer.style.backgroundColor = '#EF4444'; // Vermelho
    messageContainer.style.color = '#fff';
  }

  messageContainer.style.display = 'block';

  setTimeout(() => {
    messageContainer.style.display = 'none';
  }, 5000);
}

/**
 * Verifica mensagens de URL (ex: após ativação de conta por e-mail).
 */
function checkUrlMessages() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const error = urlParams.get('error');

    if (message) {
      displayMessage(message, 'success');
      history.replaceState(null, null, window.location.pathname);
    } else if (error) {
      displayMessage(error, 'error');
      history.replaceState(null, null, window.location.pathname);
    }
  } catch (err) {
    // não crítico
  }
}

/**
 * Salva sessão do usuário no localStorage de forma consistente.
 * Guardamos: user (obj JSON), token (string), userName (string), userRole (string)
 */
function saveSession(userObj, token) {
  try {
    if (!userObj || !token) return;
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', token);

    // compatibilidade: nome pode vir como 'nome' ou 'name'
    const userName = userObj.nome || userObj.name || userObj.email || '';
    localStorage.setItem('userName', userName);

    const role = userObj.nivel_acesso || userObj.role || userObj.role;
    if (role) localStorage.setItem('userRole', role);
  } catch (err) {
    console.warn('Não foi possível salvar a sessão localmente:', err);
  }
}

/**
 * Lida com o envio do formulário de login.
 * @param {Event} e - O evento de submissão do formulário.
 */
async function handleLoginSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget || document.getElementById('login-form');
  if (!form) {
    displayMessage('Formulário de login não encontrado.', 'error');
    return;
  }

  // Buscando inputs de forma segura (dentro do form)
  const emailInput = form.querySelector('#email') || form.querySelector('input[type="email"]') || document.getElementById('email');
  const passwordInput = form.querySelector('#password') || form.querySelector('input[type="password"]') || document.getElementById('password');

  if (!emailInput || !passwordInput) {
    displayMessage('Campos de e-mail/senha ausentes. Atualize a página.', 'error');
    console.error('Campos de e-mail/senha não encontrados no DOM.', { emailInput, passwordInput });
    return;
  }

  const email = (emailInput.value || '').trim();
  const password = passwordInput.value || '';

  if (!email || !password) {
    displayMessage('Por favor, preencha todos os campos.', 'error');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]') || null;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.dataset.oldText = submitButton.textContent || 'Entrando...';
    submitButton.textContent = 'Entrando...';
  }

  const loginData = { email, password };

  try {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    // tenta ler JSON (proteção caso resposta não seja JSON)
    let result = {};
    try { result = await response.json(); } catch (err) { /* ignore */ }

    if (!response.ok) {
      const msg = (result && result.message) ? result.message : 'Erro desconhecido ao tentar logar.';
      displayMessage(msg, 'error');
      return;
    }

    // resposta OK
    displayMessage(result.message || 'Login realizado!', 'success');

    // salva sessão de forma robusta
    const userObj = result.user || result.userData || null;
    const token = result.token || result.accessToken || null;

    if (userObj && token) {
      saveSession(userObj, token);
    } else {
      // backward compatibility: se backend retornou outras chaves
      if (result.token && result.user) {
        saveSession(result.user, result.token);
      } else {
        // tenta salvar pelo que há
        if (result.token) localStorage.setItem('token', result.token);
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
      }
    }

    // tempo curto para o usuário ver a mensagem
    setTimeout(() => {
      const redirect = (result && result.redirectUrl) ? result.redirectUrl : 'http://127.0.0.1:5500/pages/dashboard.html';
      // se redirect for relativo (começa com '/'), converte para base local
      if (redirect.startsWith('/')) {
        // assume que o frontend está sendo servido em 127.0.0.1:5500
        window.location.href = `http://127.0.0.1:5500${redirect}`;
      } else {
        window.location.href = redirect;
      }
    }, 700);

  } catch (error) {
    console.error('Erro de rede ou servidor:', error);
    displayMessage('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.oldText || 'Entrar';
    }
  }
}
