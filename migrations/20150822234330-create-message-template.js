'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('MessageTemplates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function(){
      queryInterface.sequelize.query("insert into MessageTemplates (name, content, createdAt, updatedAt) values ('register message', '【{{company}}】欢迎使用易流量，您的手机验证码是{{code}}。本条信息无需回复', CURTIME(), CURTIME())");
    })
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('MessageTemplates');
  }
};