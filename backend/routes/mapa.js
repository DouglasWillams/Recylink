// backend/routes/mapa.js 
const express = require('express'); 
const router = express.Router(); 
const mapaController = require('../controllers/mapaController'); 
const { authRequired } = require('../middleware/authMiddleware'); // Importa o middleware

// Rota pública: Lista todos os pontos de coleta 
router.get('/pontos-coleta', mapaController.getAll); 

// ✅ NOVO: Rota protegida: Adicionar novo ponto de coleta
router.post('/pontos-coleta', authRequired, mapaController.createPoint);

// ✅ NOVO: Rota protegida: Deletar ponto de coleta
router.delete('/pontos-coleta/:id', authRequired, mapaController.deletePoint);

module.exports = router;