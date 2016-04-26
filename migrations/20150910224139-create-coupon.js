'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Coupons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      dataPlanId: {
        type: Sequelize.INTEGER
      },
      discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0.00
      },
      extend: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ignoreLevel: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      expiredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    return queryInterface.dropTable('Coupons');
  }
};