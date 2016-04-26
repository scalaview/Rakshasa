'use strict';
module.exports = function(sequelize, DataTypes) {
  var Movie = sequelize.define('Movie', {
      douban_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING
      },
      douban_url: {
        type: DataTypes.STRING
      },
      rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0
      },
      year: {
        type: DataTypes.INTEGER
      },
      douban_mobile_url: {
        type: DataTypes.STRING
      },
      ratings_count: {
        type: DataTypes.INTEGER
      },
      collect_count: {
        type: DataTypes.INTEGER
      },
      reviews_count: {
        type: DataTypes.INTEGER
      },
      summary: {
        type: DataTypes.TEXT
      },
      original_title: {
        type: DataTypes.STRING
      },
      url: {
        type: DataTypes.STRING
      },
      display: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      bilibiliMovie: {
        type: DataTypes.VIRTUAL
      },
      cover: {
        type: DataTypes.VIRTUAL
      },
      genres: {
        type: DataTypes.VIRTUAL
      }
  }, {
    tableName: 'douban_movies',
    classMethods: {
      associate: function(models) {
        models.Movie.belongsToMany(models.Country, {
          through: 'douban_movies_countries',
          foreignKey: { name: "movie_id", fieldName: "movie_id" }
        });
        models.Movie.belongsToMany(models.Genre, {
          through: 'douban_movies_genres',
          foreignKey: { name: "movie_id", fieldName: "movie_id" }
        });
        models.Movie.belongsToMany(models.Director, {
          through: 'douban_movies_directors',
          foreignKey: { name: "movie_id", fieldName: "movie_id" }
        });
        models.Movie.belongsToMany(models.Cast, {
          through: 'douban_movies_casts',
          foreignKey: { name: "movie_id", fieldName: "movie_id" }
        });
        models.Movie.hasMany(models.BilibiliMovie, { as: "bmovies", foreignKey: "douban_id", targetKey: 'douban_id' });
        models.Movie.hasMany(models.Image, {
          foreignKey: "item_id",
          scope: {
            item_type: 'Movie'
          }
        });
      }
    }
  });
  return Movie;
};