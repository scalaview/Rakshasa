'use strict';
module.exports = function(sequelize, DataTypes) {
  var Country = sequelize.define('Country', {
      name: {
        type: DataTypes.STRING
      },
      code: {
        type: DataTypes.STRING
      }
  }, {
    tableName: 'douban_countries',
    classMethods: {
      associate: function(models) {
        models.Country.belongsToMany(models.Movie, {
          through: 'douban_movies_countries',
          foreignKey: { name: "country_id", fieldName: "country_id" }
        })
      }
    }
  });
  return Country;
};