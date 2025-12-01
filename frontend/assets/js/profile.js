// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authRequired } = require('../middleware/authMiddleware');

// GET /api/profile -> retorna dados do usuário logado
router.get('/', authRequired, profileController.getProfile);

// PUT /api/profile -> atualiza dados do perfil do usuário logado
router.put('/', authRequired, profileController.updateProfile);

module.exports = router;