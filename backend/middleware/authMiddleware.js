// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
// Garante que o .env seja carregado antes de acessar process.env.JWT_SECRET
require('dotenv').config();

exports.authRequired = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Autenticação necessária.' });
    }

    const token = authHeader.split(' ')[1];
    
    // ⭐ CORREÇÃO/ROBUSTEZ: Define a chave secreta para verificação ⭐
    // Tenta usar a chave de ambiente, senão usa a chave de fallback do authController
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-not-safe';
    
    // Log de segurança em ambiente não-produção
    if (!process.env.JWT_SECRET) {
        console.warn('[AuthMiddleware] Usando chave DEV para verificação! Configure JWT_SECRET.');
    }

    try {
        // Verifica o token e adiciona o payload (userId, userRole) ao request
        // Usa a chave obtida (seja a real ou a de fallback)
        const user = jwt.verify(token, jwtSecret); 
        
        // Adiciona normalização para compatibilidade com outros controllers (userId, id_usuario, id)
        req.user = { 
            ...user,
            userId: user.userId || user.id_usuario || user.id, 
            id_usuario: user.id_usuario || user.userId || user.id
        };
        
        next();
    } catch (err) {
        console.error(' ❌  ERRO DE VERIFICAÇÃO DE TOKEN:', err.message);
        return res.status(401).json({ message: 'Token inválido ou ausente.' });
    }
};