/**
 * Lógica JavaScript para a página da Comunidade.
 * 1. A página e o feed são SEMPRE visíveis (públicos).
 * 2. O formulário de postagem e os botões de interação (Curtir/Comentar)
 * são exibidos/ativados SOMENTE se o usuário estiver logado.
 */

document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('community-feed-container');

    // --- STATUS DE AUTENTICAÇÃO ---
    // A função isAuthenticated é definida em app.js (ou será no futuro, com JWT)
    const IS_LOGGED_IN = typeof isAuthenticated === 'function' && isAuthenticated();

    // --- MOCKS DE DADOS ---
    let posts = [
        {
            id: 1,
            author: "Gabriel Feliciano",
            initials: "GF",
            content: "Comecei a fazer compostagem em casa e já reduzi 30% do meu lixo orgânico! Quem mais está fazendo? Dicas são bem-vindas! 🌱",
            likes: 24,
            comments: 8,
            time: "2 horas atrás",
        },
        {
            id: 2,
            author: "Sulamita Mirelly",
            initials: "SM",
            content: "Organizei uma coleta de óleo usado no meu prédio. Em um mês coletamos 15 litros! Pequenas ações fazem diferença.",
            likes: 18,
            comments: 5,
            time: "5 horas atrás",
        },
        {
            id: 3,
            author: "Kamila Medeiros",
            initials: "KM",
            content: "Dica: usar sacolas reutilizáveis não é só para supermercado! Levo para farmácia, feira, em todo lugar. Já economizei centenas de plásticos! 💚",
            likes: 32,
            comments: 12,
            time: "1 dia atrás",
        },
        {
            id: 4,
            author: "Recylink Oficial",
            initials: "RL",
            content: "Lembrete: o próximo mutirão de limpeza da Praia de Boa Viagem é em 05/12! Inscreva-se na página de Eventos! #Voluntariado",
            likes: 50,
            comments: 10,
            time: "2 dias atrás",
        },
    ];

    // --- LÓGICA DE RENDERIZAÇÃO ---

    // 1. Renderiza o formulário ATIVO (se logado) ou DESATIVADO (se deslogado)
    if (IS_LOGGED_IN) {
        renderForm();
    } else {
        renderLoginPrompt();
    }
    
    // 2. Renderiza o feed de posts (sempre visível)
    renderFeed(posts);


    // --- FUNÇÕES DE RENDERIZAÇÃO DE COMPONENTES ---

    /**
     * Exibe o formulário DESATIVADO e a mensagem de login.
     */
    function renderLoginPrompt() {
        const loginPromptHtml = document.createElement('div');
        loginPromptHtml.className = 'create-post-card';
        
        // Estrutura do formulário desativado com botão de login
        loginPromptHtml.innerHTML = `
            <div class="post-form-wrapper" style="flex-direction: column;">
                <div class="login-prompt-message" style="margin-bottom: 15px; text-align: center;">
                    <h2 style="color: #FBBF24; font-size: 1.2em; margin-bottom: 5px;">Faça Login para Interagir</h2>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                        <p style="color: #9CA3AF;">Acesse sua conta para publicar posts.</p>
                        <a href="login.html?next=comunidade.html" class="btn-post" style="padding: 5px 10px; text-decoration: none;">Login</a>
                    </div>
                </div>
                
                <form class="post-form-wrapper" style="opacity: 0.7; cursor: not-allowed;">
                    <div class="avatar" style="background-color: #66BB6A; opacity: 0.5;">
                        <i class="ph ph-user"></i> 
                    </div>
                    <div style="flex-grow: 1;">
                        <textarea class="post-textarea" placeholder="Faça login para compartilhar..." disabled></textarea>
                        <div class="post-actions-row">
                            <button type="button" class="btn-post" disabled style="opacity: 0.5;">
                                <i class="ph ph-paper-plane-tilt"></i>
                                Publicar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        feedContainer.appendChild(loginPromptHtml);
    }
    
    /**
     * Renderiza o formulário de criação de postagem ATIVO.
     */
    function renderForm() {
        const formHtml = document.createElement('div');
        formHtml.className = 'create-post-card';
        formHtml.innerHTML = `
            <form id="post-form" class="post-form-wrapper">
                <div class="avatar" style="background-color: var(--color-primary-green);">
                    <i class="ph ph-user"></i> 
                </div>
                <div style="flex-grow: 1;">
                    <textarea id="new-post-content" class="post-textarea" placeholder="Compartilhe sua ideia sustentável..."></textarea>
                    <div class="post-actions-row">
                        <button type="submit" class="btn-post">
                            <i class="ph ph-paper-plane-tilt"></i>
                            Publicar
                        </button>
                    </div>
                </div>
            </form>
        `;
        feedContainer.appendChild(formHtml);

        // Adiciona o listener para a submissão do formulário
        document.getElementById('post-form').addEventListener('submit', handlePost);
    }

    /**
     * Renderiza o feed de posts.
     * @param {Array} currentPosts - Array de posts a serem exibidos.
     */
    function renderFeed(currentPosts) {
        // Remover a mensagem de carregamento do HTML inicial
        const initialMessage = feedContainer.querySelector('.loading-message');
        if (initialMessage) {
            initialMessage.remove();
        }

        const feedWrapper = document.createElement('div');
        feedWrapper.id = 'posts-feed';
        
        currentPosts.forEach(post => {
            const postElement = createPostElement(post);
            feedWrapper.appendChild(postElement);
        });
        
        feedContainer.appendChild(feedWrapper);
        
        // Ativa os listeners apenas se estiver logado
        if (IS_LOGGED_IN) {
            attachInteractionListeners();
        } else {
             // Se deslogado, desabilita os botões de interação visualmente (no DOM)
             // Nota: O HTML já está renderizado, esta parte aplica o estilo de desativação
             document.querySelectorAll('.action-button').forEach(btn => {
                 btn.disabled = true;
                 btn.style.opacity = 0.5;
                 btn.style.cursor = 'default';
             });
        }
    }

    /**
     * Cria o elemento HTML de um post.
     */
    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.setAttribute('data-post-id', post.id);
        
        const avatarColor = post.author.includes('Recylink') ? '#FBBF24' : '#3B82F6'; 
        
        postElement.innerHTML = `
            <div class="post-header">
                <div class="avatar" style="background-color: ${avatarColor};">
                    ${post.initials}
                </div>
                <div class="post-author-info">
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-actions">
                <button class="action-button like-button">
                    <i class="ph ph-heart"></i>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="action-button comment-button">
                    <i class="ph ph-chat-circle"></i>
                    <span>${post.comments}</span>
                </button>
            </div>
        `;
        return postElement;
    }


    // --- LÓGICA DE INTERAÇÃO (MOCK) ---

    /**
     * Lógica para submeter um novo post (Mock).
     */
    function handlePost(e) {
        e.preventDefault();
        
        const contentArea = document.getElementById('new-post-content');
        const content = contentArea.value.trim();
        
        if (content) {
            // Em um projeto real, aqui você faria o fetch(POST /api/posts/create)
            
            const newId = posts.length + 1;
            const newPost = {
                id: newId,
                author: "Você (Usuário Logado)", // Viria do perfil do usuário real
                initials: "VC",
                content: content,
                likes: 0,
                comments: 0,
                time: "Agora",
            };
            
            // Adiciona o post ao topo e atualiza o DOM (Mock)
            posts.unshift(newPost); 
            contentArea.value = ''; 

            // Remove o feed antigo e renderiza o novo para incluir a postagem
            const postsFeedElement = document.querySelector('#posts-feed');
            if (postsFeedElement) {
                postsFeedElement.remove();
            }
            renderFeed(posts); 
            
            // Substituir alert() por modal customizado
            alert('Postagem criada com sucesso! (Simulação)');

        } else {
            alert('A mensagem não pode estar vazia.');
        }
    }

    /**
     * Anexa listeners para botões de like/comentário.
     */
    function attachInteractionListeners() {
        // Ativação do Like
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', (e) => {
                // Esta lógica também faria um fetch(POST /api/posts/like) em um projeto real
                const likeCountSpan = e.currentTarget.querySelector('.like-count');
                let count = parseInt(likeCountSpan.textContent);
                
                if (!e.currentTarget.classList.contains('liked')) {
                    likeCountSpan.textContent = count + 1;
                    e.currentTarget.classList.add('liked');
                    e.currentTarget.style.color = '#DC2626'; // Cor de like (Vermelho)
                } else {
                    likeCountSpan.textContent = count - 1;
                    e.currentTarget.classList.remove('liked');
                    e.currentTarget.style.color = '#9CA3AF'; // Volta ao cinza
                }
            });
        });
        
        // Ativação do Comentário
        document.querySelectorAll('.comment-button').forEach(button => {
            button.addEventListener('click', () => {
                alert('A funcionalidade de comentários será implementada na próxima versão! (Simulação)');
            });
        });
    }

});