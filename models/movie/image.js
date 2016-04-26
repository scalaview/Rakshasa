'use strict';
module.exports = function(sequelize, DataTypes) {
  var Image = sequelize.define('Image', {
      small: {
        type: DataTypes.STRING
      },
      medium: {
        type: DataTypes.STRING
      },
      large: {
        type: DataTypes.STRING
      },
      item_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
  }, {
    tableName: 'douban_images',
    classMethods: {
      associate: function(models) {
        models.Image.belongsTo(models.Movie, {
          foreignKey: 'item_id',
          scope: {
            item_type: 'Movie'
          }
        });
        models.Image.belongsTo(models.Cast, {
          foreignKey: 'item_id',
          scope: {
            item_type: 'Celebrity'
          }
        });
        models.Image.belongsTo(models.Director, {
          foreignKey: 'item_id',
          scope: {
            item_type: 'Celebrity'
          }
        });
      }
    }
  });
  return Image;
};