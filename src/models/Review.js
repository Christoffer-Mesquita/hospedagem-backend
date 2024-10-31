const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Review; 