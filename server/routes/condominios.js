const express = require('express');
const router = express.Router();
const condController = require('../controllers/condominioController');
const auth = require('../middleware/auth');

router.post('/', auth, condController.criar);
router.get('/', auth, condController.meusCondominios);
router.delete('/:id', auth, condController.apagar);

module.exports = router;