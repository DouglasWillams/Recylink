// backend/server.cjs
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database'); // veja seção de db abaixo
const fs = require('fs/promises');

// Rotas
const authRouter = require('./routes/auth');
const postRoutes = require('./routes/post');
const mapRoutes = require('./routes/mapa');
const profileRoutes = require('./routes/profile');
const eventoRoutes = require('./routes/evento');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(bodyParser.json());

const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
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

// static (dev only)
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth', authRouter);
app.use('/api/posts', postRoutes);
app.use('/api/mapa', mapRoutes);
app.use('/api/evento', eventoRoutes);
app.use('/api/profile', profileRoutes);

// health check
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Servidor Recylink no ar' });
});

// 404
app.use((req, res, next) => {
  res.status(404).json({ ok: false, message: 'Endpoint não encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro no servidor (middleware):', err);
  res.status(500).json({ ok: false, message: 'Erro interno do servidor' });
});

// Função de verificação de DB (executa no cold start)
async function verifyDatabaseConnection() {
  try {
    await db.testConnection();
    console.log('✅  CONEXÃO DB VERIFICADA.');
  } catch (err) {
    console.error('❌  ERRO AO CONECTAR AO DB NA INICIALIZAÇÃO:', err && err.message ? err.message : err);
    // não damos exit: em muitos hosts serverless, o runtime quer a exportação do app.
  }
}

// Ao carregar o módulo, tentamos verificar DB (opcional)
verifyDatabaseConnection();

// Determina se estamos em ambiente serverless (Vercel, AWS Lambda, etc)
const isServerless = Boolean(
  process.env.VERCEL
  || process.env.AWS_LAMBDA_FUNCTION_NAME
  || process.env.FUNCTIONS_WORKER_RUNTIME
);

// Se estivermos em serverless, exportamos o app (Vercel usa isso).
// Caso contrário (Railway/Docker/local) iniciamos o servidor com app.listen().
if (isServerless) {
  console.log('ℹ️  Iniciando em MODO SERVERLESS — exportando app (Vercel/AWS Lambda detected).');
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT} (process.env.PORT=${process.env.PORT || 'n/a'})`);
  });
  // Exporte também para permitir testes locais ou uso em outros módulos
  module.exports = app;
}
