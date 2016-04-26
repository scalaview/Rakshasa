'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'FlowTasks',
      'trafficPlanId',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn( "FlowTasks", "trafficPlanId")
  }
};
