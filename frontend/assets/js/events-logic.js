/**
 * Lógica JavaScript para a página de Eventos.
 * Este script simula a busca de eventos (dados mockados) e renderiza
 * os cards no HTML usando a estrutura do events.css.
 * * NOVIDADE: Adiciona evento de clique para direcionar o usuário com base no status de login:
 * Se logado -> inscricao.html
 * Se NÃO logado -> login.html
 * * ATENÇÃO: As imagens usam caminhos locais. Certifique-se de que 
 * as imagens correspondentes estejam na pasta 'frontend/assets/images/'.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Variável que armazena os dados mockados dos eventos
    const MOCK_EVENTS = [
        // --- 2025 ---
        {
            id: 1,
            title: "Oficina de Compostagem",
            date: "02 de Dezembro, 2025",
            location: "Centro Comunitário Norte",
            image: "../assets/images/oficina-compostagem.jpg", 
            participants: 24,
            category: "Workshop",
            description: "Aprenda técnicas de compostagem doméstica e transforme resíduos orgânicos em adubo.",
        },
        {
            id: 2,
            title: "Mutirão de Limpeza",
            date: "05 de Dezembro, 2025",
            location: "Praia Central",
            image: "../assets/images/mutirao-limpeza.jpg", 
            participants: 52,
            category: "Voluntariado",
            description: "Participe da limpeza coletiva da praia e ajude a preservar nosso litoral.",
        },
        {
            id: 3,
            title: "Feira de Sustentabilidade",
            date: "27 de Dezembro, 2025",
            location: "Parque Municipal",
            image: "../assets/images/feira-sustentabilidade.jpg",
            participants: 150,
            category: "Feira",
            description: "Conheça produtos sustentáveis, participe de palestras e oficinas sobre meio ambiente.",
        },
        {
            id: 4,
            title: "Palestra: Economia Circular",
            date: "28 de Dezembro, 2025",
            location: "Auditório Central",
            image: "../assets/images/palestra-circular.jpg",
            participants: 80,
            category: "Palestra",
            description: "Entenda como a economia circular pode transformar nossa relação com os recursos.",
        },
        {
            id: 5,
            title: "Plantio de Árvores Nativas",
            date: "10 de Janeiro, 2026",
            location: "Área de Reflorestamento Sul",
            image: "../assets/images/plantio-arvores.jpg",
            participants: 45,
            category: "Voluntariado",
            description: "Ajude a restaurar áreas verdes plantando espécies nativas da região.",
        },
        {
            id: 6,
            title: "Workshop de Upcycling",
            date: "15 de Janeiro, 2026",
            location: "Espaço Criativo",
            image: "../assets/images/workshop-upcycling.jpg",
            participants: 30,
            category: "Workshop",
            description: "Transforme materiais recicláveis em peças úteis e decorativas.",
        },

        // --- 2026 ---
        {
            id: 7,
            title: "Feira Verde da Comunidade",
            date: "18 de Janeiro, 2026",
            location: "Praça da Cidadania",
            image: "../assets/images/feira-comunidade.jpg",
            participants: 120,
            category: "Feira",
            description: "Explore produtos ecológicos e participe de oficinas sobre consumo consciente.",
        },
        {
            id: 8,
            title: "Limpeza de Rios e Lagos",
            date: "09 de Março, 2026",
            location: "Margem do Rio Verde",
            image: "../assets/images/limpeza-rios.jpg",
            participants: 60,
            category: "Voluntariado",
            description: "Ajude a remover resíduos de rios locais e contribua para a preservação da fauna aquática.",
        },
        {
            id: 9,
            title: "Workshop: Energia Solar em Casa",
            date: "21 de Abril, 2026",
            location: "Espaço Sustentável Leste",
            image: "../assets/images/workshop-solar.jpg",
            participants: 35,
            category: "Workshop",
            description: "Aprenda como instalar e utilizar painéis solares de forma prática e acessível.",
        },
        {
            id: 10,
            title: "Palestra: Sustentabilidade nas Cidades",
            date: "16 de Junho, 2026",
            location: "Auditório Municipal",
            image: "../assets/images/palestra-cidades.jpg",
            participants: 90,
            category: "Palestra",
            description: "Debate sobre mobilidade urbana, reciclagem e economia de energia no ambiente urbano.",
        },
    ];

    const eventsListContainer = document.getElementById('events-list-container');
    
    if (eventsListContainer) {
        eventsListContainer.innerHTML = '';
        renderEvents(MOCK_EVENTS);
    }

    /**
     * Função que verifica o status de login e redireciona.
     * @param {number} eventId - O ID do evento.
     */
    function handleParticipation(eventId) {
        // A função isAuthenticated é definida no app.js (ou será no futuro, com JWT)
        if (typeof isAuthenticated === 'function' && isAuthenticated()) {
            // Se logado: vai direto para a inscrição
            // ATENÇÃO: Você precisa criar o inscricao.html
            window.location.href = `inscricao.html?eventId=${eventId}`;
        } else {
            // Se não logado: vai para a tela de login
            // Passamos o eventoId como parâmetro 'next' para que o login possa redirecionar de volta
            // ATENÇÃO: Você precisa substituir alert() por um modal customizado!
            alert('Você precisa estar logado para se inscrever! Redirecionando para o login.'); 
            window.location.href = `login.html?next=inscricao.html?eventId=${eventId}`;
        }
    }

    /**
     * Renderiza a lista de eventos no container.
     * @param {Array} events - Lista de objetos de evento.
     */
    function renderEvents(events) {
        if (events.length === 0) {
            eventsListContainer.innerHTML = '<p class="loading-message">Nenhum evento encontrado no momento.</p>';
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';

            card.innerHTML = `
                <div class="event-image-container">
                    <img src="${event.image}" 
                         alt="Imagem do evento: ${event.title}" 
                         onerror="this.onerror=null;this.src='../assets/images/placeholder.jpg';" />
                </div>
                <div class="event-content">
                    <div class="event-badges">
                        <span class="badge">${event.category}</span>
                        <div class="participants">
                            <i class="ph ph-users meta-icon" style="color: #9CA3AF;"></i>
                            <span>${event.participants}</span>
                        </div>
                    </div>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-description">${event.description}</p>
                    <div class="event-meta">
                        <div class="meta-item">
                            <i class="ph ph-calendar-blank meta-icon"></i>
                            <span>${event.date}</span>
                        </div>
                        <div class="meta-item">
                            <i class="ph ph-map-pin meta-icon"></i>
                            <span>${event.location}</span>
                        </div>
                    </div>
                    <!-- Botão com ID do Evento -->
                    <button class="btn-participate" data-event-id="${event.id}">Participar</button>
                </div>
            `;
            
            eventsListContainer.appendChild(card);
        });
        
        // Adiciona listeners aos botões
        document.querySelectorAll('.btn-participate').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.currentTarget.getAttribute('data-event-id');
                handleParticipation(eventId);
            });
        });
    }
});