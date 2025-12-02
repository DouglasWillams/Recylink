// frontend/assets/js/map-logic.js
import { isLoggedIn, getToken } from './auth.js';
const API_BASE_URL = '/api'; // Base da API (Express): Usando caminho relativo /api
let map; // Instância global do mapa Leaflet
let allPoints = []; // Armazena todos os pontos de coleta buscados do backend
let markers = {}; // Objeto para armazenar os marcadores de Leaflet (para fácil gerenciamento)
// --- Funções de Ajuda ---
// Mapeia o tipo de material para uma cor (deve coincidir com o map.css)
function getMarkerProperties(material) {
    const materialLower = material.toLowerCase();
    if (materialLower.includes('papel')) return { color: '#3B82F6' };
    if (materialLower.includes('plástico') || materialLower.includes('plastico')) return { color: '#DC2626' };
    if (materialLower.includes('vidro')) return { color: '#10B981' };
    if (materialLower.includes('metal')) return { color: '#FBBF24' };
    if (materialLower.includes('orgânico') || materialLower.includes('organico')) return { color: '#8B5CF6' };
    return { color: '#AAAAAA' }; // Padrão
}
// Wrapper de fetch para API (inclui autenticação e trata o 204 No Content)
async function fetchJson(path, opts = {}) {
    const token = getToken();
    const headers = opts.headers || {};
    // Adiciona token APENAS se precisar (para POST/DELETE)
    if (token && (opts.method === 'POST' || opts.method === 'DELETE')) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (opts.method !== 'GET' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    
    const url = path.startsWith(API_BASE_URL) ? path : `${API_BASE_URL}${path}`;
    const res = await fetch(url, { ...opts, headers });
    if (res.status === 204) { return {}; } // Tratamento para sucesso de DELETE
    let jsonResult;
    try {
        jsonResult = await res.json();
    } catch (err) {
        jsonResult = { message: res.statusText || 'Erro desconhecido' };
    }
    if (!res.ok) {
        throw new Error(jsonResult.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return jsonResult;
}
// Escapa HTML para segurança
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}
// --- Funções de Renderização ---
/**
 * 1. Inicializa o mapa (usando Leaflet)
 */
function initializeMap() {
    if (map) {
        map.remove(); // Remove o mapa antigo se já existir
    }
    const initialLat = -8.05389;
    const initialLng = -34.88111;
    // Inicializa o mapa no container com ID 'mapa-lixeiras'
    map = L.map('mapa-lixeiras').setView([initialLat, initialLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    console.log('Mapa inicializado.');
}
/**
 * 2. Adiciona marcadores ao mapa e preenche a lista lateral
 */
function renderPoints(pointsToRender) {
    const listContainer = document.getElementById('location-list-container');
    listContainer.innerHTML = '';
    // CRÍTICO: Limpa todos os marcadores existentes do mapa
    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {}; // Reatribuição permitida pois markers é 'let'
    if (pointsToRender.length === 0) {
        listContainer.innerHTML = '<p class="text-info" style="color: #9CA3AF;">Nenhum ponto de coleta encontrado.</p>';
        return;
    }
    const isAuthenticated = isLoggedIn();
    pointsToRender.forEach(point => {
        const { color } = getMarkerProperties(point.tipo_material);
        // --- Renderização do Marcador (Ícone Leaflet) ---
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin" style="background-color: ${color};"><i class="ph ph-trash marker-icon"></i></div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19]
        });
        const marker = L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(map)
            .bindPopup(`
            <b>${point.nome}</b><br>
            Endereço: ${point.endereco || 'Não informado'} (${point.cidade})<br>
            Materiais: <span style="font-weight: bold; color: ${color};">${point.tipo_material}</span>
            `);
        markers[point.id_ponto] = marker;
        // --- Renderização da Lista Lateral ---
        const listItem = document.createElement('div');
        listItem.className = 'location-item';
        listItem.dataset.id = point.id_ponto;
        let deleteButton = '';
        // Mostra botão de delete APENAS se o usuário estiver logado
        if (isAuthenticated) {
            deleteButton = `<button class="action-btn btn-reject btn-delete-point" data-id="${point.id_ponto}" style="background-color: #DC2626; padding: 3px 8px; float: right;">Apagar</button>`;
        }
        listItem.innerHTML = `
        <div class="location-content">
            <div class="location-name">${point.nome} ${deleteButton}</div>
            <div class="location-address">${point.endereco || 'Endereço não informado'}</div>
            <span class="badge" style="background-color: ${color}; color: white;">${point.tipo_material}</span>
        </div>
        `;
        listContainer.appendChild(listItem);
    });
    // Centraliza o mapa se houver pontos
    if (pointsToRender.length > 0) {
        const group = new L.featureGroup(Object.values(markers));
        map.fitBounds(group.getBounds().pad(0.1), { padding: [50, 50], maxZoom: 15 });
        // Anexa listener de deleção
        document.querySelectorAll('.btn-delete-point').forEach(btn => {
            btn.addEventListener('click', (e) => handleDeletePoint(e.currentTarget.dataset.id));
        });
    }
}
// --- Funções de Dados e Eventos ---
/**
 * 3. Busca os pontos de coleta no Backend (GET /api/mapa/pontos-coleta)
 */
async function fetchPoints() {
    const listContainer = document.getElementById('location-list-container');
    listContainer.innerHTML = '<p class="text-muted" style="color: #9CA3AF;">Carregando pontos de coleta...</p>';
    try {
        // GET para /api/mapa/pontos-coleta
        const response = await fetchJson('/mapa/pontos-coleta');
        const data = response;
        allPoints = data; // Armazena todos os pontos
        renderPoints(allPoints);
    } catch (error) {
        console.error('  ❌     Erro ao buscar pontos de coleta:', error);
        listContainer.innerHTML = `<p class="text-danger" style="color: #DC2626;">Falha ao carregar pontos: ${error.message}</p>`;
    }
}
/**
 * 4. Lógica de pesquisa (Filtro local)
 */
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = (searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : '');
    if (searchTerm.length === 0) {
        renderPoints(allPoints);
        return;
    }
    const filteredPoints = allPoints.filter(point => {
        const searchableText = [
            (point.nome || '').toLowerCase(),
            (point.endereco || '').toLowerCase(),
            (point.cidade || '').toLowerCase(),
            (point.tipo_material || '').toLowerCase()
        ].join(' ');
        return searchableText.includes(searchTerm);
    });
    renderPoints(filteredPoints);
}
// Handler de Criação de Ponto
async function handleCreateSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button[type="submit"]');
    // CRÍTICO: Capturar APENAS os novos campos (nome, endereço completo e material)
    const newPointData = {
        nome: form.querySelector('#point-name').value.trim(),
        full_address: form.querySelector('#full-address').value.trim(), // NOVO ID do HTML
        tipo_material: form.querySelector('#point-material').value,
    };
    // Verificação simplificada
    if (!newPointData.nome || !newPointData.full_address) {
        alert('Nome e Endereço completo são obrigatórios.');
        return;
    }
    btn.disabled = true;
    btn.textContent = 'Salvando...';
    try {
        // POST para /api/mapa/pontos-coleta (O backend fará a geocodificação)
        const result = await fetchJson('/mapa/pontos-coleta', {
            method: 'POST',
            body: JSON.stringify(newPointData)
        });
        alert(result.message || 'Ponto de coleta adicionado com sucesso!');
        // Recarrega o mapa e a lista para exibir o novo ponto
        await initializeMap();
        await fetchPoints();
        // Esconde o formulário
        form.reset();
        document.getElementById('add-point-form-container').style.display = 'none';
        document.getElementById('add-point-btn').style.display = 'block';
    } catch (error) {
        console.error('  ❌     Erro ao salvar ponto:', error);
        alert('Falha ao adicionar ponto: ' + (error.message || 'Verifique sua autenticação.'));
    } finally {
        btn.disabled = false;
        btn.textContent = 'Salvar Ponto';
    }
}
// Handler de Exclusão de Ponto
async function handleDeletePoint(pontoId) {
    if (!confirm('Confirmar exclusão deste ponto de coleta? Esta ação é irreversível.')) {
        return;
    }
    try {
        // DELETE para /api/mapa/pontos-coleta/:id
        await fetchJson(`/mapa/pontos-coleta/${pontoId}`, {
            method: 'DELETE',
        });
        alert('Ponto excluído com sucesso!');
        // Recarrega o mapa e a lista
        await fetchPoints();
    } catch (error) {
        console.error('  ❌     Erro ao excluir ponto:', error);
        alert('Falha ao excluir ponto: ' + (error.message || 'Você só pode deletar pontos que você criou.'));
    }
}
// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o mapa
    initializeMap();
    // 2. Busca e renderiza os pontos de coleta
    fetchPoints();
    // 3. Anexar o listener de pesquisa ao input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Usar 'input' para reagir a alterações a cada digitação/colar — mais responsivo que keyup
        searchInput.addEventListener('input', handleSearch);
    }
    // 4. Lógica do botão de Adicionar Ponto e CRUD
    const addPointBtn = document.getElementById('add-point-btn');
    const addPointContainer = document.getElementById('add-point-form-container');
    const addPointForm = document.getElementById('add-point-form');
    const cancelBtn = document.getElementById('cancel-add-point');
    // Exibir o botão Add Point APENAS se o usuário estiver logado
    if (isLoggedIn() && addPointBtn) {
        addPointBtn.style.display = 'block';
    }
    // Mostra/Oculta formulário ao clicar no botão
    if (addPointBtn && addPointContainer) {
        addPointBtn.addEventListener('click', () => {
            addPointContainer.style.display = 'block';
            addPointBtn.style.display = 'none';
        });
        cancelBtn.addEventListener('click', () => {
            addPointContainer.style.display = 'none';
            addPointBtn.style.display = 'block';
            if (addPointForm) addPointForm.reset();
        });
    }
    // Listener de Submissão do Formulário de Criação
    if (addPointForm) {
        addPointForm.addEventListener('submit', handleCreateSubmit);
    }
});