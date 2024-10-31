const router = require('express').Router();
const ServerController = require('../controllers/ServerController');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { serverValidation } = require('../validators/server.validator');

router.use(auth); // Todas as rotas precisam de autenticação

router.post('/', serverValidation, validate, ServerController.createServer);
router.get('/', ServerController.listServers);
router.get('/:id', ServerController.getServer);
router.post('/:id/power', ServerController.powerAction);
router.delete('/:id', ServerController.deleteServer);
router.post('/:id/backup', auth, ServerController.createBackup);
router.get('/:id/backups', auth, ServerController.listBackups);
router.post('/:id/backup/restore', auth, ServerController.restoreBackup);

module.exports = router; 