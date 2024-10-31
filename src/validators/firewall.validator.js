const { body } = require('express-validator');

const firewallRuleValidation = [
  body('rules').isArray().withMessage('Rules deve ser um array'),
  body('rules.*.type').isIn(['inbound', 'outbound']).withMessage('Tipo inválido'),
  body('rules.*.protocol').isIn(['tcp', 'udp', 'icmp', 'all']).withMessage('Protocolo inválido'),
  body('rules.*.port').optional().matches(/^\d+(-\d+)?$/).withMessage('Formato de porta inválido'),
  body('rules.*.source').notEmpty().withMessage('Source é obrigatório'),
  body('rules.*.action').isIn(['allow', 'deny']).withMessage('Action inválida')
];

module.exports = { firewallRuleValidation }; 