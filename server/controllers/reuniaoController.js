const Reuniao = require('../models/Reuniao');

// 1. CRIAR REUNIÃO (Admin)
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

// 2. LISTAR REUNIÕES (Do meu prédio)
exports.listar = async (req, res) => {
    try {
        const { condominioId } = req.params;
        // Trazemos também os nomes de quem confirmou para mostrar na lista
        const reunioes = await Reuniao.find({ condominio: condominioId })
            .populate('confirmados', 'nome fracao') // Traz nome e fração
            .sort({ data: 1 }); // Ordena por data (mais próxima primeiro)

        res.json(reunioes);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar reuniões" });
    }
};

// 3. RESPONDER RSVP (Vou / Não Vou)
exports.responder = async (req, res) => {
    try {
        const { id } = req.params;
        const { resposta } = req.body; // 'vou' ou 'nao'
        const userId = req.user.id;

        const reuniao = await Reuniao.findById(id);
        if (!reuniao) return res.status(404).json({ msg: "Reunião não encontrada" });

        // Remove de ambas as listas primeiro (para limpar duplicados ou trocas)
        reuniao.confirmados.pull(userId);
        reuniao.recusados.pull(userId);

        // Adiciona à lista correta
        if (resposta === 'vou') {
            reuniao.confirmados.push(userId);
        } else if (resposta === 'nao') {
            reuniao.recusados.push(userId);
        }

        await reuniao.save();
        
        // Devolve a reunião atualizada com os nomes populados
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