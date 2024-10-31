const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'reset_token', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'reset_token_expires', {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'reset_token');
    await queryInterface.removeColumn('Users', 'reset_token_expires');
  }
}; 