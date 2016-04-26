'use strict';
var helpers = require('../helpers')

module.exports = function(sequelize, DataTypes) {
  var Banner = sequelize.define('Banner', {
    name: { type: DataTypes.STRING, allowNull: false },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      set: function(file){
        if(file == null){
          this.setDataValue('image', null)
        }else if(file.size > 0 && file.type.match('^image\/')){
          var filename = helpers.fileUploadSync(file)
          this.setDataValue('image', filename);
        }
      },
      get: function(){
        var image = this.getDataValue('image');
        if(image) return '/uploads/' + image
        return
      }
    },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sortNum: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    url: { type: DataTypes.STRING, allowNull: true }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Banner;
};