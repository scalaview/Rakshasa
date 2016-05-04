'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'DataPlans',
      'value',
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0
      }
    );
  },

  down: function (queryInterface, Sequelize) {
  }
};
