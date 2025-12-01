// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de Registro de Usuário
// Ex.: POST /api/auth/register
router.post('/register', authController.register);

// Rota de Login de Usuário Comum
// Ex.: POST /api/auth/login
router.post('/login', authController.login);

// (Opcional) Rota de Logout
// Ex.: POST /api/auth/logout
// router.post('/logout', authController.logout);

// (Opcional) Rota de Verificação de Token
// Ex.: GET /api/auth/verify
// router.get('/verify', authController.verifyToken);

module.exports = router;
