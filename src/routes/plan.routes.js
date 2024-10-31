const router = require('express').Router();
const PlanController = require('../controllers/PlanController');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const { planValidation } = require('../validators/plan.validator');
const validate = require('../middlewares/validator.middleware');

// Rotas públicas
router.get('/', PlanController.listPlans); // Listar planos disponíveis

// Rotas que requerem autenticação
router.post('/:id/subscribe', auth, PlanController.subscribeToPlan); // Assinar plano

// Rotas que requerem admin
router.use(auth, admin); // Middleware de admin para todas as rotas abaixo
router.post('/', planValidation, validate, PlanController.createPlan); // Criar plano
router.put('/:id', planValidation, validate, PlanController.updatePlan); // Atualizar plano
router.delete('/:id', PlanController.deletePlan); // Deletar plano
router.get('/admin/stats', PlanController.getPlanStats); // Estatísticas dos planos

module.exports = router; 