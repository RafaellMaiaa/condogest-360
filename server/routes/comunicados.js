const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// ==========================================
// 📬 COMUNICADOS (MENSAGENS E AVISOS)
// ==========================================
router.post('/', async (req, res) => {
  try {
    let { condominio, fracao, assunto, conteudo } = req.body;
    if (fracao === 'geral') fracao = null; // Mensagem para todos

    const nova = new Message({ condominio, fracao, assunto, conteudo });
    await nova.save();
    res.status(201).json(nova);
  } catch (erro) { res.status(400).json({ erro: erro.message }); }
});

// Adicionar mais rotas conforme necessário, como GET para listar comunicados

module.exports = router;