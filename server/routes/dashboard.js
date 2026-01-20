const express = require('express');
const Fracao = require('../models/Fracao');
const Movimento = require('../models/Movimento');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');

const router = express.Router();

// ==========================================
// 🏠 DADOS DASHBOARD INQUILINO
// ==========================================
router.get('/inquilino/dados/:fracaoId', async (req, res) => {
  try {
    const fracaoId = req.params.fracaoId;
    
    // 1. Fração
    const fracao = await Fracao.findById(fracaoId).populate('condominio');
    if (!fracao) return res.status(404).json({erro: 'Fração não encontrada'});

    // 2. Pagamentos
    const pagamentos = await Movimento.find({ fracao: fracaoId, tipo: 'Pagamento' }).sort({data: -1});
    
    // 3. Tickets
    const tickets = await Ticket.find({ condominio: fracao.condominio._id }).sort({dataCriacao: -1});

    // 4. Mensagens
    const mensagens = await Message.find({
      condominio: fracao.condominio._id,
      $or: [ { fracao: fracaoId }, { fracao: null } ]
    }).sort({ data: -1 });

    res.json({ fracao, condominio: fracao.condominio, pagamentos, tickets, mensagens });
  } catch (erro) { res.status(500).json({ erro: erro.message }); }
});

module.exports = router;