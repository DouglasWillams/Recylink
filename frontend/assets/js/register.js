// frontend/assets/js/register.js
// Base da API: Agora usa o caminho relativo /api
const API_BASE_URL = '/api'; 
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`; 
function displayMessage(message, type) {
    // Função utilitária para exibir mensagens de erro/sucesso (usando alert para simplicidade, mas substitua por modal)
    const color = type === 'success' ? 'green' : 'red';
    console.log(`[${type.toUpperCase()}]: ${message}`);
    alert(`${message}`);
}
async function handleRegisterSubmit(e) {
    // CRÍTICO: Previne o envio tradicional do formulário
    e.preventDefault();
    const form = e.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    // 1. Captura e Validação dos dados
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (password !== confirmPassword) {
        displayMessage("A senha e a confirmação de senha não coincidem.", 'error');
        return;
    }
    if (!name || !email || !password) {
        displayMessage("Preencha todos os campos obrigatórios.", 'error');
        return;
    }
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Registrando...";
    }
    // Corrigindo o nome da propriedade para o backend
    const registerData = { 
        nome: name, 
        email, 
        telefone: phone, 
        password 
    };
    // 3. Envio para a API
    try {
        const response = await fetch(REGISTER_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData),
        });
        const result = await response.json();
        if (!response.ok) {
            displayMessage(result.message || "Erro desconhecido ao cadastrar.", 'error');
            return;
        }
        // Cadastro bem-sucedido (Status 201 Created)
        displayMessage(result.message || 'Cadastro realizado com sucesso!', 'success');
        // 4. Redireciona
        setTimeout(() => {
            // O redirecionamento aponta para a pasta /pages
            window.location.href = 'login.html'; 
        }, 700);
    } catch (error) {
        console.error('Erro de rede ou servidor:', error);
        displayMessage("Não foi possível conectar ao servidor. Verifique se o backend está rodando.", 'error');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Registrar";
        }
    }
}
// ==========================================================
// ANEXAR O LISTENER APÓS O CARREGAMENTO DO DOM (CRÍTICO)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        // Anexa o listener de submit ao formulário
        registerForm.addEventListener('submit', handleRegisterSubmit);
    } else {
        console.error("Erro: Formulário de cadastro (ID 'register-form') não encontrado.");
    }
});