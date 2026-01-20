const express = require('express');
const router = express.Router();
const pagController = require('../controllers/pagamentoController');
const auth = require('../middleware/auth');

router.post('/', auth, pagController.criarPagamento);
router.get('/:condominioId', auth, pagController.listar);
router.put('/:id/pagar', auth, pagController.marcarPago);
router.get('/:id/pdf', auth, pagController.downloadRecibo); // Rota do PDF

module.exports = router;