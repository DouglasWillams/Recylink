// backend/controllers/commentController.js

const db = require('../database');

// Compatibilidade para pg ou pool
function rows(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (result.rows) return result.rows;
  return [];
}

// LISTAR COMENTÁRIOS DE UM POST
exports.listByPost = async (req, res) => {
  try {
    const idPost = req.params.id;

    const result = await db.query(
      `SELECT c.*, u.nome AS autor_nome
       FROM comments c
       LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_post = $1
       ORDER BY c.data_publicacao ASC`,
      [idPost]
    );

    return res.json(rows(result));
  } catch (err) {
    console.error('❌ Erro ao listar comentários:', err.message);
    return res.status(500).json({ message: 'Erro ao listar comentários.' });
  }
};

// CRIAR COMENTÁRIO
exports.create = async (req, res) => {
  try {
    const userId = req.user?.id_usuario || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const idPost = req.params.id;
    const { conteudo } = req.body;

    if (!conteudo || !conteudo.trim()) {
      return res.status(400).json({ message: 'Conteúdo é obrigatório.' });
    }

    const result = await db.query(
      `INSERT INTO comments (id_post, id_usuario, conteudo, data_publicacao)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [idPost, userId, conteudo.trim()]
    );

    return res.status(201).json(rows(result)[0]);
  } catch (err) {
    console.error('❌ Erro ao criar comentário:', err.message);
    return res.status(500).json({ message: 'Erro ao criar comentário.' });
  }
};

// REMOVER COMENTÁRIO
exports.remove = async (req, res) => {
  try {
    const userId = req.user?.id_usuario || req.user?.id;
    const idComment = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const sel = await db.query(
      `SELECT id_usuario FROM comments WHERE id_comment = $1`,
      [idComment]
    );

    const row = rows(sel)[0];
    if (!row) {
      return res.status(404).json({ message: 'Comentário não encontrado.' });
    }

    if (String(row.id_usuario) !== String(userId)) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este comentário.' });
    }

    await db.query(`DELETE FROM comments WHERE id_comment = $1`, [idComment]);

    return res.json({ message: 'Comentário removido.' });
  } catch (err) {
    console.error('❌ Erro ao remover comentário:', err.message);
    return res.status(500).json({ message: 'Erro ao remover comentário.' });
  }
};
