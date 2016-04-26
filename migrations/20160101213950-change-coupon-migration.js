'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('Coupons', 'dataPlanId', 'trafficPlanId')
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('Coupons', 'trafficPlanId', 'dataPlanId')
  }
};
