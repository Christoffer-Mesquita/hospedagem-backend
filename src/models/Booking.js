const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  check_in: {
    type: DataTypes.DATE,
    allowNull: false
  },
  check_out: {
    type: DataTypes.DATE,
    allowNull: false
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmada', 'cancelada', 'concluida'),
    defaultValue: 'pendente'
  },
  numero_hospedes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observacoes: {
    type: DataTypes.TEXT
  },
  forma_pagamento: {
    type: DataTypes.STRING
  }
});

module.exports = Booking; 