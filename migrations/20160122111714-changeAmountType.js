'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'FlowHistories',
      'amount',
      {
        type: Sequelize.DECIMAL(10, 2),
        default: 0.00
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'FlowHistories',
      'amount',
      {
        type: Sequelize.INTEGER,
        default: 0
      }
    );
  }
};
