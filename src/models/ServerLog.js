const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServerLog = sequelize.define('ServerLog', {
  serverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('error', 'warning', 'info', 'security', 'performance'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  severity: {
    type: DataTypes.INTEGER, // 1-5
    defaultValue: 1
  }
});

module.exports = ServerLog; 