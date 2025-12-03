// backend/controllers/authController.js
const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.warn('[authController] ATENÇÃO: process.env.JWT_SECRET não definido. Defina uma chave JWT segura em produção.');
}

// Função Auxiliar para gerar Token
const generateToken = (user) => {
  // Normaliza campos importantes para o payload (evita undefined)
  const payload = {
    userId: user.id_usuario ?? user.id ?? user.userId ?? null,
    userRole: user.nivel_acesso ?? user.role ?? user.userRole ?? 'user',
    userName: user.nome ?? user.name ?? user.userName ?? ''
  };
  if (!process.env.JWT_SECRET) {
    // Em ambiente de desenvolvimento, gerar token com chave temporária (não recomendado em produção)
    return jwt.sign(payload, 'dev-secret-not-safe', { expiresIn: '24h' });
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Helper para extrair rows de diferentes wrappers de db.query
function extractRows(result) {
  if (!result) return [];
  // Caso o db.query retorne um objeto { rows: [...] }
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.rows)) return result.rows;
  // fallback: se for um objeto com propriedades enumeráveis (ex: single row)
  if (typeof result === 'object' && result !== null && Object.keys(result).length > 0) {
    return [result];
  }
  return [];
}

// ====================================================== 
// LOGIN DE USUÁRIO COMUM (exports.login)
// ------------------------------------------------------
// Aceita tanto `password` quanto `senha` no body.
// ====================================================== 
exports.login = async (req, res) => {
  try {
    // aceita password ou senha (compatibilidade com front-ends diferentes)
    const email = (req.body?.email || '').toString().trim();
    const password = req.body?.password ?? req.body?.senha ?? '';

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    // ⭐ ALTERAÇÃO AQUI: Usando aspas duplas na tabela para forçar o nome exato (PostgreSQL é case-sensitive)
    const raw = await db.query('SELECT * FROM "public"."usuario" WHERE email = $1', [email]);
    
    // ⭐ CORREÇÃO: Usando a verificação no resultado da query antes de extractRows para evitar crash
    if (!raw) {
        console.error('[authController.login] db.query retornou nulo ou indefinido.');
        return res.status(500).json({ message: 'Falha na comunicação com o banco de dados.' });
    }

    const rows = extractRows(raw);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Usuário ou senha incorretos.' });
    }

    const user = rows[0];

    // Compatibilidade com nomes de colunas diferentes:
    const storedHash = user.senha_hash ?? user.senhaHash ?? user.password_hash ?? user.password ?? null;

    if (!storedHash) {
      console.warn(`[authController.login] Usuário encontrado (${email}) mas hash de senha ausente no DB.`);
      return res.status(401).json({ message: 'Usuário ou senha incorretos.' });
    }

    // Remove espaços acidentais
    const normalizedHash = String(storedHash).trim();
    
    // ⭐ SE O ERRO 500 PERSISTIR, ESTA É A LINHA A VERIFICAR (bcrypt) ⭐
    const match = await bcrypt.compare(password, normalizedHash);

    if (!match) {
      return res.status(400).json({ message: 'Usuário ou senha incorretos.' });
    }

    // Compatibilidade para flag de conta ativa:
    const isActive =
      (typeof user.active !== 'undefined' ? user.active
        : (typeof user.ativo !== 'undefined' ? user.ativo
          : (typeof user.is_active !== 'undefined' ? user.is_active
            : (typeof user.enabled !== 'undefined' ? user.enabled : true))));

    if (!isActive) {
      return res.status(403).json({ message: 'Conta inativa. Contate o suporte.' });
    }

    // Normaliza o objeto de usuário retornado
    const safeUser = {
      id_usuario: user.id_usuario ?? user.id ?? user.userId,
      nome: user.nome ?? user.name ?? user.full_name ?? '',
      email: user.email ?? email,
      nivel_acesso: user.nivel_acesso ?? user.role ?? 'user'
    };

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login bem-sucedido!',
      user: safeUser,
      token,
      // 🌟 CORREÇÃO: Usando a URL de redirecionamento do VERCEL ou path relativo
      redirectUrl: process.env.LOGIN_REDIRECT || '/pages/user-home.html' 
    });
  } catch (err) {
    console.error(' ❌ ERRO NO LOGIN (CATCH):', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Erro no login.' });
  }
};

// ====================================================== 
// REGISTRO (exports.register)
// ------------------------------------------------------
// Normaliza o retorno do db.query e garante token
// ====================================================== 
exports.register = async (req, res) => {
  const nome = req.body?.nome ?? req.body?.name;
  const email = req.body?.email;
  const password = req.body?.password ?? req.body?.senha;
  const telefone = req.body?.telefone ?? req.body?.phone ?? null;

  if (!nome || !email || !password) {
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
  }

  try {
    const existingRaw = await db.query('SELECT id_usuario FROM public.usuario WHERE email = $1', [email]);
    const existing = extractRows(existingRaw);

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertQuery = `
      INSERT INTO public.usuario (nome, email, senha_hash, telefone, nivel_acesso, active, data_cadastro)
      VALUES ($1, $2, $3, $4, 'user', true, NOW())
      RETURNING id_usuario, nome, nivel_acesso, email
    `;
    
    const newRaw = await db.query(insertQuery, [nome, email, hashedPassword, telefone]);
    const insertedRows = extractRows(newRaw);
    const user = insertedRows[0];

    // Se por algum motivo o DB não retornar user, construímos um fallback
    const safeUser = {
      id_usuario: user?.id_usuario ?? null,
      nome: user?.nome ?? nome,
      email: user?.email ?? email,
      nivel_acesso: user?.nivel_acesso ?? 'user'
    };
    
    const token = generateToken(safeUser);

    return res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      token,
      user: safeUser,
      userId: safeUser.id_usuario,
      userName: safeUser.nome,
      userRole: safeUser.nivel_acesso
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};