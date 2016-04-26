'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Customers',
      'affiliateId',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
    queryInterface.addColumn(
      'Customers',
      'secondAffiliateId',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
    queryInterface.addColumn(
      'Customers',
      'thirdAffiliateId',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
    queryInterface.addColumn(
      'Customers',
      'isSubscribe',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    );
    queryInterface.addColumn(
      'Customers',
      'salary',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
    return queryInterface.addColumn(
      'Customers',
      'subscribeTime',
      {
        type: Sequelize.DATE,
        allowNull: true
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn( "Customers", "affiliateId");
    queryInterface.removeColumn( "Customers", "secondAffiliateId");
    queryInterface.removeColumn( "Customers", "thirdAffiliateId");
    queryInterface.removeColumn( "Customers", "isSubscribe");
    queryInterface.removeColumn( "Customers", "salary");
    return queryInterface.removeColumn( "Customers", "subscribeTime")
  }
};
