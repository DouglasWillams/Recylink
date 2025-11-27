// backend/database.js  (versão de diagnóstico — cole e salve)
const { Pool } = require('pg');
require('dotenv').config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'DB_DATABASE'];
requiredEnv.forEach(k => {
  if (!process.env[k]) {
    console.warn(`⚠️ Variável de ambiente ${k} não definida no .env`);
  }
});

// monta connection string e LOGA uma versão mascarada (sem expor senha)
const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const maskedConnectionString = `postgres://${process.env.DB_USER}:*****@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
console.log('DB connection (masked):', maskedConnectionString);

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// testConnection mais verboso — mostra current_database, schema e usuário da sessão
async function testConnection() {
  try {
    const client = await pool.connect();
    try {
      // garante schema public pela sessão e imediatamente consulta infos
      await client.query('SET search_path TO public');
      const info = await client.query("SELECT current_database() AS db, current_schema() AS schema, session_user AS sess_user, inet_server_addr() AS server_addr");
      console.log('✅ DB connection info:', info.rows[0]);
      // opcional: listar tabelas publicas aqui para debug
      const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;");
      console.log('✅ public tables:', tables.rows.map(r => r.tablename).join(', ') || '(nenhuma)');
    } finally {
      client.release();
    }
    console.log('✅ Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco (testConnection):', err.message);
    return false;
  }
}

/**
 * query(sql, params)
 * executa uma query e garante que o search_path está em public
 */
async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    await client.query('SET search_path TO public');
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  testConnection
};
