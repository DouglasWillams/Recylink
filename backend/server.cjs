// backend/server.cjs
require('dotenv').config();

// ===== Global error handlers (very useful for catching crashes) =====
process.on('unhandledRejection', (reason, p) => {
  console.error('🔴 Unhandled Rejection at Promise', p, 'reason:', reason && reason.stack ? reason.stack : reason);
});
process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err && err.stack ? err.stack : err);
  // Não fazemos process.exit aqui para não interromper o ambiente serverless durante debugging.
});

// ===== Imports =====
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database'); // assume database.js já existe e exporta testConnection()
const fs = require('fs/promises');

// Rotas
const authRouter = require('./routes/auth');
const postRoutes = require('./routes/post');
const mapRoutes = require('./routes/mapa');
const profileRoutes = require('./routes/profile');
const eventoRoutes = require('./routes/evento');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== ENV debug info (remove later if desejar) =====
console.log('ENV INFO:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL_present: !!process.env.DATABASE_URL,
  VERCEL: !!process.env.VERCEL,
  RAILWAY: !!process.env.RAILWAY,
  VERCEL_URL: process.env.VERCEL_URL || null
});

// ===== Middlewares =====
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
    // Se não houver origin (ex: Postman, same-origin), permitir
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

// Static (dev only) - mantém para testes locais
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Routes =====
app.use('/api/auth', authRouter);
app.use('/api/posts', postRoutes);
app.use('/api/mapa', mapRoutes);
app.use('/api/evento', eventoRoutes);
app.use('/api/profile', profileRoutes);

// Health-check / root
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Servidor Recylink no ar' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ ok: false, message: 'Endpoint não encontrado' });
});

// Error middleware
app.use((err, req, res, next) => {
  console.error('Erro no servidor (middleware):', err && err.stack ? err.stack : err);
  // se for erro de CORS, envie 403
  if (err && String(err.message).includes('Not allowed by CORS')) {
    return res.status(403).json({ ok: false, message: err.message });
  }
  res.status(500).json({ ok: false, message: 'Erro interno do servidor' });
});

// ===== Database verification (safe) =====
async function verifyDatabaseConnectionSafe() {
  if (!db || typeof db.testConnection !== 'function') {
    console.warn('⚠️  database.testConnection() não está disponível. Pulando verificação.');
    return;
  }
  try {
    console.log('DB: iniciando verificação de conexão (com retry)...');
    await db.testConnection(); // seu database.js faz retries/backoff
    console.log('DB: verificação completa - conectado com sucesso.');
  } catch (err) {
    console.error('DB: verificação falhou (continuando sem sair):', err && err.message ? err.message : err);
    // Não fazemos process.exit para não atrapalhar ambientes serverless.
    // Rotas que dependem do DB continuarão a falhar ao serem chamadas.
  }
}

// Dispara a verificação no cold start (útil para logs)
verifyDatabaseConnectionSafe().catch(e => {
  console.error('Erro inesperado na verificação do DB:', e && e.stack ? e.stack : e);
});

// ===== Serverless detection =====
const isServerless = Boolean(
  process.env.VERCEL
  || process.env.AWS_LAMBDA_FUNCTION_NAME
  || process.env.FUNCTIONS_WORKER_RUNTIME
);

// Se for serverless (Vercel), exportamos o app para que o runtime gerencie.
// Caso contrário (Railway, VPS, Docker), iniciamos o listener normalmente.
if (isServerless) {
  console.log('ℹ️  Rodando em modo SERVERLESS - exportando app para o runtime (Vercel/AWS).');
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT} (process.env.PORT=${process.env.PORT || 'n/a'})`);
  });
  module.exports = app;
}