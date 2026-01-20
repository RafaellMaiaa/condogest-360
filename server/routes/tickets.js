const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketcontroller');
const upload = require('../middleware/upload');

router.post('/', upload.array('fotos', 5), ticketController.criarTicket);
router.get('/condominio/:condominioId', ticketController.listarPorCondominio);
router.get('/arquivados/:condominioId', ticketController.listarArquivados);
// ROTA QUE FALTAVA PARA EDITAR:
router.put('/:id', ticketController.atualizarTicket); 
router.put('/arquivar/:id', ticketController.arquivar);

module.exports = router;