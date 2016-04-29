'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'TrafficPlans',
      'integral',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
  }
};
