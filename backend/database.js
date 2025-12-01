// backend/database.js (retry/backoff + debug)
require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL não definido no .env');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

async function trySimpleQuery(client) {
  return client.query('SELECT NOW()');
}

/**
 * Tenta conectar e executar uma consulta de verificação com retries.
 * - retries: número de tentativas
 * - delay: função de backoff (ms)
 */
async function testConnectionWithRetry(retries = 4) {
  let attempt = 0;
  let lastErr = null;
  while (attempt < retries) {
    attempt++;
    console.log(`DB: testConnection attempt ${attempt}/${retries}...`);
    let client;
    try {
      client = await pool.connect();
      const r = await trySimpleQuery(client);
      client.release();
      console.log('DB: conectado com sucesso ->', r.rows[0]);
      return true;
    } catch (err) {
      lastErr = err;
      console.warn(`DB: tentativa ${attempt} falhou:`, err.message || err);
      try { if (client) client.release(); } catch(e){}
      // backoff exponencial com jitter
      const backoff = Math.min(2000 * Math.pow(2, attempt), 20000);
      const jitter = Math.floor(Math.random() * 500);
      const wait = backoff + jitter;
      console.log(`DB: aguardando ${wait}ms antes da próxima tentativa`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastErr || new Error('Falha desconhecida ao testar conexão DB');
}

async function query(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}

module.exports = { query, pool, testConnection: testConnectionWithRetry };
