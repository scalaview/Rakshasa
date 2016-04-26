'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'ExtractOrders',
      'cost',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        default: 0.0
      }
    );
    return queryInterface.addColumn(
      'ExtractOrders',
      'transactionId',
      {
        type: Sequelize.STRING
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn( "ExtractOrders", "transactionId")
  }
};
