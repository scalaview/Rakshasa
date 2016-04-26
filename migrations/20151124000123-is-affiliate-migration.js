'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.removeColumn( "Customers", "secondAffiliateId")
    queryInterface.removeColumn( "Customers", "thirdAffiliateId")
    queryInterface.removeColumn( "Customers", "affiliateId")
    return queryInterface.addColumn(
      'Customers',
      'isAffiliate',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn( "Customers", "isAffiliate")
  }
};
