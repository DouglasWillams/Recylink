// backend/routes/evento.js
const express = require('express');
const router = express.Router();

const eventoController = require('../controllers/eventoController');

// Rotas CRUD para eventos
router.get('/eventos', eventoController.list);
router.post('/eventos', eventoController.create);
router.get('/eventos/:id', eventoController.getById);
router.put('/eventos/:id', eventoController.update);
router.delete('/eventos/:id', eventoController.remove);

module.exports = router;
