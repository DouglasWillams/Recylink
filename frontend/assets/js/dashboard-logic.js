// frontend/assets/js/dashboard-logic.js
import {
    fetchJson,
    escapeHtml
} from './dashboard.js'; // Importa fetch e escape do dashboard.js

/**
 * Renderiza o conteúdo da HOME (3Rs).
 * Não é mais necessário, pois o HTML base já contém o dashboard-home-content
 * (Mas mantido aqui para referência)
 */
export function renderHomeContent(container) {
    // O conteúdo da Home já está no HTML base.
    // Esta função é apenas um placeholder para futuras adições.
}

// =================================================================
// 1. EDITAR PERFIL (profileController.updateProfile)
// =================================================================

/**
 * Renderiza o formulário de edição de perfil e anexa o listener.
 */
export function renderProfileContent(container, userProfile) {
    const defaultImg = '../assets/images/user-placeholder.jpg';
    
    // Usa os dados armazenados no DOM após o loadUserProfile
    const userName = document.body.dataset.userName || userProfile.nome;
    const userEmail = document.body.dataset.userEmail || userProfile.email;
    const userPhone = document.body.dataset.userPhone || userProfile.telefone || '';

    container.innerHTML = `
        <div class="profile-details-card">
            <h2><i class="ph ph-user-circle" style="margin-right: 10px;"></i> Editar Perfil</h2>
            <form id="edit-profile-form">
                <div class="form-group">
                    <label for="profile-name">Nome</label>
                    <input type="text" id="profile-name" value="${escapeHtml(userName)}" required>
                </div>
                <div class="form-group">
                    <label for="profile-email">E-mail (Não Editável)</label>
                    <input type="email" id="profile-email" value="${escapeHtml(userEmail)}" disabled style="cursor: not-allowed; opacity: 0.7;">
                </div>
                <div class="form-group">
                    <label for="profile-phone">Telefone</label>
                    <input type="tel" id="profile-phone" value="${escapeHtml(userPhone)}">
                </div>
                <button type="submit" class="btn"><i class="ph ph-floppy-disk"></i> Salvar Alterações</button>
            </form>
        </div>
    `;

    document.getElementById('edit-profile-form').addEventListener('submit', handleProfileUpdate);
}

/**
 * Lida com a submissão do formulário de edição de perfil.
 */
async function handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]');

    const nome = form.querySelector('#profile-name').value.trim();
    const telefone = form.querySelector('#profile-phone').value.trim();

    if (!nome) {
        alert('O nome é obrigatório.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        // PUT para /api/me (profileController.updateProfile)
        const result = await fetchJson('/me', {
            method: 'PUT',
            body: JSON.stringify({ nome, telefone })
        });

        alert(result.message || 'Perfil atualizado com sucesso!');
        // Atualiza elementos da interface após o sucesso
        document.body.dataset.userName = result.user.nome;
        document.body.dataset.userPhone = result.user.telefone || '';
        document.body.dataset.userEmail = result.user.email;
        
        document.querySelector('#sidebar-user-name').textContent = result.user.nome;
        document.querySelector('#user-name').textContent = result.user.nome;
        
    } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
        alert('Falha ao atualizar: ' + (err.message.includes('401') ? 'Sessão expirada.' : 'Erro no servidor.'));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar Alterações';
    }
}

// =================================================================
// 2. MINHAS INSCRIÇÕES (eventoController.myRegistrations)
// =================================================================

/**
 * Renderiza a lista de eventos nos quais o usuário está inscrito.
 */
export async function renderMyRegistrations(container) {
    container.innerHTML = `
        <div class="profile-details-card">
            <h2><i class="ph ph-calendar-check" style="margin-right: 10px;"></i> Minhas Inscrições</h2>
            <div id="registrations-list">
                <p style="color: #9CA3AF;">Carregando suas inscrições...</p>
            </div>
        </div>
    `;
    const listContainer = document.getElementById('registrations-list');

    try {
        // GET para /api/minhas-inscricoes (eventoController.myRegistrations)
        const registrations = await fetchJson('/minhas-inscricoes');
        
        if (!registrations || registrations.length === 0) {
            listContainer.innerHTML = '<p style="color: #9CA3AF;">Você não está inscrito em nenhum evento ainda.</p>';
            return;
        }

        const listHtml = registrations.map(reg => `
            <div style="background-color: #2C3E50; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 5px solid var(--color-primary-green);">
                <div style="font-weight: bold; font-size: 1.1em;">${escapeHtml(reg.titulo)}</div>
                <div style="font-size: 0.9em; color: #ccc;">Data do Evento: ${new Date(reg.data_evento).toLocaleDateString('pt-BR')}</div>
                <div style="font-size: 0.8em; color: #9CA3AF;">Inscrição em: ${new Date(reg.data_inscricao).toLocaleString('pt-BR')}</div>
                <a href="/pages/eventos.html" style="color: #FBBF24; font-size: 0.9em; margin-top: 5px; display: block;">Ver Evento</a>
            </div>
        `).join('');

        listContainer.innerHTML = listHtml;

    } catch (err) {
        console.error('Erro ao carregar inscrições:', err);
        listContainer.innerHTML = `<p style="color: #DC2626;">Erro ao carregar inscrições: ${escapeHtml(err.message)}</p>`;
    }
}

// =================================================================
// 3. SUGERIR EVENTO (eventoController.create)
// =================================================================

/**
 * Renderiza o formulário de sugestão de evento e anexa o listener.
 */
export function renderSuggestEvent(container) {
    container.innerHTML = `
        <div class="profile-details-card">
            <h2><i class="ph ph-calendar-plus" style="margin-right: 10px;"></i> Sugerir Novo Evento</h2>
            <p style="color: #9CA3AF; margin-bottom: 20px;">Sua sugestão será enviada para moderação antes de ser publicada.</p>
            <form id="suggest-event-form">
                <div class="form-group">
                    <label for="event-title">Título do Evento</label>
                    <input type="text" id="event-title" required>
                </div>
                <div class="form-group">
                    <label for="event-desc">Descrição</label>
                    <textarea id="event-desc" placeholder="Detalhes do evento, objetivo, o que levar..."></textarea>
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
    `;

    document.getElementById('suggest-event-form').addEventListener('submit', handleSuggestEvent);
}

/**
 * Lida com a submissão do formulário de sugestão de evento.
 */
async function handleSuggestEvent(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]');

    const titulo = form.querySelector('#event-title').value.trim();
    const data_evento = form.querySelector('#event-date').value;

    if (!titulo || !data_evento) {
        alert('Título e Data são obrigatórios.');
        return;
    }

    const eventData = {
        titulo: titulo,
        descricao: form.querySelector('#event-desc').value.trim(),
        data_evento: data_evento,
        localizacao: form.querySelector('#event-location').value.trim(),
        imagem_url: form.querySelector('#event-image').value.trim() || null
    };

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        // POST para /api/eventos (eventoController.create)
        const result = await fetchJson('/eventos', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });

        alert(result.message || 'Evento sugerido com sucesso! Aguarde a moderação.');
        form.reset();

    } catch (err) {
        console.error('Erro ao sugerir evento:', err);
        alert('Falha ao sugerir: ' + (err.message || 'Erro de servidor.'));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Enviar Sugestão';
    }
}