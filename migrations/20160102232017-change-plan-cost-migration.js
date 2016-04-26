'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'TrafficPlans',
      'cost',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        default: 0.0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return
  }
};
