const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define('Property', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('casa', 'apartamento', 'chale', 'pousada'),
    allowNull: false
  },
  endereco: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preco_noite: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  capacidade: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quartos: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  banheiros: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comodidades: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('disponivel', 'ocupado', 'manutencao'),
    defaultValue: 'disponivel'
  }
});

module.exports = Property; 