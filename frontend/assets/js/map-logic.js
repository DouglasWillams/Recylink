/**
 * Lógica JavaScript para a página do Mapa de Pontos de Coleta (Leaflet).
 * Este script é responsável por:
 * 1. Inicializar o mapa Leaflet com foco em Recife e limites definidos.
 * 2. Simular (MOCK) a busca de pontos de coleta.
 * 3. Criar a lógica de filtragem por pesquisa (bairro/material).
 * 4. Renderizar os marcadores circulares no mapa e a lista lateral de pontos.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Simula o carregamento da página do mapa.
    if (document.getElementById('mapa-lixeiras')) {
        console.log('Página do Mapa de Lixeiras carregada! Inicializando Leaflet...');
        
        // Atrasar a inicialização do mapa para garantir que o DOM e o CSS tenham carregado
        // isso evita o erro: 'Cannot read properties of null (reading 'offsetWidth')'
        delayInitialization(initializeMap, 100);
    }
});

/**
 * Função utilitária para atrasar a execução de uma função.
 * @param {function} callback - A função a ser executada.
 * @param {number} delay - O atraso em milissegundos.
 */
function delayInitialization(callback, delay) {
    setTimeout(callback, delay);
}

// --- DADOS MOCKADOS (SIMULAÇÃO DO BACKEND) ---

// Mapeamento de Coordenadas Centrais de Bairros de Recife
const BAIRRO_COORDS = {
    "BOA VIAGEM": [-8.1384, -34.9081],
    "PINA": [-8.0838, -34.8812],
    "RECIFE ANTIGO": [-8.0610, -34.8711],
    "MADALENA": [-8.0494, -34.9125],
    "CASA FORTE": [-8.0305, -34.9090],
    "OLINDA": [-8.0089, -34.8519] 
};

// Lista de Pontos de Coleta Fictícios em Recife
const MOCK_PONTOS_COLETA = [
    {
        id: 1,
        nome: "Ecoponto Boa Viagem - Praça",
        tipo: "Papel",
        lat: -8.1385,
        lng: -34.9080,
        endereco: "Av. Boa Viagem, 3500",
        bairro: "Boa Viagem"
    },
    {
        id: 2,
        nome: "Centro de Reciclagem Pina",
        tipo: "Vidro",
        lat: -8.0845,
        lng: -34.8810,
        endereco: "Rua do Forte, 100",
        bairro: "Pina"
    },
    {
        id: 3,
        nome: "Associação Ecológica da Madalena",
        tipo: "Metal",
        lat: -8.0490,
        lng: -34.9120,
        endereco: "Av. Visconde de Albuquerque, 500",
        bairro: "Madalena"
    },
    {
        id: 4,
        nome: "Ponto de Coleta Casa Forte",
        tipo: "Plástico",
        lat: -8.0300,
        lng: -34.9095,
        endereco: "Rua São Miguel, 70",
        bairro: "Casa Forte"
    },
    {
        id: 5,
        nome: "Ecoponto Porto Digital",
        tipo: "Orgânico",
        lat: -8.0600,
        lng: -34.8700,
        endereco: "Av. Cais do Apolo, 501",
        bairro: "Recife Antigo"
    },
    {
        id: 6,
        nome: "Escola Sustentável Boa Viagem",
        tipo: "Papel",
        lat: -8.1250,
        lng: -34.9010,
        endereco: "Rua Barão de Souza Leão, 25",
        bairro: "Boa Viagem"
    },
];

// Mapeamento de cores e ícones para cada tipo de resíduo
const TIPOS_RESIDUO = {
    "Papel": { color: '#3B82F6', icon: 'ph-file-text', badgeClass: 'bg-blue-500' },     // Azul
    "Plástico": { color: '#DC2626', icon: 'ph-trash-simple', badgeClass: 'bg-red-500' }, // Vermelho
    "Vidro": { color: '#10B981', icon: 'ph-wine', badgeClass: 'bg-green-500' },        // Verde
    "Metal": { color: '#FBBF24', icon: 'ph-package', badgeClass: 'bg-yellow-500' },    // Amarelo
    "Orgânico": { color: '#8B5CF6', icon: 'ph-leaf', badgeClass: 'bg-purple-500' }     // Roxo
};


/**
 * Simula a chamada à API do backend para obter os pontos de coleta.
 * @returns {Promise<Array>} Lista de pontos de coleta.
 */
async function fetchPoints() {
    // Retorna os dados mockados instantaneamente para simulação
    return Promise.resolve(MOCK_PONTOS_COLETA);
}

// Variáveis globais para o mapa
let map;
let allMarkers = [];
let pontoColetaContainer;
let searchInput;


/**
 * Inicializa o mapa Leaflet.
 */
