'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.removeIndex('Customers', 'wechatIndex')
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.addIndex('Customers', ['wechat_id'], {
      indexName: 'wechatIndex',
      indicesType: 'UNIQUE'
    });
  }
};
