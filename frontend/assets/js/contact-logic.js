/**
 * Lógica JavaScript para o Formulário de Contato na Home Page.
 * - Gerencia a submissão do formulário.
 * - Simula a comunicação com o backend (sem implementar o fetch real).
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    function handleContactSubmit(e) {
        e.preventDefault();

        // Em um projeto real, aqui você faria a validação de formulário mais robusta
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            // ATENÇÃO: Substituir alert() por um modal customizado!
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // --- SIMULAÇÃO DE ENVIO ---
        
        // Em um projeto real, aqui você faria o fetch(POST /api/contact) para o backend
        /*
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });
            const result = await response.json();
            
            if (response.ok) {
                alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                contactForm.reset();
            } else {
                alert(result.message || 'Erro ao enviar mensagem.');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            alert('Não foi possível conectar ao servidor para enviar a mensagem.');
        }
        */

        // MOCK: Simula o sucesso
        // ATENÇÃO: Substituir alert() por um modal customizado!
        alert(`Mensagem de ${name} enviada com sucesso! Entraremos em contato em breve.`);
        contactForm.reset(); // Limpa o formulário após o mock
    }
});