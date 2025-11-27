// backend/controllers/authController.js
const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Gera token JWT
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id_usuario,
      email: user.email,
      role: user.nivel_acesso
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ======================================================
//  REGISTRO (SEM VERIFICAÇÃO DE EMAIL)
// ======================================================

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }

    const existing = await db.query(
      "SELECT id_usuario FROM usuario WHERE email = $1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "E-mail já registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const rows = await db.query(
      `INSERT INTO usuario (nome, email, senha_hash, telefone, nivel_acesso, active)
       VALUES ($1, $2, $3, $4, 'user', TRUE)
       RETURNING id_usuario, nome, email, nivel_acesso`,
      [name, email, hashedPassword, phone || null]
    );

    const user = rows[0];

    return res.status(201).json({
      message: "Usuário registrado com sucesso!",
      user,
      token: generateToken(user),
      redirectUrl: "http://127.0.0.1:5500/pages/dashboard.html"
    });

  } catch (err) {
    console.error("❌ ERRO NO REGISTRO:", err);
    return res.status(500).json({ message: "Erro ao registrar usuário." });
  }
};

// ======================================================
//  LOGIN DE USUÁRIO (REDIRECIONA PARA DASHBOARD)
// ======================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const rows = await db.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.senha_hash);
    if (!match) {
      return res.status(400).json({ message: "Senha incorreta." });
    }

    return res.status(200).json({
      message: "Login bem-sucedido!",
      user: {
        id: user.id_usuario,
        nome: user.nome,
        email: user.email,
        nivel_acesso: user.nivel_acesso
      },
      token: generateToken(user),

      // 🔥 Redirecionamento para o dashboard do usuário
      redirectUrl: "http://127.0.0.1:5500/pages/dashboard.html"
    });

  } catch (err) {
    console.error("❌ ERRO NO LOGIN:", err);
    return res.status(500).json({ message: "Erro no login." });
  }
};

// ======================================================
//  LOGIN ADMIN
// ======================================================

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const rows = await db.query(
      "SELECT * FROM usuario WHERE email = $1 AND nivel_acesso = 'admin'",
      [email]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Acesso restrito ao administrador." });
    }

    const admin = rows[0];

    const match = await bcrypt.compare(password, admin.senha_hash);
    if (!match) {
      return res.status(400).json({ message: "Senha incorreta." });
    }

    return res.status(200).json({
      message: "Login admin bem-sucedido!",
      user: {
        id: admin.id_usuario,
        nome: admin.nome,
        email: admin.email,
        role: "admin"
      },
      token: generateToken(admin),
      redirectUrl: "/admin-dashboard"
    });

  } catch (err) {
    console.error("❌ ERRO LOGIN ADMIN:", err);
    return res.status(500).json({ message: "Erro no login admin." });
  }
};
