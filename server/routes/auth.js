const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/registar', authController.registar);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.get('/vizinhos/:condominioId', auth, authController.getVizinhos);

module.exports = router;