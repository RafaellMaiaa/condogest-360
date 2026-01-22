const express = require('express');
const router = express.Router();
const docController = require('../controllers/documentoController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // Já tens isto criado!

router.post('/', [auth, upload.single('ficheiro')], docController.uploadDoc);
router.get('/:condominioId', auth, docController.listar);
router.delete('/:id', auth, docController.apagar);

module.exports = router;