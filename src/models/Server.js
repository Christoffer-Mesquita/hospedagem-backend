const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Server = sequelize.define('Server', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('minecraft', 'discord_bot', 'vps', 'gameserver'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'suspended', 'installing'),
    defaultValue: 'installing'
  },
  porta: {
    type: DataTypes.INTEGER,
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
  ip: {
    type: DataTypes.STRING
  },
  node_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  configuracoes: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Server; 