'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'FlowTasks',
      'actionUrl',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('FlowTasks', 'actionUrl')
  }
};
