// backend/routes/profile.js
const express
= require('express');
const router
= express.Router();
const profileController
= require('../controllers/profileController');
const { authRequired
} = require('../middleware/authMiddleware');
 
// GET / -> corresponde a /profile (busca perfil)
router.get('/',
authRequired, profileController.getProfile);
 
// PUT / -> corresponde a /profile (atualiza perfil)
router.put('/',
authRequired, profileController.updateProfile);
 
module.exports = router;