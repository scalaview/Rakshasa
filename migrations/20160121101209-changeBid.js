'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'TrafficPlans',
      'bid',
      {
        type: Sequelize.STRING
      }
    );
    queryInterface.changeColumn(
      'ExtractOrders',
      'taskid',
      {
        type: Sequelize.STRING
      }
    );
    return queryInterface.changeColumn(
      'ExtractOrders',
      'bid',
      {
        type: Sequelize.STRING
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'TrafficPlans',
      'bid',
      {
        type: Sequelize.INTEGER
      }
    );
    queryInterface.changeColumn(
      'ExtractOrders',
      'taskid',
      {
        type: Sequelize.INTEGER
      }
    );
    return queryInterface.changeColumn(
      'ExtractOrders',
      'bid',
      {
        type: Sequelize.INTEGER
      }
    );
  }
};
