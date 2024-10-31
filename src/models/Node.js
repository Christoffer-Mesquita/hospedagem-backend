const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Node = sequelize.define('Node', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false
  },
  localizacao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'maintenance'),
    defaultValue: 'online'
  },
  memoria_total: {
    type: DataTypes.INTEGER, // Em MB
    allowNull: false
  },
  memoria_usada: {
    type: DataTypes.INTEGER, // Em MB
    defaultValue: 0
  },
  cpu_total: {
    type: DataTypes.INTEGER, // Em %
    allowNull: false
  },
  cpu_usado: {
    type: DataTypes.INTEGER, // Em %
    defaultValue: 0
  },
  disco_total: {
    type: DataTypes.INTEGER, // Em GB
    allowNull: false
  },
  disco_usado: {
    type: DataTypes.INTEGER, // Em GB
    defaultValue: 0
  }
});

module.exports = Node; 