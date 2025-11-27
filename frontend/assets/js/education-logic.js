/**
 * Lógica JavaScript para a página de Educação Ambiental.
 * 1. Renderiza o conteúdo em destaque e os cards.
 * 2. Gerencia o Call-to-Action (CTA) para a Comunidade,
 * redirecionando com base no status de login.
 */

document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('educational-content-container');
    const ctaSection = document.getElementById('cta-section');

    // --- DADOS MOCKADOS DE CONTEÚDO (DEVE SER MANTIDO SINCRONIZADO COM education-detail-logic.js) ---
    const educationalContent = [
        {
            id: 1,
            title: "Como separar seu lixo corretamente?",
            category: "Guia Básico",
            readTime: "5 min",
            description: "Aprenda a separar seus resíduos de forma adequada para facilitar a reciclagem e reduzir o impacto ambiental.",
            tips: [
                "Separe resíduos secos (recicláveis) dos úmidos (orgânicos)",
                "Lave embalagens antes de descartar",
                "Remova tampas e rótulos quando possível",
                "Não misture materiais recicláveis com orgânicos",
            ],
            icon: "ph-recycle",
            iconEmoji: "♻️"
        },
        {
            id: 2,
            title: "O que é coleta seletiva?",
            category: "Educação",
            readTime: "4 min",
            description: "Entenda o sistema de coleta seletiva e como ele funciona para melhorar a reciclagem em sua cidade.",
            tips: [
                "Coleta seletiva separa materiais recicláveis do lixo comum",
                "Cada cor de lixeira representa um tipo de material",
                "Verde para vidro, azul para papel, vermelho para plástico",
                "Amarelo para metal, marrom para orgânico",
            ],
            icon: "ph-trash-simple",
            iconEmoji: "🗑️"
        },
        {
            id: 3,
            title: "3 passos para reduzir plástico em casa",
            category: "Dicas Práticas",
            readTime: "3 min",
            description: "Pequenas mudanças no dia a dia podem reduzir drasticamente o uso de plástico descartável.",
            tips: [
                "Substitua sacolas plásticas por reutilizáveis",
                "Use garrafas e copos reutilizáveis",
                "Compre produtos a granel e evite embalagens",
                "Prefira produtos com embalagens biodegradáveis",
            ],
            icon: "ph-drop",
            iconEmoji: "🌊"
        },
        {
            id: 4,
            title: "Compostagem doméstica para iniciantes",
            category: "Tutorial",
            readTime: "8 min",
            description: "Transforme resíduos orgânicos em adubo rico para plantas e jardins.",
            tips: [
                "Use restos de frutas, verduras e cascas de ovos",
                "Evite carnes, laticínios e óleos",
                "Mantenha equilíbrio entre materiais verdes e marrons",
                "Revire o composto regularmente para aeração",
            ],
            icon: "ph-leaf",
            iconEmoji: "🌱"
        },
        {
            id: 5,
            title: "Economia de água no dia a dia",
            category: "Sustentabilidade",
            readTime: "6 min",
            description: "Aprenda técnicas simples para economizar água e reduzir desperdícios em casa.",
            tips: [
                "Feche a torneira ao escovar os dentes",
                "Tome banhos mais curtos",
                "Reutilize água da máquina de lavar",
                "Conserte vazamentos imediatamente",
            ],
            icon: "ph-tint",
            iconEmoji: "💧"
        },
        {
            id: 6,
            title: "O impacto dos resíduos eletrônicos",
            category: "Conscientização",
            readTime: "7 min",
            description: "Entenda os riscos do descarte incorreto de eletrônicos e onde descartá-los.",
            tips: [
                "Eletrônicos contêm metais pesados tóxicos",
                "Procure pontos de coleta especializados",
                "Doe equipamentos funcionais",
                "Recicle baterias e pilhas separadamente",
            ],
            icon: "ph-device-mobile-camera",
            iconEmoji: "📱"
        },
    ];

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    /**
     * Renderiza o banner de destaque e a grade de cards.
     */
    function renderContent() {
        contentContainer.innerHTML = ''; // Limpa a mensagem de carregamento
        
        // 1. Renderiza o banner de destaque
        const featuredCard = document.createElement('div');
        featuredCard.className = 'featured-card';
        featuredCard.innerHTML = `
            <div class="featured-grid">
                <div class="featured-visual">
                    <div class="featured-visual-content">
                        <i class="ph ph-book-open icon"></i>
                        <h2>Centro de Conhecimento</h2>
                        <p>Dicas práticas para um estilo de vida sustentável</p>
                    </div>
                </div>
                <div class="featured-text">
                    <span class="badge" style="color: var(--color-text-dark); background-color: #FBBF24;">Destaque</span>
                    <h3>Por que a educação ambiental é importante?</h3>
                    <p class="subtitle" style="color: #ccc;">
                        A educação ambiental é fundamental para criar consciência sobre os
                        impactos de nossas ações no planeta. Pequenas mudanças de hábitos
                        podem gerar grandes transformações para o meio ambiente e para as
                        futuras gerações.
                    </p>
                </div>
            </div>
        `;
        contentContainer.appendChild(featuredCard);

        // 2. Renderiza a grade de cards
        const contentGrid = document.createElement('div');
        contentGrid.className = 'content-grid';

        educationalContent.forEach(content => {
            const card = document.createElement('div');
            card.className = 'content-card';
            
            const tipsHtml = content.tips.slice(0, 2).map(tip => `
                <div class="tip-item">
                    <i class="ph ph-check-circle tip-icon"></i>
                    <span>${tip}</span>
                </div>
            `).join('');

            card.innerHTML = `
                <div class="content-card-header">
                    <div class="icon" style="color: var(--color-primary-green);">${content.iconEmoji}</div>
                    <span class="badge">${content.category}</span>
                </div>
                <h3>${content.title}</h3>
                <p style="color: #9CA3AF; margin-bottom: 10px; font-size: 0.9em;">
                    ${content.description}
                </p>
                <div class="read-time">
                    <i class="ph ph-clock tip-icon"></i>
                    <span>${content.readTime} de leitura</span>
                </div>
                
                <div class="tip-list">
                    ${tipsHtml}
                </div>
                
                <a href="detalhe-educacao.html?id=${content.id}" class="read-more">
                    Ler mais
                    <i class="ph ph-arrow-right"></i>
                </a>
            `;
            contentGrid.appendChild(card);
        });
        
        contentContainer.appendChild(contentGrid);
    }

    /**
     * Renderiza o Call to Action (CTA) inferior.
     */
    function renderCTA() {
        const ctaCard = document.createElement('div');
        ctaCard.className = 'cta-bottom-card';
        
        ctaCard.innerHTML = `
            <div class="cta-info">
                <div class="cta-icon-container">
                    <i class="ph ph-lightbulb"></i>
                </div>
                <div>
                    <div class="cta-title">Tem uma dica sustentável?</div>
                    <p class="cta-subtitle">
                        Compartilhe seu conhecimento com a comunidade.
                    </p>
                </div>
            </div>
            <a href="#" id="cta-share-button" class="cta-button">
                COMPARTILHAR DICA
            </a>
        `;
        
        ctaSection.appendChild(ctaCard);

        // Adiciona a lógica do fluxo de autenticação ao botão
        document.getElementById('cta-share-button').addEventListener('click', handleCtaClick);
    }

    /**
     * Gerencia o clique no CTA, aplicando o fluxo de autenticação.
     */
    function handleCtaClick(e) {
        e.preventDefault();
        
        // A função isAuthenticated é definida em app.js (ou será no futuro, com JWT)
        if (typeof isAuthenticated === 'function' && isAuthenticated()) {
            // SE JÁ ESTIVER LOGADO -> VAI PARA A COMUNIDADE (onde ele pode postar)
            window.location.href = 'comunidade.html';
        } else {
            // SE NÃO ESTIVER LOGADO -> VAI PARA O LOGIN
            // O login irá redirecionar para 'comunidade.html' após o sucesso
            alert('Você precisa estar logado para compartilhar! Redirecionando para o login.'); 
            window.location.href = 'login.html?next=comunidade.html';
        }
    }

    // --- INICIALIZAÇÃO ---
    renderContent();
    renderCTA();

});