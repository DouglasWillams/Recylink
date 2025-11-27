/**
 * Lógica JavaScript para o Admin Dashboard.
 * - Gerencia a autenticação e verificação de Nível de Acesso (CRÍTICO).
 * - Gerencia a navegação interna e renderiza o conteúdo dinâmico (Moderação, Usuários).
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const adminContentArea = document.getElementById('admin-content-area');
    const pageTitle = document.getElementById('page-title');
    const navItems = document.querySelectorAll('.admin-nav-item');
    const adminUserName = document.getElementById('admin-user-name');
    
    // --- MOCK DE DADOS (Simulação de itens pendentes de aprovação) ---
    const MOCK_PENDING_EVENTS = [
        { id: 101, title: 'Mutirão de Limpeza do Mangue', submittedBy: 'João V. O.', date: '2026-03-10', status: 'Pendente', category: 'Voluntariado' },
        { id: 102, title: 'Workshop de Reuso de Vidros', submittedBy: 'Ana C. M.', date: '2026-02-28', status: 'Pendente', category: 'Workshop' },
        { id: 103, title: 'Feira de Produtos Locais', submittedBy: 'Maria P. S.', date: '2026-04-15', status: 'Pendente', category: 'Feira' },
    ];

    const MOCK_USERS_DATA = [
        { id: 201, name: 'João Victor O.', email: 'joao@user.com', level: 'População Ativa', joined: '2025-09-01' },
        { id: 202, name: 'Ana Carolina M.', email: 'ana@user.com', level: 'População', joined: '2025-10-15' },
        { id: 203, name: 'Douglas W. B.', email: 'douglas@admin.com', level: 'Administrador', joined: '2025-08-20' },
    ];
    
    // --- FLUXO DE AUTENTICAÇÃO (CRÍTICO) ---
    
    // ATENÇÃO: Esta é a área mais crítica e deve ser REALMENTE implementada no backend.
    // Usamos um MOCK aqui para testar a UI.
    
    // Simulação: A função isAuthenticated deve ser global (definida em app.js)
    const IS_LOGGED_IN = typeof isAuthenticated === 'function' && isAuthenticated();
    
    // Em um projeto real, você verificaria o nível de acesso do JWT
    // Por enquanto, forçamos o acesso, mas o login real precisa ser seguro.
    const IS_ADMIN = true; 
    const USER_NAME = 'Administrador';
    
    if (IS_LOGGED_IN && IS_ADMIN) {
        adminUserName.textContent = USER_NAME;
        setupNavigation();
        showPage('overview');
    } else {
        // Se não for admin (ou não estiver logado), redireciona.
        // Substituir alert() por modal customizado
        alert('Acesso negado. Você deve ser um administrador logado.'); 
        window.location.href = '../pages/login.html';
        return;
    }
    
    // Lógica de Logout
    document.querySelector('.logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        // Em projeto real: Limpar token JWT
        // Substituir alert() por modal customizado
        alert('Sessão encerrada. Redirecionando para o login.'); 
        window.location.href = '../admin/admin-login.html';
    });


    // --- NAVEGAÇÃO E RENDERIZAÇÃO ---

    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-page');
                
                navItems.forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                showPage(page);
            });
        });
    }

    function showPage(page) {
        let content = '';
        let title = '';

        switch (page) {
            case 'overview':
                title = 'Visão Geral';
                content = renderOverview();
                break;
            case 'events':
                title = 'Moderação de Eventos';
                content = renderEventsModeration(MOCK_PENDING_EVENTS);
                break;
            case 'users':
                title = 'Gerenciar Usuários';
                content = renderUsersManagement(MOCK_USERS_DATA);
                break;
            case 'settings':
                title = 'Configurações';
                content = '<p>Funcionalidade de configurações do sistema. (Em desenvolvimento)</p>';
                break;
        }

        pageTitle.textContent = title;
        adminContentArea.innerHTML = content;
        
        // Anexar listeners dinâmicos se estiver na página de eventos
        if (page === 'events') {
            setupEventModerationListeners();
        }
    }

    // --- FUNÇÕES DE CONTEÚDO ---

    function renderOverview() {
        // MOCK de estatísticas
        const totalUsers = MOCK_USERS_DATA.length;
        const pendingEvents = MOCK_PENDING_EVENTS.length;
        const totalPoints = 54200; // Mock de pontos totais de reciclagem

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Usuários Registrados</h3>
                    <p class="value">${totalUsers}</p>
                </div>
                <div class="stat-card">
                    <h3>Eventos Pendentes</h3>
                    <p class="value" style="color: #FBBF24;">${pendingEvents}</p>
                    <a href="#" onclick="document.querySelector('[data-page=events]').click(); return false;" style="color: #9CA3AF; font-size: 0.9em; text-decoration: underline;">Revisar Agora</a>
                </div>
                <div class="stat-card">
                    <h3>Pontos de Reciclagem</h3>
                    <p class="value">${totalPoints}</p>
                </div>
            </div>
            
            <h2 style="color: #E5E7EB; margin-top: 30px; margin-bottom: 20px;">Atividade Recente</h2>
            <p style="color: #9CA3AF;">Gráfico de adesão e mapa de atividade viriam aqui.</p>
        `;
    }

    function renderEventsModeration(events) {
        if (events.length === 0) {
            return '<h3 style="color: #10B981;">Nenhum evento pendente de aprovação.</h3>';
        }
        
        const rows = events.map(event => `
            <tr>
                <td>${event.id}</td>
                <td>${event.title}</td>
                <td>${event.submittedBy}</td>
                <td>${event.date}</td>
                <td><span class="status-badge status-pending">${event.status}</span></td>
                <td>
                    <button class="action-btn btn-view" data-id="${event.id}">Ver Detalhes</button>
                    <button class="action-btn btn-approve" data-id="${event.id}">Aprovar</button>
                    <button class="action-btn btn-reject" data-id="${event.id}">Rejeitar</button>
                </td>
            </tr>
        `).join('');

        return `
            <style>
                /* Estilos injetados para a tabela (complementam admin-style.css) */
                .admin-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .admin-table th, .admin-table td { padding: 12px; text-align: left; border-bottom: 1px solid #374151; }
                .admin-table th { background-color: #2c3e50; color: var(--color-primary-green); }
                .action-btn { padding: 5px 10px; margin-right: 5px; border: none; border-radius: 4px; cursor: pointer; color: white; }
                .btn-approve { background-color: #10B981; }
                .btn-reject { background-color: #DC2626; }
                .btn-view { background-color: #3B82F6; }
                .status-badge { padding: 3px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
                .status-pending { background-color: #FBBF24; color: #1F2937; }
            </style>
            
            <h3>Eventos Sugeridos (Aguardando Moderação: ${events.length})</h3>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Sugerido por</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }
    
    function renderUsersManagement(users) {
        const rows = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.level}</td>
                <td>${user.joined}</td>
                <td>
                    <button class="action-btn btn-view" data-id="${user.id}">Editar Nível</button>
                    <button class="action-btn btn-reject" data-id="${user.id}">Excluir</button>
                </td>
            </tr>
        `).join('');

        return `
            <style>
                /* Estilos injetados para a tabela (reutiliza admin-style.css) */
                .admin-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .admin-table th, .admin-table td { padding: 12px; text-align: left; border-bottom: 1px solid #374151; }
                .admin-table th { background-color: #2c3e50; color: var(--color-primary-green); }
                .action-btn { padding: 5px 10px; margin-right: 5px; border: none; border-radius: 4px; cursor: pointer; color: white; }
                .btn-view { background-color: #3B82F6; }
                .btn-reject { background-color: #DC2626; }
            </style>
            
            <h3>Usuários Registrados (${users.length})</h3>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Nível</th>
                        <th>Desde</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    // --- LISTENERS DE INTERAÇÃO (MOCK) ---

    function setupEventModerationListeners() {
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                // MOCK:
                // Em projeto real: fetch(POST /api/admin/events/approve/${id}, { headers: { Authorization: 'Bearer token' }})
                // Substituir alert() por modal customizado
                alert(`Evento ${id} APROVADO! Será publicado no feed.`);
                // Lógica para remover o item da lista (Mock)
                MOCK_PENDING_EVENTS.splice(MOCK_PENDING_EVENTS.findIndex(e => e.id == id), 1);
                showPage('events'); // Recarrega a lista
            });
        });
        
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                // MOCK:
                // Substituir alert() por modal customizado
                alert(`Evento ${id} REJEITADO! Notificação enviada ao usuário.`);
                // Lógica para remover o item da lista (Mock)
                MOCK_PENDING_EVENTS.splice(MOCK_PENDING_EVENTS.findIndex(e => e.id == id), 1);
                showPage('events'); 
            });
        });
        
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                // Substituir alert() por modal customizado
                alert(`Exibindo detalhes do Evento ID: ${id}. Aqui abriria um modal/nova página.`);
            });
        });
    }

});