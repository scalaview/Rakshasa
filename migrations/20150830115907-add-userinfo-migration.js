'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Customers',
      'sex',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    queryInterface.addColumn(
      'Customers',
      'city',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    queryInterface.addColumn(
      'Customers',
      'province',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    return queryInterface.addColumn(
      'Customers',
      'country',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn( "Customers", "sex")
    queryInterface.removeColumn( "Customers", "city")
    queryInterface.removeColumn( "Customers", "province")
    return queryInterface.removeColumn( "Customers", "country")

  }
};
