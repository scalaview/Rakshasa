'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'TrafficPlans',
      'integral',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    );
    queryInterface.addColumn(
      'TrafficPlans',
      'firstRewards',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
    queryInterface.addColumn(
      'TrafficPlans',
      'secondRewards',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
    return queryInterface.addColumn(
      'TrafficPlans',
      'thirdRewards',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
  }
};
