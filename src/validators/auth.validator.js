const { body } = require('express-validator');

const registroValidation = [
  body('nome').notEmpty().trim().withMessage('Nome é obrigatório'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

module.exports = {
  registroValidation,
  loginValidation
}; 