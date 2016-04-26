'use strict';
module.exports = function(sequelize, DataTypes) {
  var Genre = sequelize.define('Genre', {
      name: {
        type: DataTypes.STRING
      },
      code: {
        type: DataTypes.STRING
      }
  }, {
    tableName: 'douban_genres',
    classMethods: {
      associate: function(models) {
        models.Genre.belongsToMany(models.BilibiliMovie, {
          through: 'douban_bilibili_genres',
          foreignKey: { name: "genre_id", fieldName: "genre_id" }
        });
        models.Genre.belongsToMany(models.Movie, {
          through: 'douban_movies_genres',
          foreignKey: { name: "genre_id", fieldName: "genre_id" }
        })
      }
    }
  });
  return Genre;
};