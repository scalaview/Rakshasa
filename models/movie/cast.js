'use strict';
module.exports = function(sequelize, DataTypes) {
  var attributes = require(process.env.PWD + "/models/concerns/celebrity").attributes
  var Cast = sequelize.define('Cast', attributes(DataTypes)
    , {
    tableName: 'douban_celebrities',
    classMethods: {
      associate: function(models) {
        models.Cast.belongsToMany(models.Movie, {
          through: 'douban_movies_casts',
          foreignKey: { name: "cast_id", fieldName: "cast_id" }
        });
        models.Cast.hasMany(models.Image, {
          foreignKey: "item_id",
          scope: {
            item_type: 'Celebrity'
          }
        });
      }
    }
  });
  return Cast;
};