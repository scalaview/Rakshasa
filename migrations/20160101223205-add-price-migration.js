'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'TrafficPlans',
      'price',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        default: 0.0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn( "TrafficPlans", "price")
  }
};
