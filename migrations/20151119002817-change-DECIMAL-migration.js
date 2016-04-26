'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'DataPlans',
      'price',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        default: 0.0
      }
    )
    queryInterface.changeColumn(
      'Orders',
      'discount',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        default: 0.0
      }
    )
    return queryInterface.changeColumn(
      'Orders',
      'total',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        default: 0.0
      }
    )
  },

  down: function (queryInterface, Sequelize) {
  }
};
