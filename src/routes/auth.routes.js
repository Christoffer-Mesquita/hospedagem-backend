const router = require('express').Router();
const AuthController = require('../controllers/AuthController');
const { registroValidation, loginValidation } = require('../validators/auth.validator');
const validate = require('../middlewares/validator.middleware');

// Rota de Login
router.post('/login', loginValidation, validate, AuthController.login);

// Rota de Registro
router.post('/registro', registroValidation, validate, AuthController.registro);

module.exports = router; 