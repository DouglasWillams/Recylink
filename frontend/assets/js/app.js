/**
 * Lógica Global do Aplicativo (app.js).
 * Contém funções essenciais para o estado global do Recylink.
 * Mantive compatibilidade com o que você já tinha (localStorage 'userToken').
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('App Recylink carregado! (Modo Seguro)');

  // --- FUNÇÃO GLOBAL DE AUTENTICAÇÃO (CRÍTICA) ---
  window.isAuthenticated = function() {
    const token = localStorage.getItem('userToken');
    return !!token;
  };

  // Retorna o token (helper global compatível com outros scripts)
  window.getToken = function() {
    return localStorage.getItem('userToken') || null;
  };

  // Parse simples do payload do JWT (apenas para UX, não valida assinatura)
  window.getUserFromToken = function() {
    const token = window.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (err) {
      return null;
    }
  };

  // --- FLUXO PARA LOGOUT ---
  document.querySelectorAll('.logout-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('userToken');
      window.location.href = '../pages/login.html';
    });
  });

  // --- Hook para atualizar navbar (se existir função externa) ---
  if (typeof window.updateNavbarStatus === 'function') {
    try { window.updateNavbarStatus(); } catch (e) { /* ignore */ }
  }

  // --- Outras Lógicas Globais (Mantidas) ---
  const registerButton = document.getElementById('register-button');
  if (registerButton) {
    registerButton.addEventListener('click', () => {
      // lógica de abrir modal / redirecionar para cadastro
      window.location.href = '/pages/register.html';
    });
  }

});
