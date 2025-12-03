// inscricao-logic.js: Função fetchEventDetails (Com HTML em linha única)

/**
 * Busca detalhes do evento, preenche a UI e checa o
status de inscrição.
 */
async function fetchEventDetails(eventId, container, form) {

    try {
        // 1. Carrega os detalhes do evento: /api/evento/eventos/:id
        const event = await fetchJson(`evento/eventos/${eventId}`);

        // 2. Renderiza os detalhes do evento (Em linha)
        // ✅ ATENÇÃO: Crases (`) e aspas (") verificadas e aninhadas corretamente
        container.innerHTML = `
<div class="event-details">
<img src="${event.imagem_url || DEFAULT_IMAGE}" alt="Imagem do Evento" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}';" />
<div>
<h2 style="color: var(--color-primary-green); margin-bottom: 10px;">${escapeHtml(event.titulo)}</h2>
<p style="margin-bottom: 15px;">${escapeHtml(event.descricao)}</p>
<div class="detail-item">
<i class="ph ph-calendar-blank" style="color: var(--color-primary-green);"></i>
<span>${new Date(event.data_evento).toLocaleString('pt-BR')}</span>
</div>
<div class="detail-item">
<i class="ph ph-map-pin" style="color: var(--color-primary-green);"></i>
<span>${escapeHtml(event.localizacao || 'Local Desconhecido')}</span>
</div>
</div>
</div>
`;
        
        // 3. CRÍTICO: Checa se já está inscrito
        const isAlreadyRegistered = await checkRegistrationStatus(eventId);

        // 4. Anexa o listener de submissão APENAS se não estiver inscrito
        if (!isAlreadyRegistered) {
            form.addEventListener('submit', (e) => handleInscricaoSubmit(e,
                eventId, event.titulo));
        }
    } catch (err) {
        console.error('Erro ao carregar evento:', err);
        // ✅ A linha de erro do TSLint/TS(1109) geralmente estava aqui. Corrigido com template literal simples.
        container.innerHTML = `<h2>Erro ao carregar evento.</h2><p style="color: #DC2626;">${err.message}</p>`;
    }
}