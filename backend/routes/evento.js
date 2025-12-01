// backend/routes/evento.js

const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { authRequired } = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

// Rotas Específicas
router.post('/eventos', authRequired, eventoController.create); 
router.get('/eventos', eventoController.getAll);
router.post('/eventos/:id/inscrever', authRequired, eventoController.registerUserToEvent); 
router.get('/minhas-inscricoes', authRequired, eventoController.myRegistrations); 

// ✅ CRÍTICO: Rota estática /meus deve vir antes do genérico :id
router.put('/eventos/meus/:id', authRequired, eventoController.updateMyEvent); 
router.delete('/eventos/meus/:id', authRequired, eventoController.deleteMyEvent);
router.get('/eventos/meus', authRequired, eventoController.listMyEvents); 

// Rota Genérica (Deve ser a última)
router.get('/eventos/:id', eventoController.getById); 

module.exports = router;