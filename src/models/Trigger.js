const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trigger = sequelize.define('Trigger', {
  serverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  conditions: {
    type: DataTypes.JSON,
    allowNull: false
  },
  actions: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'executing'),
    defaultValue: 'active'
  },
  lastTriggered: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cooldown: {
    type: DataTypes.INTEGER, // em segundos
    defaultValue: 300 // 5 minutos
  }
});

module.exports = Trigger; 