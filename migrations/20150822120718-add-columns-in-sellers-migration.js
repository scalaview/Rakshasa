'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Sellers',
      'company',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    queryInterface.addColumn(
      'Sellers',
      'homepage',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    queryInterface.addColumn(
      'Sellers',
      'qq',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    return queryInterface.addColumn(
      'Sellers',
      'phone',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn( "Sellers", "company")
    queryInterface.removeColumn( "Sellers", "homepage")
    queryInterface.removeColumn( "Sellers", "qq")
    return queryInterface.removeColumn( "Sellers", "phone")
  }
};
