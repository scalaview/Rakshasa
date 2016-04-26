'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("insert into DConfigs (name, value, createdAt, updatedAt) values ('vipLimit', 1, CURTIME(), CURTIME())");
  },

  down: function (queryInterface, Sequelize) {
  }
};
