'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'TrafficPlans',
      'productType',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
    return queryInterface.addColumn(
      'ExtractOrders',
      'productType',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('TrafficPlans', 'productType');
    return queryInterface.removeColumn('ExtractOrders', 'productType');
  }
};
