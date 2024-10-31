const { body } = require('express-validator');

const planValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim(),
  
  body('tipo')
    .isIn(['minecraft', 'discord_bot', 'vps', 'gameserver'])
    .withMessage('Tipo de plano inválido'),
  
  body('memoria')
    .isInt({ min: 512 })
    .withMessage('Memória mínima de 512MB'),
  
  body('cpu')
    .isInt({ min: 1, max: 400 })
    .withMessage('CPU deve estar entre 1% e 400%'),
  
  body('disco')
    .isInt({ min: 1 })
    .withMessage('Disco mínimo de 1GB'),
  
  body('preco')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser maior que zero'),
  
  body('periodo')
    .isIn(['mensal', 'trimestral', 'semestral', 'anual'])
    .withMessage('Período inválido'),
  
  body('recursos_adicionais')
    .optional()
    .isObject()
    .withMessage('Recursos adicionais deve ser um objeto'),
  
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição muito longa')
];

module.exports = { planValidation }; 