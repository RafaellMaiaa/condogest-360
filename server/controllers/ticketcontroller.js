const Ticket = require('../models/Ticket');
const User = require('../models/User');

// 1. CRIAR TICKET
exports.criarTicket = async (req, res) => {
    try {
        const { titulo, descricao, prioridade, autorId, condominioId } = req.body;
        
        let caminhosFotos = [];
        if (req.files && req.files.length > 0) {
            caminhosFotos = req.files.map(file => '/uploads/' + file.filename);
        }

        const novoTicket = new Ticket({
            titulo,
            descricao,
            prioridade: prioridade || 'Média',
            fotos: caminhosFotos,
            autor: autorId,
            condominio: condominioId,
            status: 'Aberto'
        });

        await novoTicket.save();
        res.status(201).json(novoTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar ticket" });
    }
};

// 2. LISTAR TICKETS DO PRÉDIO
exports.listarPorCondominio = async (req, res) => {
    try {
        const { condominioId } = req.params;

        // Se o modelo User não estiver carregado, o populate falha aqui
        const tickets = await Ticket.find({ 
            condominio: condominioId,
            deletedAt: null 
        })
        .populate('autor', 'nome') 
        .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        // Isto vai imprimir o erro real no terminal preto do servidor
        console.error("Erro ao listar tickets:", error); 
        res.status(500).json({ error: error.message });
    }
};

// 3. ATUALIZAR TICKET (Para o Admin mudar Gravidade/Status)
exports.atualizarTicket = async (req, res) => {
    try {
        const { status, prioridade } = req.body;
        const dados = {};
        
        if(status) dados.status = status;
        if(prioridade) dados.prioridade = prioridade;

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            dados,
            { new: true } // Retorna o atualizado
        );
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar" });
    }
};

// 4. ARQUIVAR
exports.arquivar = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { deletedAt: new Date(), status: 'Arquivado' },
            { new: true }
        );
        res.json(ticket);
    } catch (error) {
        res.status(500).json(error);
    }
};

// 5. LISTAR ARQUIVADOS
exports.listarArquivados = async (req, res) => {
    try {
        const tickets = await Ticket.find({ 
            condominio: req.params.condominioId,
            deletedAt: { $ne: null } 
        }).populate('autor', 'nome').sort({ deletedAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json(error);
    }
};