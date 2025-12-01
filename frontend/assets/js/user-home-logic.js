// frontend/assets/js/user-home-logic.js
let fetchJson;
let escapeHtml;
let API_BASE;
// Função auxiliar para selecionar um elemento no DOM
function qs(sel) {
    return document.querySelector(sel);
}
// Função para injetar as dependências (chamada pelo dashboard.js)
export function setDependencies(dependencies) {
    fetchJson = dependencies.fetchJson;
    escapeHtml = dependencies.escapeHtml;
    API_BASE = dependencies.API_BASE;
}
/* ================================================================
FUNÇÕES DE NAVEGAÇÃO E EVENTOS
================================================================ */
function goToEditPage(eventId) {
    window.location.href = `edit-event.html?id=${eventId}`;
}
async function handleDeleteClick(eventId) {
    if (!confirm('ATENÇÃO: Tem certeza que deseja APAGAR este evento? Esta ação é irreversível.')) {
        return;
    }
    try {
        // Rota DELETE: /api/evento/eventos/meus/:id
        await fetchJson(`/evento/eventos/meus/${eventId}`, {
            method: 'DELETE'
        });
        alert('Evento excluído com sucesso!');
        fetchMyCreatedEventsForEditing(qs('#my-created-events-list'));
    } catch (err) {
        console.error('Erro ao excluir evento:', err);
        alert('Falha ao excluir evento: ' + (err.message || 'Erro no servidor.'));
    }
}
/* ================================================================
HOME (Somente Eventos)
================================================================ */
export async function renderHomeContent(container) {
    container.innerHTML = '<h2><i class="ph ph-sparkles"></i> Visão Geral</h2>';
    const joinedDate = document.body.dataset.userCreatedAt
        ? new Date(document.body.dataset.userCreatedAt).toLocaleDateString('pt-BR')
        : 'N/A';
    const userEmail = document.body.dataset.userEmail || 'N/A';
    const userPhone = document.body.dataset.userPhone || 'Não informado';
    container.innerHTML += `
<div style="margin-top: 20px; margin-bottom: 30px;" class="info-card-dash">
<h2>Dados da Conta</h2>
<div class="data-item"><strong>E-mail:</strong> ${userEmail}</div>
<div class="data-item"><strong>Telefone:</strong> ${userPhone}</div>
<div class="data-item"><strong>Membro Desde:</strong> ${joinedDate}</div>
</div>
`;
    container.innerHTML += `
<div style="margin-top: 30px;" class="info-card-dash">
<h2>Próximos Eventos</h2>
<div id="home-eventos-list"><p style="color: #9CA3AF;">Carregando eventos...</p></div>
</div>
`;
    loadEvents();
}
// Carrega SOMENTE eventos (posts removidos)
async function loadEvents() {
    try {
        const eventos = await fetchJson('/evento/eventos');
        const target = qs('#home-eventos-list');
        if (target) {
            if (!Array.isArray(eventos) || eventos.length === 0) {
                target.innerHTML = '<p style="color: #E5E7EB;">Nenhum evento aprovado no momento.</p>';
            } else {
                const html = eventos.slice(0, 3).map(ev => `
<div class="data-item" style="border-left: 3px solid #66BB6A; padding-left: 10px;">
<strong style="color:var(--color-primary-green)">${escapeHtml(ev.titulo)}</strong>
<div style="font-size:12px;color:#ccc">
${new Date(ev.data_evento).toLocaleString('pt-BR')}
</div>
</div>
`).join('');
                target.innerHTML = `
<div style="margin-top: 10px;">${html}</div>
<a href="eventos.html" class="text-center"
style="color: #FBBF24; display:block; margin-top:15px;">
Ver Todos
</a>
`;
            }
        }
    } catch (err) {
        const target = qs('#home-eventos-list');
        if (target) {
            target.innerHTML = `<p style="color: #DC2626;">Erro ao carregar eventos: ${escapeHtml(err.message)}</p>`;
        }
        console.error(err);
    }
}
/* ================================================================
PERFIL
================================================================ */
export function renderProfileContent(container, userProfile) {
    const userName = document.body.dataset.userName || userProfile.nome;
    const userEmail = document.body.dataset.userEmail || userProfile.email;
    const userPhone = document.body.dataset.userPhone || userProfile.telefone || '';
    container.innerHTML = `
<div class="info-card-dash">
<h2><i class="ph ph-pencil-simple"></i> Editar Perfil</h2>
<form id="edit-profile-form">
<div class="form-group">
<label for="profile-name">Nome</label>
<input type="text" id="profile-name" value="${escapeHtml(userName)}" required>
</div>
<div class="form-group">
<label for="profile-email">E-mail</label>
<input type="email" id="profile-email" value="${escapeHtml(userEmail)}" disabled>
</div>
<div class="form-group">
<label for="profile-phone">Telefone</label>
<input type="tel" id="profile-phone" value="${escapeHtml(userPhone)}">
</div>
<button type="submit" class="btn">
<i class="ph ph-floppy-disk"></i> Salvar
</button>
</form>
</div>
`;
    document.getElementById('edit-profile-form').addEventListener('submit', handleProfileUpdate);
}
async function handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]');
    const nome = form.querySelector('#profile-name').value.trim();
    const telefone = form.querySelector('#profile-phone').value.trim();
    if (!nome) return alert('O nome é obrigatório.');
    btn.disabled = true;
    btn.textContent = 'Salvando...';
    try {
        // Rota PUT para /api/profile
        const result = await fetchJson('/profile', { 
            method: 'PUT',
            body: JSON.stringify({ nome, telefone })
        });
        alert(result.message || 'Perfil atualizado com sucesso!');
        
        // Atualiza o DOM e o armazenamento local
        document.body.dataset.userName = result.user.nome;
        document.body.dataset.userPhone = result.user.telefone || '';
        const displayElement = document.getElementById('user-display-name');
        if (displayElement) displayElement.textContent = result.user.nome;
        
    } catch (err) {
        alert('Falha ao atualizar: ' + (err.message || 'Erro no servidor.'));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar';
    }
}
/* ================================================================
INSCRIÇÕES
================================================================ */
export async function renderMyRegistrations(container) {
    container.innerHTML = `
<div class="info-card-dash">
<h2><i class="ph ph-calendar-check"></i> Minhas Inscrições</h2>
<div id="registrations-list">
<p style="color: #9CA3AF;">Carregando suas inscrições...</p>
</div>
</div>
`;
    const listContainer = document.getElementById('registrations-list');
    try {
        // Rota esperada: /api/evento/minhas-inscricoes
        const registrations = await fetchJson('/evento/minhas-inscricoes');
        if (!registrations || registrations.length === 0) {
            listContainer.innerHTML =
                '<p style="color: #9CA3AF;">Você não está inscrito em nenhum evento ainda.</p>';
            return;
        }
        const listHtml = registrations.map(reg => `
<div class="data-item" style="border-left: 5px solid var(--color-primary-green); padding-left: 10px;">
<strong>${escapeHtml(reg.titulo)}</strong>
Evento: ${new Date(reg.data_evento).toLocaleDateString('pt-BR')}<br>
Inscrito em: ${new Date(reg.data_inscricao).toLocaleDateString('pt-BR')}
</div>
`).join('');
        listContainer.innerHTML = listHtml;
    } catch (err) {
        listContainer.innerHTML =
            `<p style="color: #DC2626;">Erro ao carregar inscrições: ${escapeHtml(err.message)}</p>`;
    }
}
/* ================================================================
SUGERIR EVENTO
================================================================ */
export function renderSuggestEvent(container) {
    container.innerHTML = `
<div class="info-card-dash">
<h2><i class="ph ph-calendar-plus"></i> Sugerir Novo Evento</h2>
<p style="color: #9CA3AF; margin-bottom: 20px;">Seu evento será publicado imediatamente.</p>
<form id="suggest-event-form">
<div class="form-group">
<label for="event-title">Título do Evento</label>
<input type="text" id="event-title" required>
</div>
<div class="form-group">
<label for="event-desc">Descrição</label>
<textarea id="event-desc" placeholder="Detalhes do evento..."></textarea>
</div>
<div class="form-group">
<label for="event-date">Data e Hora do Evento</label>
<input type="datetime-local" id="event-date" required>
</div>
<div class="form-group">
<label for="event-location">Localização</label>
<input type="text" id="event-location" placeholder="Rua, bairro ou ponto de referência">
</div>
<div class="form-group">
<label for="event-image">URL da Imagem (Opcional)</label>
<input type="url" id="event-image" placeholder="URL para a imagem de divulgação">
</div>
<button type="submit" class="btn"><i class="ph ph-paper-plane-tilt"></i> Enviar Sugestão</button>
</form>
</div>
<div id="my-created-events-list"></div>
`;
    document.getElementById('suggest-event-form').addEventListener('submit', handleSuggestEvent);
    fetchMyCreatedEventsForEditing(qs('#my-created-events-list'));
}
async function handleSuggestEvent(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]');
    const titulo = form.querySelector('#event-title').value.trim();
    const data_evento = form.querySelector('#event-date').value;
    if (!titulo || !data_evento) return alert('Título e Data são obrigatórios.');
    const eventData = {
        titulo,
        descricao: form.querySelector('#event-desc').value.trim(),
        data_evento,
        localizacao: form.querySelector('#event-location').value.trim(),
        imagem_url: form.querySelector('#event-image').value.trim() || null
    };
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    try {
        // Rota POST: /api/evento/eventos
        const result = await fetchJson('/evento/eventos', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
        alert(result.message || 'Evento sugerido com sucesso!');
        form.reset();
        fetchMyCreatedEventsForEditing(qs('#my-created-events-list'));
    } catch (err) {
        alert('Falha ao sugerir: ' + (err.message || 'Erro no servidor.'));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Enviar Sugestão';
    }
}
/* ================================================================
PONTO DE COLETA (ADD)
   ⭐ CORREÇÃO APLICADA: Unificando o formulário com o mapa.html ⭐
================================================================ */
export function renderAddPointForm(container) {
    container.innerHTML = `
<div class="info-card-dash">
<h2><i class="ph ph-map-pin"></i> Adicionar Ponto de Coleta</h2>
<p style="color: #9CA3AF; margin-bottom: 12px;">Preencha as informações do ponto de coleta. O endereço será geocodificado automaticamente.</p>
<form id="add-point-form-dashboard">
    
    <div class="form-group">
        <label for="point-name">Nome do Ponto</label>
        <input type="text" id="point-name" required placeholder="Ex: Ponto de Coleta Central">
    </div>

    <div class="form-group">
        <label for="full-address">Endereço Completo (Rua, Número, Bairro, Cidade)</label>
        <input type="text" id="full-address" required placeholder="Ex: Rua da Reciclagem, 100, Boa Viagem, Recife">
    </div>

    <div class="form-group">
        <label for="point-material">Material Aceito</label>
        <select id="point-material" required>
            <option value="Papel">Papel</option>
            <option value="Plástico">Plástico</option>
            <option value="Vidro">Vidro</option>
            <option value="Metal">Metal</option>
            <option value="Orgânico">Orgânico</option>
        </select>
    </div>
    
    <button type="submit" class="btn"><i class="ph ph-plus-circle"></i> Adicionar Ponto</button>
</form>
<div id="add-point-result" style="margin-top:12px;"></div>
</div>
`;
    
    const form = container.querySelector('#add-point-form-dashboard');
    const resultDiv = container.querySelector('#add-point-result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Enviando...';
        resultDiv.innerHTML = '';

        // Captura APENAS os campos do novo formulário (nome, full_address, tipo_material)
        const payload = {
            nome: form.querySelector('#point-name').value.trim(),
            full_address: form.querySelector('#full-address').value.trim(),
            tipo_material: form.querySelector('#point-material').value,
        };

        if (!payload.nome || !payload.full_address || !payload.tipo_material) {
            alert('Todos os campos (Nome, Endereço e Material) são obrigatórios.');
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-plus-circle"></i> Adicionar Ponto';
            return;
        }

        try {
            // Rota POST: /api/mapa/pontos-coleta (o backend fará a geocodificação)
            const resp = await fetchJson('/mapa/pontos-coleta', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            resultDiv.innerHTML =
                `<p style="color: #10B981;">${resp.message || 'Ponto adicionado com sucesso! (Aguarde a atualização do mapa)'}</p>`;
            form.reset();
            
        } catch (err) {
            console.error('Erro ao adicionar ponto:', err);
            resultDiv.innerHTML =
                `<p style="color: #DC2626;">Erro: ${escapeHtml(err.message || 'Falha no servidor.')}</p>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-plus-circle"></i> Adicionar Ponto';
        }
    });
}
/* ================================================================
LISTAR EVENTOS CRIADOS PELO USUÁRIO (Para o Dashboard)
================================================================ */
export async function fetchMyCreatedEventsForEditing(listElement) {
    if (!listElement) return;
    let container = qs('#created-events-container');
    if (!container) {
        // ... (criação do container)
        listElement.innerHTML = `
<div class="info-card-dash">
<h2>Meus Eventos Publicados</h2>
<div id="created-events-container">
<p style="color: #9CA3AF;">Carregando eventos criados...</p>
</div>
</div>
`;
        container = qs('#created-events-container');
    }
    try {
        // Rota esperada: /api/evento/eventos/meus
        const events = await fetchJson('/evento/eventos/meus');
        if (!container) return;
        if (events.length === 0) {
            container.innerHTML = '<p>Você ainda não criou nenhum evento.</p>';
            return;
        }
        const listHtml = events.map(event => `
<div class="data-item" style="display: flex; justify-content: space-between; align-items: center;">
<div>
<strong>${escapeHtml(event.titulo)}</strong>
<div style="font-size: 0.9em; color: #ccc;">
Data: ${new Date(event.data_evento).toLocaleString('pt-BR')}
</div>
<span style="font-size: 0.8em; color: ${
    event.status_aprovacao === 'aprovado' ? '#10B981' : '#FBBF24'
    };">
Status: ${event.status_aprovacao}
</span>
</div>
<div style="display: flex; gap: 8px;">
<button class="btn btn-sm edit-event-btn"
data-event-id="${event.id_evento}"
style="background-color: #3B82F6; padding: 5px 10px; font-size: 0.9em;">
Editar
</button>
<button class="btn btn-sm delete-event-btn"
data-event-id="${event.id_evento}"
style="background-color: #DC2626; padding: 5px 10px; font-size: 0.9em;">
Apagar
</button>
</div>
</div>
`).join('');
        container.innerHTML = listHtml;
        container.querySelectorAll('.edit-event-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                goToEditPage(e.currentTarget.dataset.eventId);
            });
        });
        container.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                handleDeleteClick(e.currentTarget.dataset.eventId);
            });
        });
    } catch (error) {
        console.error('Erro ao buscar eventos criados:', error.message);
        const targetContainer = qs('#created-events-container');
        if (targetContainer)
            targetContainer.innerHTML =
            `<p style="color: red;">Erro ao carregar eventos criados: ${error.message}</p>`;
    }
}