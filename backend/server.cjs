// backend/server.cjs
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database'); 

// Rotas
const authRouter = require('./routes/auth');
const postRoutes = require('./routes/post');
const mapRoutes = require('./routes/mapa');
const profileRoutes = require('./routes/profile'); // Importação correta
const eventoRoutes = require('./routes/evento');

const app = express();
const PORT = process.env.PORT || 3000;

// ====================================================================
// 1. Configuração de CORS (Resolve ERRO 403 Forbidden)
// ====================================================================

const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // CRÍTICO: Deve ser configurado no Railway
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));
app.options('*', cors());

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ====================================================================
// 2. Rotas (CRÍTICO: Removido o prefixo '/api' para o Railway)
// ====================================================================

app.use('/auth', authRouter);
app.use('/posts', postRoutes);
app.use('/mapa', mapRoutes);
app.use('/evento', eventoRoutes);
app.use('/profile', profileRoutes); // ✅ Roteia /profile para o profile.js

// Health-check / Status
app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Servidor Recylink no ar' });
});

app.get('/status', (req, res) => {
    res.json({ ok: true, message: 'Backend RecyLink UP!', env: process.env.NODE_ENV || 'development' });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ ok: false, message: 'Endpoint não encontrado' });
});

// Error middleware
app.use((err, req, res, next) => {
    if (err && String(err.message).includes('Not allowed by CORS')) {
        return res.status(403).json({ ok: false, message: err.message });
    }
    res.status(500).json({ ok: false, message: 'Erro interno do servidor' });
});

// ====================================================================
// 3. Inicialização e Conexão com DB
// ====================================================================

async function verifyDatabaseConnectionSafe() {
    if (db && typeof db.testConnection === 'function') {
        try {
            await db.testConnection(); 
        } catch (err) {
            console.error('DB: verificação falhou:', err.message);
        }
    }
}

// Inicia a verificação do DB no cold start
verifyDatabaseConnectionSafe();

// Inicialização do Servidor no Railway
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT} (process.env.PORT=${process.env.PORT || 'n/a'})`);
});

module.exports = app;