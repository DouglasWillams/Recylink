// backend/database.js
// Este arquivo conecta ao PostgreSQL (Supabase) via Pool e implementa lógica de retry.

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('🔴 ERRO CRÍTICO: DATABASE_URL não definido. Configure no Railway.');
    // No ambiente Node.js normal, isso faria o processo parar.
    // Em ambientes como o Railway, ele pode tentar continuar, mas falhará em qualquer rota de DB.
}

const pool = new Pool({
    connectionString,
    // CRÍTICO PARA SUPABASE/RENDER: 
    // Garante que o SSL esteja ativo. rejectUnauthorized: false é comum para provedores 
    // externos que não usam certificados CA padrão, como alguns URLs do Supabase.
    ssl: { 
        rejectUnauthorized: false 
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000
});

async function trySimpleQuery(client) {
    // Query simples para verificar a saúde da conexão
    return client.query('SELECT NOW()');
}

/**
 * Tenta conectar e executar uma consulta de verificação com retries.
 */
async function testConnectionWithRetry(retries = 4) {
    if (!connectionString) {
        throw new Error('DATABASE_URL está ausente. Não é possível conectar ao DB.');
    }
    
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
    throw lastErr || new Error('Falha desconhecida ao testar conexão DB após retries.');
}

/**
 * Função principal para executar queries (usada nos controllers).
 */
async function query(text, params) {
    // O pool.query é mais simples e rápido para queries únicas.
    const res = await pool.query(text, params);
    return res.rows; // Retorna apenas as linhas para simplificar
}

module.exports = { 
    query, 
    pool, 
    testConnection: testConnectionWithRetry 
};