async function initializeMap() {
    pontoColetaContainer = document.getElementById('location-list-container');
    searchInput = document.getElementById('search-input');
    
    // Coordenadas centrais de Recife
    const recifeCoords = [-8.0578, -34.8829]; 
    const initialZoom = 13;

    try {
        // 1. Configurar o mapa
        map = L.map('mapa-lixeiras', {
            center: recifeCoords,
            zoom: initialZoom,
            minZoom: 12 
        });

        // 2. Definir o limite geográfico (Bounds de Recife/RMR)
        const southWest = L.latLng(-8.18, -35.05); // Sul/Oeste
        const northEast = L.latLng(-7.95, -34.80); // Norte/Leste
        const bounds = L.latLngBounds(southWest, northEast);
        map.setMaxBounds(bounds); 
        
        // 3. Adicionar Camada de Tiles (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 12
        }).addTo(map);

        // 4. Buscar e processar os pontos de coleta
        const pontos = await fetchPoints();
        renderPoints(pontos);

        // 5. Adicionar listener para o campo de busca
        if (searchInput) {
             searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    filterMapBySearch();
                }
             });
        }
        
    } catch (error) {
        console.error('Erro ao carregar pontos de coleta:', error);
        if (pontoColetaContainer) {
            pontoColetaContainer.innerHTML = `<p class="error-message">Não foi possível carregar os pontos de coleta: ${error.message}</p>`;
        }
    }
}


/**
 * Renderiza os pontos no mapa e na lista lateral.
 * @param {Array} pontos - Lista de pontos de coleta.
 */
function renderPoints(pontos) {
    if (!map) return;
    
    // Limpar marcadores e lista anterior
    allMarkers.forEach(marker => map.removeLayer(marker));
    allMarkers = [];
    if (pontoColetaContainer) {
        pontoColetaContainer.innerHTML = '';
    }

    pontos.forEach(ponto => {
        const typeInfo = TIPOS_RESIDUO[ponto.tipo] || { color: '#AAAAAA', icon: 'ph-x' };
        
        // 1. Criar HTML do ícone personalizado (Círculo colorido com ícone Phosphor dentro)
        const iconHtml = `<div class="marker-pin" style="background-color: ${typeInfo.color};">
                             <i class="ph ${typeInfo.icon} marker-icon"></i>
                          </div>`;

        // 2. Criar ícone Leaflet (usando o novo HTML e definindo o anchor para o centro)
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [38, 38], // Tamanho do círculo
            iconAnchor: [19, 19] // Centro do círculo (metade do tamanho)
        });

        // 3. Criar marcador
        const marker = L.marker([ponto.lat, ponto.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${ponto.nome}</b><br>${ponto.endereco}<br><span class="badge" style="background-color:${typeInfo.color}; color:white;">${ponto.tipo}</span>`);
            
        allMarkers.push(marker);

        // 4. Renderizar na lista lateral
        const listItem = document.createElement('div');
        listItem.className = 'location-item';
        listItem.innerHTML = `
            <div class="location-content">
                <div class="color-box" style="background-color: ${typeInfo.color};"></div>
                <div>
                    <div class="location-name">${ponto.nome}</div>
                    <div class="location-address">${ponto.endereco}</div>
                    <span class="badge" style="background-color: ${typeInfo.color}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75em;">${ponto.tipo}</span>
                </div>
            </div>
        `;

        // Adiciona evento de clique para centralizar o mapa no ponto
        listItem.addEventListener('click', () => {
            map.setView([ponto.lat, ponto.lng], 16); // Centraliza e dá zoom
            marker.openPopup();
        });
        
        if (pontoColetaContainer) {
            pontoColetaContainer.appendChild(listItem);
        }
    });

    // Se não houver pontos, exibe uma mensagem
    if (pontos.length === 0 && pontoColetaContainer) {
        pontoColetaContainer.innerHTML = `<p class="text-muted">Nenhum ponto encontrado para o filtro atual.</p>`;
    }
}


/**
 * Filtra os pontos no mapa e na lista com base na pesquisa.
 */
function filterMapBySearch() {
    const query = searchInput.value.trim().toUpperCase();
    
    if (query === "") {
        renderPoints(MOCK_PONTOS_COLETA);
        map.setView(BAIRRO_COORDS["RECIFE ANTIGO"], 13); // Volta ao centro de Recife
        return;
    }

    // 1. Filtrar pontos por nome, endereço ou bairro
    const filteredPoints = MOCK_PONTOS_COLETA.filter(ponto =>
        ponto.nome.toUpperCase().includes(query) ||
        ponto.endereco.toUpperCase().includes(query) ||
        ponto.bairro.toUpperCase().includes(query) ||
        ponto.tipo.toUpperCase().includes(query)
    );
    
    renderPoints(filteredPoints);

    // 2. Centralizar o mapa se a pesquisa for um BAIRRO
    const foundBairro = Object.keys(BAIRRO_COORDS).find(b => b.includes(query));

    if (foundBairro) {
        const coords = BAIRRO_COORDS[foundBairro];
        map.setView(coords, 14); // Centraliza e dá zoom no bairro
    } else if (filteredPoints.length > 0) {
        // Se houver resultados, centraliza no primeiro ponto encontrado
        map.setView([filteredPoints[0].lat, filteredPoints[0].lng], 14);
    }
}