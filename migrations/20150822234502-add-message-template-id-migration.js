'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'MessageQueues',
      'templateId',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn( "MessageQueues", "templateId")
  }
};
