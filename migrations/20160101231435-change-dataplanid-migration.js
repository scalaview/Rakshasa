'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('AffiliateConfigs', 'dataPlanId', 'trafficPlanId')
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('AffiliateConfigs', 'trafficPlanId', 'dataPlanId')
  }
};
