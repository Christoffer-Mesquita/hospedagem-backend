const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('minecraft', 'discord_bot', 'vps', 'gameserver'),
    allowNull: false
  },
  memoria: {
    type: DataTypes.INTEGER, // Em MB
    allowNull: false
  },
  cpu: {
    type: DataTypes.INTEGER, // Em %
    allowNull: false
  },
  disco: {
    type: DataTypes.INTEGER, // Em GB
    allowNull: false
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  periodo: {
    type: DataTypes.ENUM('mensal', 'trimestral', 'semestral', 'anual'),
    defaultValue: 'mensal'
  },
  recursos_adicionais: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Plan; 