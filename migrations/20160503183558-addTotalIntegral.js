'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'ExtractOrders',
      'totalIntegral',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    );
    return queryInterface.addColumn(
      'ExtractOrders',
      'exchangeIntegral',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('ExtractOrder', 'totalIntegral');
    return queryInterface.removeColumn('ExtractOrder', 'exchangeIntegral');
  }
};
