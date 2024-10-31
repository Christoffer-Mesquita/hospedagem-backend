const { body } = require('express-validator');

const serverValidation = [
  body('nome').notEmpty().trim().withMessage('Nome é obrigatório'),
  body('tipo').isIn(['minecraft', 'discord_bot', 'vps', 'gameserver']).withMessage('Tipo inválido'),
  body('memoria').isInt({ min: 512 }).withMessage('Memória mínima de 512MB'),
  body('cpu').isInt({ min: 1, max: 100 }).withMessage('CPU deve estar entre 1% e 100%'),
  body('disco').isInt({ min: 1 }).withMessage('Disco mínimo de 1GB'),
  body('plan_id').isInt().withMessage('Plano inválido')
];

module.exports = { serverValidation }; 