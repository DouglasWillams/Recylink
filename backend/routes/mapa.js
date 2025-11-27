// backend/routes/mapa.js
const express = require('express');
const router = express.Router();

const mapaController = require('../controllers/mapaController');

// Lista todos os pontos de coleta
router.get('/pontos-coleta', mapaController.getAll);

module.exports = router;
