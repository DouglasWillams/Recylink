// backend/controllers/eventoController.js

const db = require('../database');

// Cria/Sugere um novo evento (AGORA AUTO-APROVA)
exports.create = async (req, res) => {
    const { titulo, descricao, localizacao, data_evento, imagem_url } = req.body;
    const userId = req.user.userId; // Vem do token JWT

    if (!titulo || !data_evento || !userId) {
        return res.status(400).json({ message: 'Título, data do evento e ID do usuário são obrigatórios.' });
    }

    try {
        // Define status_aprovacao como 'aprovado' para auto-publicar
        const rows = await db.query(
            `INSERT INTO evento (titulo, descricao, localizacao, data_evento, imagem_url, sugerido_por_id, status_aprovacao, data_cadastro) 
            VALUES ($1, $2, $3, $4, $5, $6, 'aprovado', NOW()) RETURNING id_evento, titulo, status_aprovacao`,
            [titulo, descricao || null, localizacao || null, data_evento, imagem_url || null, userId]
        );

        return res.status(201).json({
            message: 'Evento publicado com sucesso!',
            evento: rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar evento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Obtém todos os eventos (Lista APENAS os aprovados)
exports.getAll = async (req, res) => {
    try {
        const eventos = await db.query(
            `SELECT 
                e.*, 
                u.nome as sugerido_por_nome 
            FROM evento e 
            LEFT JOIN public.usuario u ON e.sugerido_por_id = u.id_usuario
            WHERE e.status_aprovacao = 'aprovado'
            ORDER BY e.data_evento ASC`
        );
        return res.json(eventos);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Obtém detalhes de um evento específico (Sem restrição de status)
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const evento = await db.query('SELECT * FROM evento WHERE id_evento = $1', [id]); 
        if (evento.length === 0) {
            return res.status(404).json({ message: 'Evento não encontrado.' });
        }
        return res.json(evento[0]);
    } catch (error) {
        console.error('Erro ao buscar evento por ID:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Atualizar Evento Criado pelo Próprio Usuário (PUT /eventos/meus/:id)
exports.updateMyEvent = async (req, res) => {
    const userId = req.user.userId; 
    const eventId = req.params.id;
    const { titulo, descricao, localizacao, data_evento, imagem_url } = req.body;

    if (!titulo || !data_evento) {
        return res.status(400).json({ message: 'Título e data são obrigatórios.' });
    }

    try {
        // CRÍTICO: Verifica se o evento pertence ao usuário antes de atualizar
        const result = await db.query(
            "UPDATE evento SET titulo=$1, descricao=$2, localizacao=$3, data_evento=$4, imagem_url=$5 WHERE id_evento=$6 AND sugerido_por_id=$7 RETURNING *",
            [titulo, descricao || null, localizacao || null, data_evento, imagem_url || null, eventId, userId]
        );

        if (result.length === 0) {
            return res.status(403).json({ message: 'Acesso negado: Evento não encontrado ou não pertence a você.' });
        }

        return res.json({
            message: 'Evento atualizado com sucesso!',
            evento: result[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar evento do usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Excluir Evento Criado pelo Próprio Usuário (DELETE /eventos/meus/:id)
exports.deleteMyEvent = async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.id;

    if (!userId) {
        return res.status(401).json({ message: 'Autenticação necessária.' });
    }

    try {
        // CRÍTICO: Deleta o evento SOMENTE se o id_evento e o sugerido_por_id baterem
        const result = await db.query(
            "DELETE FROM evento WHERE id_evento = $1 AND sugerido_por_id = $2 RETURNING id_evento",
            [eventId, userId]
        );

        if (result.length === 0) {
            return res.status(403).json({ message: 'Acesso negado: O evento não existe ou não pertence a você.' });
        }

        return res.status(200).json({ message: 'Evento excluído com sucesso.' });

    } catch (error) {
        console.error('Erro ao excluir evento do usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao excluir evento.' });
    }
};

// Listar eventos criados pelo usuário logado (GET /eventos/meus)
exports.listMyEvents = async (req, res) => {
    const userId = req.user.userId; 

    if (!userId) {
        return res.status(401).json({ message: 'Autenticação necessária.' });
    }

    try {
        const events = await db.query(
            `SELECT 
                id_evento, 
                titulo, 
                data_evento, 
                status_aprovacao, 
                data_cadastro 
            FROM evento
            WHERE sugerido_por_id = $1
            ORDER BY data_cadastro DESC`,
            [userId]
        );
        return res.json(events);
    } catch (error) {
        console.error('Erro ao buscar meus eventos criados:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao listar eventos criados.' });
    }
};

// Inscrever usuário em evento
exports.registerUserToEvent = async (req, res) => {
    const userId = req.user.userId;
    const eventId = req.params.id;

    if (!userId) {
        return res.status(401).json({ message: 'Autenticação necessária.' });
    }

    try {
        // Tenta inserir a inscrição
        await db.query('INSERT INTO inscricao_evento (id_usuario, id_evento) VALUES ($1, $2)', [userId, eventId]);
        return res.status(201).json({ message: 'Inscrição realizada com sucesso!' });
    } catch (error) {
        // 🚨 Trata a exceção de Chave Única (Duplicidade)
        if (error.code === '23505') { 
            return res.status(400).json({ message: 'Você já está inscrito neste evento.' });
        }
        console.error('Erro ao registrar inscrição:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao inscrever.' });
    }
};

// Listar inscrições do usuário logado
exports.myRegistrations = async (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Autenticação necessária.' });
    }

    try {
        const registrations = await db.query(
            `SELECT 
                ie.data_inscricao, 
                e.titulo, 
                e.data_evento 
            FROM inscricao_evento ie 
            JOIN evento e ON ie.id_evento = e.id_evento 
            WHERE ie.id_usuario = $1
            ORDER BY ie.data_inscricao DESC`,
            [userId]
        );
        return res.json(registrations);
    } catch (error) {
        console.error('Erro ao buscar minhas inscrições:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar inscrições.' });
    }
};