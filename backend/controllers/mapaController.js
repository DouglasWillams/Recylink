// backend/controllers/mapaController.js 
const db = require('../database');
const NodeGeocoder = require('node-geocoder');
 
// Configuração do Geocoder
// CRÍTICO: Adicionando User-Agent para cumprir a política de uso do OSM e evitar o bloqueio (Access Blocked)
const geocoder = NodeGeocoder({
    provider: 'openstreetmap',
    httpAdapter: 'https', 
    formatter: null, 
    // Nome da sua aplicação para identificar o IP no Nominatim
    userAgent: 'RecyLink-App-V1.0' 
});

// Helper para escapar HTML (necessário para o popup e mensagens de erro)
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
 
// Obtém todos os pontos de coleta (Público)
exports.getAll = async (req, res) => { 
 
  try { 
 
      const rows = await db.query('SELECT * FROM ponto_coleta WHERE status = \'ativo\' ORDER BY id_ponto ASC'); 
 
      return res.status(200).json(rows);
 
  } catch (err) { 
        console.error('❌ ERRO (GET /pontos-coleta):', err.message); 
        return res.status(500).json({ 
            message: 'Erro ao buscar pontos de coleta', 
            error: err.message
        }); 
    } 
};
 
// Criar Ponto de Coleta (Com Geocodificação)
exports.createPoint = async (req, res) => {
 
  const userId = req.user.userId; 
    const { nome, full_address, tipo_material } = req.body;
    
    if (!userId || !nome || !full_address || !tipo_material) {
 
      return res.status(400).json({ message: 'Dados obrigatórios ausentes.' });
    }
 
    try {
        // 1. GEOCODIFICAÇÃO (Agora não deve ser bloqueada)
        const geoResult = await geocoder.geocode(full_address);
 
        if (!geoResult || geoResult.length === 0) {
            return res.status(400).json({
message: 'Não foi possível encontrar as coordenadas para o endereço fornecido.'
});
        }
        
        const { latitude, longitude, city, streetName, streetNumber } = geoResult[0];
 
        // 2. Prepara os dados para o DB
        const enderecoCompleto = `${streetName || ''} ${streetNumber || ''}`.trim();
        const cidadeFinal = city || 'Não Identificada';
 
        const result = await db.query(
          `INSERT INTO ponto_coleta (nome, endereco, cidade, latitude, longitude, tipo_material, status, sugerido_por_id)
             VALUES ($1, $2, $3, $4, $5, $6, 'ativo', $7) RETURNING *`,
            [nome, enderecoCompleto, cidadeFinal, latitude, longitude, tipo_material, userId]
        );
 
        return res.status(201).json({ 
            message: 'Ponto de coleta adicionado com sucesso!',
            ponto: result[0]
        });
 
    } catch (err) {
        console.error('❌ ERRO AO CRIAR PONTO/GEOC:', err);
        return res.status(500).json({ message: `Erro ao adicionar ponto de coleta. Detalhe: ${err.message}` });
    }
};
 
// Excluir Ponto de Coleta
exports.deletePoint = async (req, res) => {
 
  const userId = req.user.userId;
    const pontoId = req.params.id;
 
  if (!userId) {
        return res.status(401).json({ message: 'Autenticação necessária.' });
  }
 
  try {
 
      const result = await db.query(
          "DELETE FROM ponto_coleta WHERE id_ponto = $1 AND sugerido_por_id = $2 RETURNING id_ponto",
          [pontoId, userId]
      );
 
      if (result.length === 0) {
          return res.status(403).json({ message: 'Acesso negado: Ponto não encontrado ou não pertence a você.' });
      }
 
      return res.status(204).send(); 
 
    } catch (err) {
        console.error('❌ ERRO AO DELETAR PONTO:', err);
        return res.status(500).json({ message: 'Erro ao excluir ponto de coleta.' });
    }
};