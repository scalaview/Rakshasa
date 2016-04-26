'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('ExtractOrders', 'exchanger', 'exchangerType');
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('ExtractOrders', 'exchangerType', 'exchanger');
  }
};
