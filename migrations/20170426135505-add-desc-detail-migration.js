'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'TrafficPlans',
      'desc',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
    return queryInterface.addColumn(
      'TrafficPlans',
      'detail',
      {
        type: Sequelize.TEXT,
        allowNull: true
      }
    );
  },

  down: function (queryInterface, Sequelize) {
  }
};
