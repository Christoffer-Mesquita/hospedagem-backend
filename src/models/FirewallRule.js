const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FirewallRule = sequelize.define('FirewallRule', {
  serverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('inbound', 'outbound'),
    allowNull: false
  },
  protocol: {
    type: DataTypes.ENUM('tcp', 'udp', 'icmp', 'all'),
    allowNull: false
  },
  port: {
    type: DataTypes.STRING, // Pode ser um número ou range (ex: "80" ou "80-443")
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('allow', 'deny'),
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = FirewallRule; 