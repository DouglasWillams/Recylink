// backend/controllers/authController.js
const db = require('../database');
const bcrypt = require('bcrypt'); // Use apenas 'bcrypt' ou 'bcryptjs', mas não ambos!
const jwt = require('jsonwebtoken');

// Obtém a chave secreta JWT (CRÍTICO)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-not-safe';
const SALT_ROUNDS = 10; // Custo do hash (padrão 10)

/**
 * Helper para extrair rows da resposta da query
 */
function rows(result) {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (result.rows) return result.rows;
    return [];
}

// -----------------------------------------------------
// REGISTRO DE NOVO USUÁRIO
// -----------------------------------------------------
exports.register = async (req, res) => {
    const { nome, email, password, telefone } = req.body;

    if (!nome || !email || !password) {
        return res.status(400).json({ message: 'Nome, E-mail e Senha são obrigatórios.' });
    }

    try {
        // 1. Verificar se o usuário já existe
        const existingUser = await db.query('SELECT id_usuario FROM usuario WHERE email = $1', [email]);
        if (rows(existingUser).length > 0) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }

        // 2. Criar Hash da Senha
        const senha_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // 3. Inserir novo usuário no DB
        const result = await db.query(
            `INSERT INTO usuario (nome, email, senha_hash, telefone, nivel_acesso, active) 
             VALUES ($1, $2, $3, $4, 'user', TRUE) 
             RETURNING id_usuario, nome, email, nivel_acesso, telefone`,
            [nome, email, senha_hash, telefone || null]
        );

        const newUser = rows(result)[0];

        // 4. Gerar Token de Login Imediato (Opcional, mas útil para UX)
        const token = jwt.sign({ 
            id_usuario: newUser.id_usuario, 
            userId: newUser.id_usuario, 
            role: newUser.nivel_acesso 
        }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({ 
            message: 'Usuário registrado com sucesso!',
            token: token,
            user: newUser
        });

    } catch (err) {
        console.error('❌ ERRO NO REGISTRO (DB/BCRYPT):', err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// -----------------------------------------------------
// LOGIN DE USUÁRIO
// -----------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e Senha são obrigatórios.' });
    }

    try {
        // 1. Buscar usuário
        const result = await db.query('SELECT * FROM usuario WHERE email = $1', [email]);
        const user = rows(result)[0];

        if (!user) {
            return res.status(404).json({ message: 'E-mail ou senha inválidos.' });
        }

        // 2. Comparar Senha
        const match = await bcrypt.compare(password, user.senha_hash);

        if (!match) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // 3. Gerar Token
        const token = jwt.sign({ 
            id_usuario: user.id_usuario, 
            userId: user.id_usuario, 
            role: user.nivel_acesso 
        }, JWT_SECRET, { expiresIn: '7d' });

        // 4. Retornar dados
        return res.json({ 
            message: 'Login realizado com sucesso.',
            token: token,
            user: {
                id_usuario: user.id_usuario,
                nome: user.nome,
                email: user.email,
                nivel_acesso: user.nivel_acesso
            },
            // Redireciona para o dashboard
            redirectUrl: '/pages/user-home.html' 
        });

    } catch (err) {
        console.error('❌ ERRO NO LOGIN:', err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};