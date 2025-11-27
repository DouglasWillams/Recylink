// backend/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const db = require('./database');

// rotas
const authRouter = require('./routes/auth');
const mapaRouter = require('./routes/mapa');
const eventoRouter = require('./routes/evento');
const postRouter = require('./routes/post');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://127.0.0.1:5500',
    methods: 'GET,POST,PUT,DELETE',
    credentials: false,
  })
);

// servir frontend (apenas se quiser; opcional)
app.use(express.static(path.join(__dirname, '../frontend')));

// rotas API
app.use('/api', authRouter);
app.use('/api', mapaRouter);
app.use('/api', eventoRouter);
app.use('/api', postRouter);

// inicialização
async function start() {
  const ok = await db.testConnection();
  if (!ok) {
    console.error('❌ Falha ao conectar ao banco. Servidor não iniciado.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('--------------------------------------');
    console.log('🚀 Servidor Recylink rodando!');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('--------------------------------------');
  });
}

start();
