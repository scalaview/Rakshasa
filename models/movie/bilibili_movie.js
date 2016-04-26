'use strict';
module.exports = function(sequelize, DataTypes) {
  var BilibiliMovie = sequelize.define('BilibiliMovie', {
      douban_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      avid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false
      },
      typename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      arcurl: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      title: {
        type: DataTypes.STRING
      },
      play: {
        type: DataTypes.STRING
      },
      pages: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      display: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
  }, {
    tableName: 'douban_bilibili_movies',
    classMethods: {
      associate: function(models) {
        models.BilibiliMovie.belongsTo(models.Movie, { foreignKey: 'douban_id', targetKey: 'douban_id' });
        models.BilibiliMovie.hasMany(models.BilibiliMedia, {  as: 'medias', foreignKey: 'avid' });
        models.BilibiliMovie.belongsToMany(models.Genre, {
          through: 'douban_bilibili_genres',
          foreignKey: { name: "bilibili_id", fieldName: "bilibili_id" }
        });
      }
    }
  });
  return BilibiliMovie;
};