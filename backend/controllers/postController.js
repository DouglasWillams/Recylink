// backend/controllers/postController.js
const db = require('../database');

exports.list = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT p.*, u.nome AS autor
       FROM post p
       JOIN usuario u ON p.id_usuario = u.id_usuario
       ORDER BY data_publicacao DESC`
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Erro ao listar posts:', err.message);
    return res.status(500).json({ message: 'Erro ao listar posts', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { id_usuario, conteudo, categoria } = req.body;
    if (!id_usuario || !conteudo) return res.status(400).json({ message: 'id_usuario e conteudo obrigatórios' });

    const rows = await db.query(
      'INSERT INTO post (id_usuario, conteudo, categoria, data_publicacao) VALUES ($1,$2,$3,NOW()) RETURNING *',
      [id_usuario, conteudo, categoria || 'geral']
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Erro ao criar post:', err.message);
    return res.status(500).json({ message: 'Erro ao criar post', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM post WHERE id_post = $1', [req.params.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Post não encontrado' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('❌ Erro ao buscar post:', err.message);
    return res.status(500).json({ message: 'Erro ao buscar post', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM post WHERE id_post = $1', [req.params.id]);
    return res.status(200).json({ message: 'Post removido' });
  } catch (err) {
    console.error('❌ Erro ao remover post:', err.message);
    return res.status(500).json({ message: 'Erro ao remover post', error: err.message });
  }
};
