const express = require('express');
const Condominio = require('../models/Condominio');
const Fracao = require('../models/Fracao');
const Movimento = require('../models/Movimento');

const router = express.Router();

// ==========================================
// 🏢 ADMINISTRAÇÃO GERAL (CRUDs Básicos)
// ==========================================
router.post('/condominios', async (req, res) => { try{const n=new Condominio(req.body); await n.save(); res.status(201).json(n);}catch(e){res.status(400).json(e);} });
router.get('/condominios', async (req, res) => { try{const l=await Condominio.find().sort({dataCriacao:-1}); res.json(l);}catch(e){res.status(500).json(e);} });
router.put('/condominios/:id', async (req, res) => { try{const a=await Condominio.findByIdAndUpdate(req.params.id, req.body, {new:true}); res.json(a);}catch(e){res.status(500).json(e);} });

router.post('/fracoes', async (req, res) => { try{const n=new Fracao(req.body); await n.save(); res.status(201).json(n);}catch(e){res.status(400).json(e);} });
router.get('/fracoes/:condominioId', async (req, res) => { 
  try {
    const lista = await Fracao.find({ condominio: req.params.condominioId });
    const listaFinal = await Promise.all(lista.map(async f => {
      const moves = await Movimento.find({ fracao: f._id });
      const total = moves.filter(m=>m.tipo==='Pagamento').reduce((acc,m)=>acc+m.valor,0);
      return {...f.toObject(), totalPago: total};
    }));
    res.json(listaFinal);
  } catch(e){res.status(500).json(e);} 
});

router.post('/movimentos', async (req, res) => {
  try {
    let dados = req.body;
    if (dados.tipo === 'Pagamento') {
      const count = await Movimento.countDocuments({ tipo: 'Pagamento' });
      dados.numeroRecibo = count + 1;
    }
    const novo = new Movimento(dados);
    const salvo = await novo.save();
    await salvo.populate('fracao');
    res.status(201).json(salvo);
  } catch(e){res.status(400).json(e);}
});

router.get('/movimentos/historico/:condominioId', async (req, res) => {
  try {
    const fracoes = await Fracao.find({ condominio: req.params.condominioId }).select('_id');
    const ids = fracoes.map(f => f._id);
    const hist = await Movimento.find({ fracao: { $in: ids }, tipo: 'Pagamento' }).populate('fracao').sort({ numeroRecibo: -1 });
    res.json(hist);
  } catch(e){res.status(500).json(e);}
});

module.exports = router;