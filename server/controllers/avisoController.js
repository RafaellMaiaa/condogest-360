const Aviso = require('../models/Aviso');

exports.getAvisos = async (req, res) => {
    try {
        const avisos = await Aviso.find().sort({ createdAt: -1 });
        res.json(avisos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar avisos' });
    }
};

exports.criarAviso = async (req, res) => {
    try {
        const novoAviso = new Aviso(req.body);
        await novoAviso.save();
        res.json(novoAviso);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar aviso' });
    }
};
exports.responderRSVP = async (req, res) => {
    const { id } = req.params;
    const { userId, resposta } = req.body; 

    try {
        const aviso = await Aviso.findById(id);
        if (!aviso) return res.status(404).json({ msg: 'Aviso não encontrado' });

        aviso.vou = aviso.vou.filter(u => u !== userId);
        aviso.naoVou = aviso.naoVou.filter(u => u !== userId);

        if (resposta === 'vou') {
            aviso.vou.push(userId);
        } else if (resposta === 'nao') {
            aviso.naoVou.push(userId);
        }

        await aviso.save();
        res.json(aviso);
    } catch (error) {
        res.status(500).json({ error: 'Erro no RSVP' });
    }
};