const router = require('express').Router();
const PlanController = require('../controllers/PlanController');
const auth = require('../middlewares/auth.middleware');

router.get('/', PlanController.listPlans); // Rota pública
router.post('/:id/subscribe', auth, PlanController.subscribeToPlan);

module.exports = router; 