const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Ticket = require('../models/Ticket');

const router = express.Router();

// 1. Criar pasta 'uploads' se não existir
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Configurar onde guardar os ficheiros
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Nome único: data + nome original
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// ==========================================
// 🛠️ TICKETS (CHAT E ESTADOS)
// ==========================================
router.post('/', upload.array('fotos', 5), async (req, res) => {
  try {
    const caminhos = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const dados = { ...req.body, fotos: caminhos };
    const novo = new Ticket(dados);
    const salvo = await novo.save();
    res.status(201).json(salvo);
  } catch (e) { res.status(400).json({ erro: e.message }); }
});

router.get('/:condominioId', async (req, res) => {
  try { const lista = await Ticket.find({ condominio: req.params.condominioId }).sort({ dataCriacao: -1 }); res.json(lista); } 
  catch (e) { res.status(500).json({ erro: e.message }); }
});

// Atualizar Estado (Aberto -> Concluído)
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const atualizado = await Ticket.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    res.json(atualizado);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// Adicionar Comentário (Com verificação de bloqueio)
router.post('/:id/comentarios', async (req, res) => {
  try {
    const { texto, autor } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) return res.status(404).json({ erro: "Ticket não encontrado" });

    // 🔒 SEGURANÇA: Se estiver concluído, bloqueia
    if (ticket.estado === 'Concluído') {
      return res.status(403).json({ erro: "Este ticket está fechado. Não é possível comentar." });
    }

    ticket.comentarios.push({ texto, autor });
    await ticket.save();
    
    res.json(ticket);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

module.exports = router;