// backend/controllers/eventoController.js
const db = require('../database');

exports.list = async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM evento ORDER BY data_evento DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Erro ao listar eventos:', err.message);
    res.status(500).json({ message: 'Erro ao listar eventos', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { titulo, descricao, localizacao, data_evento, imagem_url, sugerido_por_id } = req.body;
    if (!titulo || !data_evento) {
      return res.status(400).json({ message: 'titulo e data_evento são obrigatórios' });
    }
    const sql = `INSERT INTO evento (titulo, descricao, localizacao, data_evento, imagem_url, sugerido_por_id, data_cadastro)
                 VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`;
    const rows = await db.query(sql, [titulo, descricao || null, localizacao || null, data_evento, imagem_url || null, sugerido_por_id || null]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Erro ao criar evento:', err.message);
    res.status(500).json({ message: 'Erro ao criar evento', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await db.query('SELECT * FROM evento WHERE id_evento = $1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Evento não encontrado' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('❌ Erro ao buscar evento:', err.message);
    res.status(500).json({ message: 'Erro ao buscar evento', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { titulo, descricao, localizacao, data_evento, imagem_url, status_aprovacao } = req.body;
    const sql = `UPDATE evento
                 SET titulo = $1, descricao = $2, localizacao = $3, data_evento = $4, imagem_url = $5, status_aprovacao = $6
                 WHERE id_evento = $7
                 RETURNING *`;
    const rows = await db.query(sql, [
      titulo || null,
      descricao || null,
      localizacao || null,
      data_evento || null,
      imagem_url || null,
      status_aprovacao || 'pendente',
      id
    ]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Evento não encontrado' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('❌ Erro ao atualizar evento:', err.message);
    res.status(500).json({ message: 'Erro ao atualizar evento', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM evento WHERE id_evento = $1', [id]);
    return res.status(200).json({ message: 'Evento removido' });
  } catch (err) {
    console.error('❌ Erro ao remover evento:', err.message);
    res.status(500).json({ message: 'Erro ao remover evento', error: err.message });
  }
};
