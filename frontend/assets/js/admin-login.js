/**
 * Lógica JavaScript para o Login do Administrador.
 * - Envia credenciais para a rota de admin segura.
 * - Armazena o token e redireciona para o painel de administração.
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLoginSubmit);
    }

    async function handleAdminLoginSubmit(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
const password = document.getElementById("password").value;


        // Limpa qualquer token antigo por segurança
        localStorage.removeItem('userToken');

        try {
            // Chamada para a rota de login de admin segura no backend
            const response = await fetch('/api/admin/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha: password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // SUCESSO: Salvar o JWT (Será usado pelo admin.js para verificar o acesso)
                localStorage.setItem('userToken', data.token);
                
                // MOCK: Substituir alert() por modal customizado
                alert('Acesso de Administrador concedido. Bem-vindo(a)!'); 

                // Redireciona para o Dashboard Admin
                window.location.href = 'admin-dashboard.html';

            } else {
                // FALHA: Exibe a mensagem de erro do servidor (inclui falha de credencial OU de NÍVEL DE ACESSO)
                // MOCK: Substituir alert() por modal customizado
                alert(data.message || 'Falha no login. Verifique se você tem permissões de administrador.');
            }
        } catch (error) {
            console.error('Erro de rede ou servidor:', error);
            // MOCK: Substituir alert() por modal customizado
            alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }
    }
});