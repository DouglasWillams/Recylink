// frontend/assets/js/events.js
// Assumindo elementos: #eventsList, form #suggestEventForm (titulo,descricao,local,data_evento,imagem), buttons para inscrever com data-evento-id

document.addEventListener('DOMContentLoaded', () => {
  const eventsList = document.querySelector('#eventsList');
  const suggestForm = document.querySelector('#suggestEventForm');

  async function loadEvents() {
    try {
      const data = await fetch('/api/eventos').then(r => r.json());
      const eventos = data.eventos || data;
      if (!eventsList) return;
      eventsList.innerHTML = eventos.map(ev => `
        <div class="evento" data-id="${ev.id_evento || ev.id}">
          <h4>${escape(ev.titulo)}</h4>
          <p>${escape(ev.descricao || '')}</p>
          <p>Local: ${escape(ev.local || '')} — Data: ${escape(ev.data_evento || '')}</p>
          ${ev.imagem ? `<img src="${ev.imagem}" style="max-width:200px"/>` : ''}
          <button class="btn-inscrever" data-id="${ev.id_evento || ev.id}">Inscrever</button>
        </div>
      `).join('');
      bindInscreverButtons();
    } catch (err) {
      console.error('Erro ao carregar eventos', err);
    }
  }

  function bindInscreverButtons() {
    document.querySelectorAll('.btn-inscrever').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        try {
          const token = Auth.getToken();
          if (!token) { alert('Faça login para se inscrever'); return; }
          const res = await fetch(`/api/eventos/${id}/inscrever`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (!res.ok) throw data;
          alert('Inscrito com sucesso!');
        } catch (err) {
          console.error('Erro inscrever', err);
          alert((err && err.message) || 'Erro ao inscrever');
        }
      });
    });
  }

  if (suggestForm) {
    suggestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(suggestForm);
      try {
        const token = Auth.getToken();
        if (!token) { alert('Faça login para sugerir evento'); return; }
        const res = await fetch('/api/eventos/sugerir', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        });
        const data = await res.json();
        if (!res.ok) throw data;
        alert('Sugestão enviada!');
        suggestForm.reset();
        await loadEvents();
      } catch (err) {
        console.error('Erro sugestão', err);
        alert((err && err.message) || 'Erro ao sugerir evento');
      }
    });
  }

  loadEvents();

  function escape(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
});
