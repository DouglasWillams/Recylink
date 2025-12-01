// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const fs = require('fs/promises');

// Importação das rotas
const authRouter = require('./routes/auth');
const postRoutes = require('./routes/post');
const mapRoutes = require('./routes/mapa');
const profileRoutes = require('./routes/profile'); // <-- O roteador de perfil
const eventoRoutes = require('./routes/evento');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));
app.options('*', cors());

// Configuração de Conteúdo Estático
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------------------
// Definição das Rotas da API
// ------------------------------

// Montagens com namespaces:
app.use('/api/auth', authRouter);
app.use('/api/posts', postRoutes);
app.use('/api/mapa', mapRoutes);
app.use('/api/evento', eventoRoutes);

// ⭐ CORREÇÃO CRÍTICA: Rotas de perfil para /api/profile. 
// Isso força o uso da rota específica '/profile' dentro do roteador principal.
app.use('/api', profileRoutes); 
// 🚨 NOTA: Se profileRoutes tiver rotas '/' internas, elas serão acessadas como /api
// Mas no seu caso, vamos garantir que profileRoutes tenha o prefixo '/profile' internamente.
// Já que você está chamando fetchJson('/profile') no frontend.
// Vamos reverter o server.js para o original e corrigir o routes/profile.js 
// para ser mais explícito, se for necessário.

// Revertendo server.js para o original [cite: 3368-3372]
app.use('/api/profile', profileRoutes); // Reverte para o original
// Fim da reversão

// Rota raiz para checagem simples (útil para debug)
app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Servidor Recylink no ar' });
});

// Tratamento básico de 404 para rotas não encontradas
app.use((req, res, next) => {
    res.status(404).json({ ok: false, message: 'Endpoint não encontrado' });
});

// Tratamento de erro genérico
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);
    res.status(500).json({ ok: false, message: 'Erro interno do servidor' });
});

// Início do Servidor
async function start() {
    // Cria a pasta de uploads (se necessário)
    const uploadPath = path.join(__dirname, 'uploads', 'avatars');
    try {
        await fs.mkdir(uploadPath, { recursive: true });
        console.log(` ✅  Pasta de uploads criada/verificada: ${uploadPath}`);
    } catch (e) {
        console.error(' ❌  Não foi possível criar pasta de uploads:', e);
    }

    // Testa a conexão com o banco de dados
    try {
        const ok = await db.testConnection();
        if (!ok) {
            console.error(' ❌  Falha ao conectar ao banco. Servidor não iniciado.');
            process.exit(1);
        }
    } catch (err) {
        console.error(' ❌  Erro ao testar conexão com DB:', err);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log('--------------------------------------');
        console.log(' 🚀  Servidor Recylink rodando!');
        console.log(` 🌐  URL: http://localhost:${PORT}`);
        console.log('--------------------------------------');
    });
}
start();