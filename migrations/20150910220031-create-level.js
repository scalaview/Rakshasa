'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    queryInterface.createTable('Levels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0.00
      },
      extend: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    queryInterface.sequelize.query("insert into Levels (name, discount, extend, createdAt, updatedAt) values ('普通用户', 0.00, 0, CURTIME(), CURTIME())");
    return queryInterface.sequelize.query("insert into Levels (name, discount, extend, createdAt, updatedAt) values ('VIP用户', 0.20, 0, CURTIME(), CURTIME())");
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Levels');
  }
};