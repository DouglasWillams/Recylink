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
const PORT = process.env.PORT || 3000; // Mantido para uso em ambiente de dev local

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// 🌟 LÓGICA DE CORS CORRIGIDA: SUPORTE A PRODUÇÃO (VERCEL) 🌟
const allowedOrigins = [
  'http://127.0.0.1:5500', // Dev local (padrão)
  'http://localhost:5500', // Dev local (Live Server/outras portas)
  'http://localhost:3000', // Dev local (porta do próprio backend)
  // O Vercel usará a URL do seu deploy como "origin"
  process.env.FRONTEND_URL, 
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
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

// Configuração de Conteúdo Estático (Apenas para ambiente de desenvolvimento local, o Vercel irá lidar com isso via vercel.json)
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
// CONEXÃO DE BANCO DE DADOS E EXPORTAÇÃO PARA VERCEL
// ------------------------------

// O Vercel não inicia o servidor com app.listen(), mas sim exporta a instância do Express.
// No entanto, precisamos testar a conexão com o DB antes que qualquer rota seja chamada.
// Em um ambiente serverless, a conexão é feita sob demanda, mas o teste inicial é bom para logs.

async function verifyDatabaseConnection() {
    try {
        await db.testConnection();
        console.log(`  ✅     CONEXÃO DB VERIFICADA: Pronta para Serverless.`);
    } catch (err) {
        console.error('  ❌     ERRO FATAL NO DB: Conexão inicial falhou.', err.message);
        // Em um ambiente serverless, não se pode usar process.exit(1), mas registramos o erro.
        // A próxima execução tentará se conectar novamente.
    }
}

// Inicia a verificação de conexão (a ser executada na inicialização do Serverless Function)
verifyDatabaseConnection();


// Exporta o aplicativo Express para ser usado como Serverless Function pelo Vercel.
module.exports = app;