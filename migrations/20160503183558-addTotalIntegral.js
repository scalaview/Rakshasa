'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'ExtractOrders',
      'totalIntegral',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('ExtractOrder', 'totalIntegral');
  }
};
