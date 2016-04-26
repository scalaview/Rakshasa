'use strict';
module.exports = function(sequelize, DataTypes) {
  var WechatMenu = sequelize.define('WechatMenu', {
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    event: {
      type: DataTypes.STRING
    },
    key: {
      type: DataTypes.STRING,
      set: function(val){
        if(val == null || val === undefined || val === ''){
          this.setDataValue('key', (new Date()).getTime())
        }else{
          this.setDataValue('key', val)
        }
      }
    },
    url: {
      type: DataTypes.STRING
    },
    sortNum: {
      type: DataTypes.INTEGER
    },
    ancestryDepth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ancestry: {
      type: DataTypes.STRING,
      allowNull: true,
      set: function(menu){
        if(menu){
          var list = menu.ancestry || []
          list.push(menu.id)
          this.setDataValue('ancestry', list.join('/'))
          this.setDataValue('ancestryDepth', parseInt(menu.ancestryDepth) + 1 )
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  WechatMenu.EVENT = {
    CLICK: 'click',
    VIEW: 'view'
  };

  return WechatMenu;
};