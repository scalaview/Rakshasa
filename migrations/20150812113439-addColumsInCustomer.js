'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('Customers', 'expenditure',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
    queryInterface.addColumn('Customers', 'income',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Customers', 'expenditure')
    queryInterface.removeColumn('Customers', 'income')
  }
};
