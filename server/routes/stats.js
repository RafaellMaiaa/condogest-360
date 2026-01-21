const router = require('express').Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');
router.get('/:condominioId', auth, statsController.getDashboardStats);
module.exports = router;