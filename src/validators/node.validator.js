const { body } = require('express-validator');

const nodeValidation = [
  body('nome').notEmpty().trim().withMessage('Nome é obrigatório'),
  body('ip').isIP().withMessage('IP inválido'),
  body('localizacao').notEmpty().withMessage('Localização é obrigatória'),
  body('memoria_total').isInt({ min: 1024 }).withMessage('Memória mínima de 1GB'),
  body('cpu_total').isInt({ min: 1 }).withMessage('CPU total inválida'),
  body('disco_total').isInt({ min: 1 }).withMessage('Disco total inválido')
];

module.exports = { nodeValidation }; 