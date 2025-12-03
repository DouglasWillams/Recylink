// events-logic.js: Função renderEvents (Com HTML em linha única para compatibilidade)

/** * Renderiza a lista de eventos no container.
 */
function renderEvents(container, events) {

    events.forEach(event => {

        const card = document.createElement('div');
        card.className = 'event-card';
        const imageUrl = event.imagem_url;

        // 1. Lógica Condicional para o Visual do Card (Em linha)
        const eventVisual = imageUrl ?
            `<img src="${imageUrl}" alt="Imagem do evento ${event.titulo}" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}';" />` :
            `<div class="no-image"><i class="ph ph-calendar-blank"></i><p>${escapeHtml(event.titulo)}</p></div>`;
        
        const imageContainerClass = imageUrl ? '' : 'no-image'; 

        // 2. Cria o HTML do Card (Em linha)
        card.innerHTML = `
<div class="event-image-container ${imageContainerClass}">
${eventVisual}
</div>
<div class="event-content">
<div class="event-badges">
<span class="badge">${event.category || 'Voluntariado'}</span>
<div class="participants">
<i class="ph ph-users meta-icon" style="color: #9CA3AF;"></i>
<span>${event.participants || 0}</span>
</div>
</div>
<h3 class="event-title">${escapeHtml(event.titulo)}</h3>
<p class="event-description">${escapeHtml(event.descricao)}</p>
<div class="event-meta">
<div class="meta-item">
<i class="ph ph-calendar-blank meta-icon"></i>
<span>${new Date(event.data_evento).toLocaleDateString('pt-BR')}</span>
</div>
<div class="meta-item">
<i class="ph ph-map-pin meta-icon"></i>
<span>${escapeHtml(event.localizacao || 'Local Desconhecido')}</span>
</div>
</div>
<button class="btn-participate" data-event-id="${event.id_evento}">Participar</button>
</div>
`;

        container.appendChild(card);
    });

    // 3. Anexa Listeners de Participação
    document.querySelectorAll('.btn-participate').forEach(button => {
        button.addEventListener('click',
            (e) => {
                const eventId = e.currentTarget.getAttribute('data-event-id');
                handleParticipation(eventId);
            });
    });
}