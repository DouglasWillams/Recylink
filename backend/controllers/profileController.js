// backend/controllers/profileController.js
const db = require('../database');

// Obtém os dados do perfil do usuário logado
exports.getProfile = async (req, res) => {
    // O ID do usuário é injetado no req.user pelo middleware authRequired
    const userId = req.user.userId; 

    try {
        const user = await db.query(
            `SELECT 
                id_usuario, 
                nome, 
                email, 
                telefone, 
                nivel_acesso, 
                data_cadastro
             FROM public.usuario 
             WHERE id_usuario = $1`, 
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        return res.json(user[0]);

    } catch (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Atualiza o perfil do usuário logado
exports.updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { nome, telefone } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
    }

    try {
        const result = await db.query(
            `UPDATE public.usuario 
             SET nome = $1, telefone = $2
             WHERE id_usuario = $3
             RETURNING id_usuario, nome, email, telefone, nivel_acesso`,
            [nome, telefone || null, userId]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
        }

        return res.json({ 
            message: 'Perfil atualizado com sucesso!', 
            user: result[0] 
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
    }
};