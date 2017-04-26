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
    queryInterface.addColumn(
      'TrafficPlans',
      'detail',
      {
        type: Sequelize.TEXT,
        allowNull: true
      }
    );
    return queryInterface.addColumn(
      'TrafficPlans',
      'tips',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
  },

  down: function (queryInterface, Sequelize) {
  }
};
