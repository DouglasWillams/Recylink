/**
 * Lógica JavaScript para a página de Inscrição em Eventos.
 * 1. Puxa o ID do evento da URL.
 * 2. Simula a busca dos detalhes do evento (usando a lista mockada de events-logic.js).
 * 3. Popula os detalhes do evento na página.
 * 4. Lógica de submissão do formulário.
 */

document.addEventListener('DOMContentLoaded', () => {
    const eventInfoContainer = document.getElementById('event-info-container');
    const inscricaoForm = document.getElementById('inscricao-form');
    
    // --- Funções Auxiliares ---
    
    // Puxa o ID do evento da URL (ex: inscricao.html?eventId=1)
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    
    // Simulação dos dados do evento (deve vir do backend em um projeto real)
    const MOCK_EVENTS = [
        // Usamos a mesma lista de MOCK_EVENTS do events-logic.js para consistência
        {
            id: '1', // IDs são strings na URL
            title: "Oficina de Compostagem",
            date: "20 de Outubro, 2025",
            location: "Centro Comunitário Norte",
            image: "../assets/images/oficina-compostagem.jpg", 
            description: "Aprenda técnicas de compostagem doméstica e transforme resíduos orgânicos em adubo.",
        },
        {
            id: '2', 
            title: "Mutirão de Limpeza",
            date: "05 de Novembro, 2025",
            location: "Praia Central",
            image: "../assets/images/mutirao-limpeza.jpg", 
            description: "Participe da limpeza coletiva da praia e ajude a preservar nosso litoral.",
        },
        // Adicione aqui todos os eventos mockados, ou implemente a chamada real ao backend
    ];

    
    // 1. Encontra o evento pelo ID
    const event = MOCK_EVENTS.find(e => e.id === eventId);

    if (!eventId || !event) {
        eventInfoContainer.innerHTML = '<h2>Evento não encontrado.</h2><p>Verifique o link e tente novamente.</p>';
        return;
    }

    // 2. Renderiza os detalhes do evento
    eventInfoContainer.innerHTML = `
        <div class="event-details">
            <img src="${event.image}" alt="Imagem do Evento" onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';" />
            <div>
                <h2 style="color: var(--color-primary-green); margin-bottom: 10px;">${event.title}</h2>
                <p style="margin-bottom: 15px;">${event.description}</p>
                <div class="detail-item">
                    <i class="ph ph-calendar-blank" style="color: var(--color-primary-green);"></i>
                    <span>${event.date}</span>
                </div>
                <div class="detail-item">
                    <i class="ph ph-map-pin" style="color: var(--color-primary-green);"></i>
                    <span>${event.location}</span>
                </div>
            </div>
        </div>
    `;

    // 3. Simula o pré-preenchimento dos dados do usuário (em um projeto real, isso viria do JWT/API)
    document.getElementById('nome-completo').value = "Douglas Willams"
    document.getElementById('email').value = "douglas.willams@hotmail.com"


    // 4. Lógica de submissão
    inscricaoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const telefone = document.getElementById('telefone').value;

        // Simulação de sucesso (em um projeto real, enviaria dados para /api/inscricao)
        
        // Substituir alert() por modal customizado
        alert(`Inscrição confirmada para o evento: ${event.title}! Seu telefone: ${telefone}.`);
        
        // Redireciona para o dashboard ou volta para a lista de eventos
        window.location.href = 'dashboard.html';
    });
});