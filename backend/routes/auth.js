const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Registro e login sem email
router.post('/register', authController.register);
router.post('/login', authController.login);

// Admin
router.post('/admin/login', authController.adminLogin);

module.exports = router;
