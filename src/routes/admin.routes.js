const router = require('express').Router();
const AdminController = require('../controllers/AdminController');
const auth = require('../middlewares/auth.middleware');

// Rota para promoção de usuário a admin (requer chave secreta)
router.post('/promote/:userId', AdminController.promoteToAdmin);

// Rotas que requerem autenticação E privilégios de admin
router.use(auth);
router.use(require('../middlewares/admin.middleware'));

// Listar todos os usuários (apenas admin)
router.get('/users', AdminController.listUsers);

// Remover privilégios de admin
router.post('/demote/:userId', AdminController.demoteFromAdmin);

module.exports = router; 