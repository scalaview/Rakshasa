'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Customers',
      'ancestry',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
    return queryInterface.addColumn(
      'Customers',
      'ancestryDepth',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn( "Customers", "ancestry")
    return queryInterface.removeColumn( "Customers", "ancestryDepth")
  }
};
