// backend/routes/post.js
// Rotas oficiais no plural (SEM usar /post)
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authRequired } = require('../middleware/authMiddleware'); 

// ----------------------------
// LISTAR POSTS (GET /api/posts)
// ----------------------------
router.get('/', postController.list);

// ----------------------------
// CRIAR POST (POST /api/posts)
// ----------------------------
router.post('/', authRequired, postController.create);

// ----------------------------
// ROTAS DE AÇÃO (LIKES, REMOVE, GET BY ID)
// ----------------------------
// POST /api/posts/:id/like -> Curtir
router.post('/:id/like', authRequired, postController.like);

// DELETE /api/posts/:id/like -> Descurtir/Remover Curtida
router.delete('/:id/like', authRequired, postController.unlike);

// GET /api/posts/:id/likes -> Contagem de likes
router.get('/:id/likes', postController.likesCount); 

// GET /api/posts/:id -> Buscar por ID
router.get('/:id', postController.getById);

// DELETE /api/posts/:id -> Remover Post
router.delete('/:id', authRequired, postController.remove);

module.exports = router;