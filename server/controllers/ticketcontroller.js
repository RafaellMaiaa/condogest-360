const Ticket = require('../models/Ticket');
const User = require('../models/User');

// 1. CRIAR TICKET (Com Upload de Fotos)
exports.criarTicket = async (req, res) => {
    try {
        const { titulo, descricao, autorId, condominioId } = req.body;
        
        let caminhosFotos = [];
        if (req.files && req.files.length > 0) {
            caminhosFotos = req.files.map(file => '/uploads/' + file.filename);
        }

        const novoTicket = new Ticket({
            titulo,
            descricao,
            fotos: caminhosFotos,
            autor: autorId,
            condominio: condominioId
        });

        await novoTicket.save();
        res.status(201).json(novoTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao criar ticket" });
    }
};

// 2. LISTAR TICKETS (Ativos)
exports.listarPorCondominio = async (req, res) => {
    try {
        const tickets = await Ticket.find({ 
            condominio: req.params.condominioId,
            deletedAt: null 
        }).populate('autor', 'nome').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json(error);
    }
};

// 3. ARQUIVAR (Soft Delete)
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

// 4. LISTAR ARQUIVADOS
exports.listarArquivados = async (req, res) => {
    try {
        const tickets = await Ticket.find({ 
            condominio: req.params.condominioId,
            deletedAt: { $ne: null } 
        }).sort({ deletedAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json(error);
    }
};