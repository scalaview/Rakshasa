'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('PaymentMethods', {
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
      code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function (){
      queryInterface.sequelize.query("insert into PaymentMethods (name, code, createdAt, updatedAt) values ('微信支付', 'wechatpay', CURTIME(), CURTIME())");
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('PaymentMethods');
  }
};