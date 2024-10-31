const router = require('express').Router();
const ServerController = require('../controllers/ServerController');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { serverValidation } = require('../validators/server.validator');
const AutomationService = require('../services/AutomationService');
const Trigger = require('../models/Trigger');
const NotificationService = require('../services/NotificationService');
const LogAnalyticsService = require('../services/LogAnalyticsService');
const FirewallService = require('../services/FirewallService');
const SmartBackupService = require('../services/SmartBackupService');
const RecommendationService = require('../services/RecommendationService');
const FirewallRule = require('../models/FirewallRule');

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

// Rotas de Notificações
router.get('/:id/notifications', auth, async (req, res) => {
  const notifications = await NotificationService.getUnread(req.user.id);
  res.json(notifications);
});

// Rotas de Logs
router.get('/:id/logs/analysis', auth, async (req, res) => {
  const analysis = await LogAnalyticsService.analyzeServerLogs(req.params.id);
  res.json(analysis);
});

// Rotas de Firewall
router.post('/:id/firewall/rules', auth, async (req, res) => {
  await FirewallService.updateRules(req.params.id, req.body.rules);
  res.json({ message: 'Regras atualizadas com sucesso' });
});

router.get('/:id/firewall/rules', auth, async (req, res) => {
  const rules = await FirewallRule.findAll({
    where: { serverId: req.params.id }
  });
  res.json(rules);
});

// Rotas de Backup Inteligente
router.post('/:id/smart-backup', auth, async (req, res) => {
  const backup = await SmartBackupService.scheduleBackup(req.params.id);
  res.json(backup);
});

// Rotas de Recomendações
router.get('/:id/recommendations', auth, async (req, res) => {
  const recommendations = await RecommendationService.analyzeServer(req.params.id);
  res.json(recommendations);
});

module.exports = router; 