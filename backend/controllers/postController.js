// backend/controllers/postController.js
const db = require('../database');

// Normaliza rows para funcionar com pg ou wrappers
function rows(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (result.rows) return result.rows;
  return [];
}

// -----------------------------------------------------
// LISTAR POSTS (com autor_nome e likes_count)
// -----------------------------------------------------
exports.list = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.nome AS autor_nome, COALESCE(l.cnt, 0) AS likes_count
       FROM posts p
       LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
       LEFT JOIN (
         SELECT id_post, COUNT(*) AS cnt
         FROM post_likes
         GROUP BY id_post
       ) l ON l.id_post = p.id_post
       ORDER BY p.data_criacao DESC`
    );

    return res.json(rows(result));
  } catch (err) {
    console.error('❌ ERRO AO LISTAR POSTS (DB):', err.message);
    return res.status(500).json({ message: 'Erro ao listar posts' });
  }
};

// -----------------------------------------------------
// CRIAR POST (inclui categoria)
// -----------------------------------------------------
exports.create = async (req, res) => {
  try {
    const userId = req.user?.id_usuario || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Token inválido ou ausente.' });
    }

    let { conteudo, categoria } = req.body;
    if (!conteudo || !conteudo.trim()) {
      return res.status(400).json({ message: 'Conteúdo obrigatório' });
    }
    if (!categoria) categoria = 'geral';

    const result = await db.query(
      `INSERT INTO posts (id_usuario, conteudo, categoria, data_criacao)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, conteudo.trim(), categoria]
    );

    const created = rows(result)[0];

    // anexa autor_nome e likes_count ao retorno para facilitar frontend
    const sel = await db.query(`SELECT nome AS autor_nome FROM usuario WHERE id_usuario = $1`, [userId]);
    const authorRow = rows(sel)[0];
    created.autor_nome = authorRow ? authorRow.autor_nome : null;
    created.likes_count = 0;

    return res.status(201).json(created);
  } catch (err) {
    console.error('❌ ERRO AO CRIAR POST:', err.message);
    return res.status(500).json({ message: 'Erro interno ao criar post.' });
  }
};

// -----------------------------------------------------
// BUSCAR POR ID
// -----------------------------------------------------
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await db.query(
      `SELECT p.*, u.nome AS autor_nome, COALESCE(l.cnt, 0) AS likes_count
       FROM posts p
       LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
       LEFT JOIN (
         SELECT id_post, COUNT(*) AS cnt
         FROM post_likes
         GROUP BY id_post
       ) l ON l.id_post = p.id_post
       WHERE p.id_post = $1`,
      [id]
    );

    const found = rows(result)[0];
    if (!found) return res.status(404).json({ message: 'Post não encontrado' });

    return res.json(found);
  } catch (err) {
    console.error('❌ ERRO AO BUSCAR POST:', err.message);
    return res.status(500).json({ message: 'Erro ao buscar post' });
  }
};

// -----------------------------------------------------
// REMOVER POST (só autor)
// -----------------------------------------------------
exports.remove = async (req, res) => {
  try {
    const userId = req.user?.id_usuario || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Autenticação necessária.' });

    const id = req.params.id;

    const sel = await db.query(`SELECT id_usuario FROM posts WHERE id_post = $1`, [id]);
    const row = rows(sel)[0];
    if (!row) return res.status(404).json({ message: 'Post não encontrado' });

    if (String(row.id_usuario) !== String(userId)) {
      return res.status(403).json({ message: 'Somente o autor pode excluir.' });
    }

    await db.query(`DELETE FROM posts WHERE id_post = $1`, [id]);

    return res.json({ message: 'Post removido' });
  } catch (err) {
    console.error('❌ ERRO AO REMOVER POST:', err.message);
    return res.status(500).json({ message: 'Erro ao remover post' });
  }
};

// -----------------------------------------------------
// LIKE (inserir em post_likes) - evita duplicatas
// -----------------------------------------------------
exports.like = async (req, res) => {
  try {
    const userId = req.user?.id_usuario || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Autenticação necessária.' });

    const idPost = req.params.id;

    await db.query(
      `INSERT INTO post_likes (id_post, id_usuario, data_like)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id_post, id_usuario) DO NOTHING`,
      [idPost, userId]
    );

    return res.json({ message: 'Curtida registrada' });
  } catch (err) {
    console.error('❌ ERRO AO CURTIR:', err.message);
    return res.status(500).json({ message: 'Erro ao curtir' });
  }
};

// -----------------------------------------------------
// UNLIKE (remover)
// -----------------------------------------------------
exports.unlike = async (req, res) => {
  try {
    const userId = req.user?.id_usuario || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Autenticação necessária.' });

    const idPost = req.params.id;
    await db.query(`DELETE FROM post_likes WHERE id_post = $1 AND id_usuario = $2`, [idPost, userId]);
    return res.json({ message: 'Curtida removida' });
  } catch (err) {
    console.error('❌ ERRO AO REMOVER CURTIDA:', err.message);
    return res.status(500).json({ message: 'Erro ao remover curtida' });
  }
};

// -----------------------------------------------------
// CONTAGEM DE LIKES
// -----------------------------------------------------
exports.likesCount = async (req, res) => {
  try {
    const idPost = req.params.id;
    const result = await db.query(`SELECT COUNT(*)::int AS cnt FROM post_likes WHERE id_post = $1`, [idPost]);
    return res.json(result.rows ? result.rows[0] : { cnt: 0 });
  } catch (err) {
    console.error('❌ ERRO AO CONTAR LIKES:', err.message);
    return res.status(500).json({ message: 'Erro ao contar likes' });
  }
};
