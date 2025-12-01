// backend/routes/comment.js

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authRequired } = require('../middleware/authMiddleware');

// LISTAR COMENTÁRIOS DE UM POST
router.get('/posts/:id/comments', commentController.listByPost);

// CRIAR COMENTÁRIO
router.post('/posts/:id/comments', authRequired, commentController.create);

// REMOVER COMENTÁRIO
router.delete('/comments/:id', authRequired, commentController.remove);

module.exports = router;
