'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('TrafficPlans', 'price', 'purchasePrice')
  },

  down: function (queryInterface, Sequelize) {
  }
};
