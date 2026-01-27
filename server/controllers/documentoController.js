const Documento = require('../models/Documento');
const fs = require('fs');
const path = require('path');

exports.uploadDoc = async (req, res) => {
    try {
        const { titulo, condominioId } = req.body;
        
        if (!req.file) return res.status(400).json({ msg: "Nenhum ficheiro enviado" });

        const novoDoc = new Documento({
            titulo,
            caminho: '/uploads/' + req.file.filename,
            condominio: condominioId,
            criadoPor: req.user.id
        });

        await novoDoc.save();
        res.status(201).json(novoDoc);
    } catch (error) {
        res.status(500).json({ error: "Erro ao fazer upload" });
    }
};
exports.listar = async (req, res) => {
    try {
        const docs = await Documento.find({ condominio: req.params.condominioId })
            .sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.apagar = async (req, res) => {
    try {
        const doc = await Documento.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: "Documento não encontrado" });

        const caminhoFisico = path.join(__dirname, '..', doc.caminho);
        if (fs.existsSync(caminhoFisico)) {
            fs.unlinkSync(caminhoFisico);
        }

        await Documento.findByIdAndDelete(req.params.id);
        res.json({ msg: "Apagado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao apagar" });
    }
};