/**
 * Lógica Global do Aplicativo (app.js).
 * * Este arquivo contém funções essenciais para o estado global do Recylink,
 * principalmente a lógica para verificar o status de autenticação (JWT).
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('App Recylink carregado! (Modo Seguro)');

    // --- FUNÇÃO GLOBAL DE AUTENTICAÇÃO (CRÍTICA) ---
    
    /**
     * Verifica se o usuário está logado inspecionando o token JWT no localStorage.
     * Esta função é usada em TODAS as páginas privadas (Dashboard, Admin, Comunidade, etc.).
     * * @returns {boolean} - Retorna true se um token for encontrado, false caso contrário.
     */
    window.isAuthenticated = function() {
        const token = localStorage.getItem('userToken');
        
        // Em um projeto real, você decodificaria e verificaria a validade do token (expiração, assinatura).
        // Por enquanto, a presença do token é o suficiente para o fluxo de UI.
        return !!token; // Converte a presença/ausência do token para boolean (true/false)
    }

    // --- FLUXO PARA LOGOUT ---
    
    document.querySelectorAll('.logout-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove o token do localStorage
            localStorage.removeItem('userToken'); 
            
            // Redireciona para a página inicial ou de login
            window.location.href = '../pages/login.html';
        });
    });

    // --- Outras Lógicas Globais (Mantidas) ---

    const registerButton = document.getElementById('register-button');
    if (registerButton) {
        registerButton.addEventListener('click', () => {
            // Lógica para redirecionar ou abrir modal de cadastro
        });
    }
});