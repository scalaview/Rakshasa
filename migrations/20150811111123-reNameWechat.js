'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('Customers', 'wechat_id', 'wechat');
    queryInterface.addColumn('Customers', 'lastLoginAt',
      {
        type: Sequelize.DATE,
        allowNull: true,
      });
    queryInterface.addColumn('Customers', 'remainingTraffic',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('Customers', 'wechat', 'wechat_id');
    queryInterface.removeColumn('Customers', 'remainingTraffic');
    queryInterface.removeColumn('Customers', 'lastLoginAt');
  }
};
