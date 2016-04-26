'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addIndex('AffiliateConfigs', ['level']);
    return queryInterface.addIndex('AffiliateConfigs', ['trafficPlanId']);
  },

  down: function (queryInterface, Sequelize) {
  }
};
