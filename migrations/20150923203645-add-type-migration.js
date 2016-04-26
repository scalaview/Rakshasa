'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'TrafficPlans',
      'type',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    );
    queryInterface.addColumn(
      'TrafficPlans',
      'bid',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
    queryInterface.addColumn(
      'ExtractOrders',
      'bid',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
    return queryInterface.addColumn(
      'ExtractOrders',
      'type',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn( "TrafficPlans", "type");
    queryInterface.removeColumn( "TrafficPlans", "bid");
    queryInterface.removeColumn( "ExtractOrders", "bid");
    return queryInterface.removeColumn( "ExtractOrders", "type");
  }
};
