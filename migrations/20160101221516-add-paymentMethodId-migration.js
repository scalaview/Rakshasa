'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'ExtractOrders',
      'total',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        default: 0.0
      }
    );
    return queryInterface.addColumn(
      'ExtractOrders',
      'paymentMethodId',
      {
        type: Sequelize.INTEGER
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn( "ExtractOrders", "total")
    return queryInterface.removeColumn( "ExtractOrders", "paymentMethodId")
  }
};
