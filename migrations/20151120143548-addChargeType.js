'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'ExtractOrders',
      'chargeType',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'balance'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn( "ExtractOrders", "chargeType")
  }
};
