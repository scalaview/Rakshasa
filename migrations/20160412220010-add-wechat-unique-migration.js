'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addIndex('Customers', ['wechat'], {
      indexName: 'wechatIndex',
      indicesType: 'UNIQUE'
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeIndex('Customers', 'wechatIndex');
  }
};
