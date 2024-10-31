const router = require('express').Router();
const NodeController = require('../controllers/NodeController');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const { nodeValidation } = require('../validators/node.validator');
const validate = require('../middlewares/validator.middleware');

router.use(auth); // Requer autenticação
router.use(admin); // Requer privilégios de admin

router.get('/', NodeController.listNodes);
router.post('/', nodeValidation, validate, NodeController.createNode);
router.get('/:id', NodeController.getNode);
router.put('/:id', nodeValidation, validate, NodeController.updateNode);
router.delete('/:id', NodeController.deleteNode);

module.exports = router; 