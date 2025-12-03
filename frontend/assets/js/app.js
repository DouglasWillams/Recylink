/**
 * Lógica Global do Aplicativo (app.js).
 * Contém funções essenciais para o estado global do Recylink.
 * * ⭐ ALTERAÇÃO: Unificado o uso do localStorage para a chave 'token' em vez de 'userToken'. ⭐
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('App Recylink carregado! (Modo Seguro)');

    // --- FUNÇÃO GLOBAL DE AUTENTICAÇÃO (CRÍTICA) ---
    window.isAuthenticated = function() {
        const token = localStorage.getItem('token'); // Alterado de 'userToken' para 'token'
        return !!token;
    };

    // Retorna o token (helper global compatível com outros scripts)
    window.getToken = function() {
        return localStorage.getItem('token') || null; // Alterado de 'userToken' para 'token'
    };

    // Parse simples do payload do JWT (apenas para UX, não valida assinatura)
    window.getUserFromToken = function() {
        const token = window.getToken();
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            // Adaptação para decodificação UTF-8 (compatível com o que você tinha)
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
            localStorage.removeItem('token'); // Alterado de 'userToken' para 'token'
            localStorage.removeItem('user');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
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