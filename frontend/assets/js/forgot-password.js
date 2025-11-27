/**
 * Lógica JavaScript para a página de Recuperação de Senha.
 * - Envia a solicitação de recuperação para a rota segura do backend.
 * - Aguarda a resposta (sucesso no envio do e-mail).
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');

    if (form) {
        form.addEventListener('submit', handlePasswordRecovery);
    }

    async function handlePasswordRecovery(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();

        if (!email) {
            // Substituir alert() por modal customizado
            alert('Por favor, digite seu e-mail.');
            return;
        }

        try {
            // 1. Fazer fetch(POST /api/forgot-password) com o e-mail
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();

            // 2. O backend sempre retorna 200 (OK) para não revelar se o e-mail existe
            // A mensagem de sucesso (ou não-sucesso simulado) vem no corpo da resposta
            if (response.ok) {
                 // Substituir alert() por modal customizado
                alert(`Um link para redefinição de senha foi enviado para ${email}. Verifique sua caixa de entrada!`);
            } else {
                // Erro real do servidor (ex: falha no Mailtrap)
                alert(data.message || 'Erro interno do servidor ao tentar enviar o e-mail.');
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            // Substituir alert() por modal customizado
            alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }

        // Limpa o formulário e permite que o usuário prossiga
        form.reset();
        // Não redirecionamos imediatamente para permitir que o usuário veja a mensagem
    }
});