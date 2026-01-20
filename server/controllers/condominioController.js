const Condominio = require('../models/Condominio'); // <--- CONFIRMA ESTA LINHA
const User = require('../models/User'); // Importante para validações

// Função auxiliar
const gerarCodigo = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// 1. CRIAR
exports.criar = async (req, res) => {
    try {
        console.log("Tentando criar condomínio. User:", req.user); // DEBUG

        const { nome, morada } = req.body;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Utilizador não autenticado no controlador" });
        }

        const novoCondo = new Condominio({
            nome,
            morada,
            codigoAcesso: gerarCodigo(),
            admin: req.user.id 
        });

        await novoCondo.save();
        res.status(201).json(novoCondo);
    } catch (error) {
        console.error("Erro CRÍTICO ao criar:", error); // Isto aparece no terminal
        res.status(500).json({ error: error.message });
    }
};

// 2. LISTAR (Onde te está a dar erro)
exports.meusCondominios = async (req, res) => {
    try {
        console.log("A pedir lista de condomínios. User ID:", req.user?.id); // DEBUG

        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Utilizador desconhecido" });
        }

        // Procura condomínios onde o campo 'admin' é igual ao ID do user logado
        const condominios = await Condominio.find({ admin: req.user.id });
        
        res.json(condominios);
    } catch (error) {
        console.error("Erro CRÍTICO ao listar:", error); // Isto aparece no terminal
        res.status(500).json({ error: error.message });
    }
};

// 3. APAGAR
exports.apagar = async (req, res) => {
    try {
        await Condominio.findByIdAndDelete(req.params.id);
        res.json({ msg: "Apagado" });
    } catch (error) {
        res.status(500).json(error);
    }
};