const express = require('express');
const router = express.Router();
const reuniaoController = require('../controllers/reuniaoController');
const auth = require('../middleware/auth');

router.post('/', auth, reuniaoController.criar);
router.get('/:condominioId', auth, reuniaoController.listar);
router.put('/:id/rsvp', auth, reuniaoController.responder);
router.delete('/:id', auth, reuniaoController.apagar);

module.exports = router;