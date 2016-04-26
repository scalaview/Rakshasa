'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Withdrawals',
      'phone',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
    queryInterface.addColumn(
      'Withdrawals',
      'comment',
      {
        type: Sequelize.TEXT,
        allowNull: true
      }
    );
    return queryInterface.addColumn(
      'Withdrawals',
      'remark',
      {
        type: Sequelize.TEXT,
        allowNull: true
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn( "Withdrawals", "phone")
    queryInterface.removeColumn( "Withdrawals", "comment")
    return queryInterface.removeColumn( "Withdrawals", "remark")
  }
};
