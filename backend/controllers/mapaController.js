// backend/controllers/mapaController.js
const db = require('../database');

exports.getAll = async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM ponto_coleta ORDER BY id_ponto ASC');
    return res.status(200).json(rows);
  } catch (err) {
    console.error('❌ ERRO (GET /pontos-coleta):', err.message);
    return res.status(500).json({
      message: 'Erro ao buscar pontos de coleta',
      error: err.message
    });
  }
};
