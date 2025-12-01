// backend/routes/profile.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authRequired } = require('../middleware/authMiddleware');

// ✅ Rota GET /profile para obter os dados do usuário logado
router.get('/profile', authRequired, profileController.getProfile);

// ✅ Rota PUT /profile para atualizar os dados do perfil 
router.put('/profile', authRequired, profileController.updateProfile); 

module.exports = router;