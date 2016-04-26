'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('WechatMenus', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      event: {
        type: Sequelize.STRING
      },
      key: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      sortNum: {
        type: Sequelize.INTEGER
      },
      ancestryDepth: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ancestry: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('WechatMemnus');
  }
};