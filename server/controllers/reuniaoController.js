const Reuniao = require('../models/Reuniao');

exports.criar = async (req, res) => {
    try {
        const { titulo, descricao, data, local, condominioId } = req.body;
        
        const novaReuniao = new Reuniao({
            titulo,
            descricao,
            data,
            local,
            condominio: condominioId,
            criador: req.user.id
        });

        await novaReuniao.save();
        res.status(201).json(novaReuniao);
    } catch (error) {
        res.status(500).json({ error: "Erro ao agendar reunião" });
    }
};

exports.listar = async (req, res) => {
    try {
        const { condominioId } = req.params;
        const reunioes = await Reuniao.find({ condominio: condominioId })
            .populate('confirmados', 'nome fracao') 
            .sort({ data: 1 });

        res.json(reunioes);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar reuniões" });
    }
};

exports.responder = async (req, res) => {
    try {
        const { id } = req.params;
        const { resposta } = req.body;
        const userId = req.user.id;

        const reuniao = await Reuniao.findById(id);
        if (!reuniao) return res.status(404).json({ msg: "Reunião não encontrada" });

        reuniao.confirmados.pull(userId);
        reuniao.recusados.pull(userId);

        if (resposta === 'vou') {
            reuniao.confirmados.push(userId);
        } else if (resposta === 'nao') {
            reuniao.recusados.push(userId);
        }

        await reuniao.save();
        
        const reuniaoAtualizada = await Reuniao.findById(id).populate('confirmados', 'nome fracao');
        res.json(reuniaoAtualizada);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao responder RSVP" });
    }
};

// 4. APAGAR (Admin)
exports.apagar = async (req, res) => {
    try {
        await Reuniao.findByIdAndDelete(req.params.id);
        res.json({ msg: "Reunião cancelada" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao apagar" });
    }
};