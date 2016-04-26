'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'Customers',
      'salary',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        default: 0.0
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'Customers',
      'salary',
      {
        type: Sequelize.FLOAT,
        allowNull: false,
        default: 0
      }
    )
  }
};
