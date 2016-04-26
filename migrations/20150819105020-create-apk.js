'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Apks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      downloadTime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      version: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sellerId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      reward: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      sortNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      apk: {
        type: Sequelize.STRING,
        allowNull: true
      },
      apkPath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      apkSize: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true
      },
      image01: {
        type: Sequelize.STRING,
        allowNull: true
      },
      image02: {
        type: Sequelize.STRING,
        allowNull: true
      },
      image03: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      digest: {
        type: Sequelize.STRING,
        allowNull: true
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
    return queryInterface.dropTable('Apks');
  }
};