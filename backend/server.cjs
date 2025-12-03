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
const profileRoutes = require('./routes/profile'); // ✅ Importação correta
const eventoRoutes = require('./routes/evento');

const app = express();
const PORT = process.env.PORT || 3000;

// ====================================================================
// 1. Configuração de CORS (Resolve ERRO 403 Forbidden com Wildcard)
// ====================================================================

// Define os padrões de origem permitidos para o Vercel Preview
const allowedOriginsRegex = [
    /http:\/\/127\.0\.0\.1:\d+$/, 
    /http:\/\/localhost:\d+$/,
    /https?:\/\/.*\.vercel\.app$/, // Permite qualquer subdomínio .vercel.app
    process.env.FRONTEND_URL 
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        
        let isAllowed = false;
        
        for (const pattern of allowedOriginsRegex) {
            if (typeof pattern === 'string') {
                if (pattern === origin) {
                    isAllowed = true;
                    break;
                }
            } else if (origin.match(pattern)) {
                isAllowed = true;
                break;
            }
        }
        
        if (isAllowed) {
            callback(null, true);
        } else {
            const message = `Not allowed by CORS. Origin: ${origin}`;
            console.error('❌ CORS BLOCKED:', message);
            callback(new Error(message), false);
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
// 2. Rotas (CRÍTICO: Define o prefixo /profile - FIM DO ERRO 404)
// ====================================================================

app.use('/auth', authRouter);
app.use('/posts', postRoutes);
app.use('/mapa', mapRoutes);
app.use('/evento', eventoRoutes);
app.use('/profile', profileRoutes); // ✅ Este deve ser o caminho.

// Health-check / Status (ROTA DE SUCESSO)
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

verifyDatabaseConnectionSafe();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (isServerless) {
    module.exports = app;
} else {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT} (process.env.PORT=${process.env.PORT || 'n/a'})`);
    });
    module.exports = app;
}