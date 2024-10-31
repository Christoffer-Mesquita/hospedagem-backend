const router = require('express').Router();
const AuthController = require('../controllers/AuthController');
const { registroValidation, loginValidation } = require('../validators/auth.validator');
const validate = require('../middlewares/validator.middleware');

router.post('/registro', registroValidation, validate, AuthController.registro);
router.post('/login', loginValidation, validate, AuthController.login);

module.exports = router; 