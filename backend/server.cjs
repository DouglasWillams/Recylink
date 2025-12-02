// backend/server.cjs
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
const profileRoutes = require('./routes/profile'); 
const eventoRoutes = require('./routes/evento');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// 🌟 LÓGICA DE CORS CORRIGIDA: SUPORTE A PRODUÇÃO (VERCEL) 🌟
// Permite que o Frontend e o Backend Serverless se comuniquem no mesmo domínio.
const allowedOrigins = [
  'http://127.0.0.1:5500', // Dev local (padrão)
  'http://localhost:5500', // Dev local (Live Server/outras portas)
  'http://localhost:3000', // Dev local (porta do próprio backend)
  process.env.FRONTEND_URL, // URL de produção definida nas variáveis do Vercel
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null // Permite o domínio dinâmico do Vercel
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

// Configuração de Conteúdo Estático (Apenas para ambiente de desenvolvimento local)
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
app.use('/api/profile', profileRoutes);

// Rota raiz para checagem simples
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

// ------------------------------
// LÓGICA PARA AMBIENTE SERVERLESS (VERCEL)
// ------------------------------

// Em ambiente Serverless, não podemos usar app.listen().
// O Vercel gerencia a inicialização e o fechamento da função,
// e usa a exportação do módulo Express como ponto de entrada.

// Tentamos verificar a conexão do DB na inicialização da função serverless.
// Se falhar, as rotas que acessam o DB também falharão, mas o servidor será
// exportado para que o Vercel possa rotear o tráfego.

async function verifyDatabaseConnection() {
    try {
        await db.testConnection();
        console.log(`  ✅     CONEXÃO DB VERIFICADA: Pronta para Serverless.`);
    } catch (err) {
        console.error('  ❌     ERRO FATAL NO DB: Conexão inicial falhou.', err.message);
        // Não usamos process.exit(1) em Serverless; o log é suficiente.
    }
}

// Inicia a verificação de conexão (será executada a cada "cold start" da função)
verifyDatabaseConnection();

// EXPORTAÇÃO CRÍTICA PARA O VERCEL: 
// O Vercel precisa que a instância do Express seja exportada, e não 'escutada' (listen).
module.exports = app;

// O bloco original 'start()' e 'app.listen()' foi removido intencionalmente.