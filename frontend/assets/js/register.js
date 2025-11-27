// URL base da sua API. Deve corresponder ao seu servidor Node.js/Express.
const API_BASE_URL = 'http://localhost:3000/api';
const REGISTER_ENDPOINT = `${API_BASE_URL}/register`;

document.addEventListener('DOMContentLoaded', () => {
    // Declaração do formulário no escopo global para o event listener
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        // O event listener chama a função handleRegisterSubmit
        registerForm.addEventListener('submit', handleRegisterSubmit);
    } else {
        console.error("Erro: Formulário de cadastro (ID 'register-form') não encontrado.");
    }
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
        
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.prepend(messageContainer);
        } else {
            console.error("Não foi possível anexar a mensagem de feedback.");
            return;
        }
    }
    
    messageContainer.textContent = message;
    
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
 * Lida com o envio do formulário de cadastro.
 * @param {Event} e - O evento de submissão do formulário.
 */
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    // 1. Captura dos dados
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value; // Captura do campo de confirmação
    
    // CORREÇÃO CRÍTICA DO ERRO DE REFERÊNCIA: 
    // Usamos o querySelector para pegar o botão diretamente no DOM.
    const submitButton = document.querySelector('#register-form button[type="submit"]');

    if (password !== confirmPassword) {
        displayMessage("A senha e a confirmação de senha não coincidem.", 'error');
        return;
    }
    
    if (!name || !email || !password || !phone) {
        displayMessage("Por favor, preencha todos os campos obrigatórios.", 'error');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Registrando...";

    const registerData = { name, email, phone, password };

    try {
        const response = await fetch(REGISTER_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
        });
        
        const result = await response.json();

        if (!response.ok) {
            // Se o status for 400, 409 (Conflito), 500 etc.
            displayMessage(result.message || "Erro desconhecido ao cadastrar.", 'error');
            return;
        }

        // Cadastro bem-sucedido (Status 201 Created)
        displayMessage(result.message, 'success');
        
        // Redireciona para a página de confirmação de cadastro
        if (result.redirect) {
            setTimeout(() => {
                window.location.href = result.redirect; 
            }, 1000);
        }

    } catch (error) {
        console.error('Erro de rede ou servidor:', error);
        displayMessage("Não foi possível conectar ao servidor. Verifique se o backend está rodando.", 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Registrar";
    }
}