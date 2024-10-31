const router = require('express').Router();
const ServerController = require('../controllers/ServerController');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { serverValidation } = require('../validators/server.validator');
const AutomationService = require('../services/AutomationService');
const Trigger = require('../models/Trigger');

router.use(auth); // Todas as rotas precisam de autenticação

router.post('/', serverValidation, validate, ServerController.createServer);
router.get('/', ServerController.listServers);
router.get('/:id', ServerController.getServer);
router.post('/:id/power', ServerController.powerAction);
router.delete('/:id', ServerController.deleteServer);
router.post('/:id/backup', auth, ServerController.createBackup);
router.get('/:id/backups', auth, ServerController.listBackups);
router.post('/:id/backup/restore', auth, ServerController.restoreBackup);

// Criar trigger
router.post('/:id/triggers', auth, async (req, res) => {
  const trigger = await AutomationService.createTrigger(req.params.id, req.body);
  res.status(201).json(trigger);
});

// Listar triggers
router.get('/:id/triggers', auth, async (req, res) => {
  const triggers = await Trigger.findAll({
    where: { serverId: req.params.id }
  });
  res.json(triggers);
});

// Ativar/Desativar trigger
router.patch('/:id/triggers/:triggerId', auth, async (req, res) => {
  const trigger = await Trigger.findByPk(req.params.triggerId);
  await trigger.update({ status: req.body.status });
  res.json(trigger);
});

module.exports = router; 