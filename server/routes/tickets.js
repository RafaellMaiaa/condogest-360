const express = require('express');
const router = express.Router();

// --- IMPORTANTE: Estas linhas têm de estar aqui ---
const ticketController = require('../controllers/ticketcontroller');
const upload = require('../middleware/upload');
// -------------------------------------------------

// Rota: Criar Ticket (com upload)
router.post('/', upload.array('fotos', 5), ticketController.criarTicket);

// Rota: Listar Tickets Ativos
router.get('/condominio/:condominioId', ticketController.listarPorCondominio);

// Rota: Listar Arquivados (Admin)
router.get('/arquivados/:condominioId', ticketController.listarArquivados);

// Rota: Arquivar Ticket
router.put('/arquivar/:id', ticketController.arquivar);

module.exports = router;