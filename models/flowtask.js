'use strict';
var helpers = require('../helpers')
var config = require("../config")

module.exports = function(sequelize, DataTypes) {
  var FlowTask = sequelize.define('FlowTask', {
    digest: { type: DataTypes.STRING, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    cover: {
      type: DataTypes.STRING,
      allowNull: true,
      set: function(file) {
        if(file == null){
          this.setDataValue('cover', null)
        }else if(file.size > 0 && file.type.match('^image\/')){
          var filename = helpers.fileUploadSync(file)
          this.setDataValue('cover', filename);
        }
      },
      get: function(){
         var cover = this.getDataValue('cover');
        if(cover) return '/uploads/' + cover
        return
      }
    },
    content: { type: DataTypes.TEXT, allowNull: true },
    finishTime: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expiredAt: { type: DataTypes.DATE, allowNull: false },
    sortNum: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    actionUrl: { type: DataTypes.STRING, allowNull: true },
    seller_id: { type: DataTypes.INTEGER, allowNull: false },
    trafficPlanId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.FlowTask.belongsTo(models.Seller, { foreignKey: 'seller_id' });
        models.FlowTask.belongsTo(models.TrafficPlan, { foreignKey: 'trafficPlanId' });
      }
    },
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      defaultSort: {
        order: [['sortNum', 'DESC']]
      }
    },
    instanceMethods: {
      className: function(){
        return "FlowTask"
      }
    }
  });
  return FlowTask;
};