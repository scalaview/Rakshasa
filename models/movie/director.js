'use strict';
module.exports = function(sequelize, DataTypes) {
  var attributes = require(process.env.PWD + "/models/concerns/celebrity").attributes
  var Director = sequelize.define('Director', attributes(DataTypes)
    , {
    tableName: 'douban_celebrities',
    classMethods: {
      associate: function(models) {
        models.Director.belongsToMany(models.Movie, {
          through: 'douban_movies_directors',
          foreignKey: { name: "director_id", fieldName: "director_id" }
        });
        models.Director.hasMany(models.Image, {
          foreignKey: "item_id",
          scope: {
            item_type: 'Celebrity'
          }
        });
      }
    }
  });
  return Director;
};