'use strict';

var request = require("request")
var async = require("async")
var helpers = require("../helpers")
var config = require("../config")

module.exports = function(sequelize, DataTypes) {
  var TrafficPlan = sequelize.define('TrafficPlan', {
    providerId: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    name: { type: DataTypes.STRING, allowNull: false },
    cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
    sortNum: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    display: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    type: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    bid: { type: DataTypes.STRING, allowNull: true },
    trafficGroupId: { type: DataTypes.INTEGER, allowNull: true },
    purchasePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0 },
    integral: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    productType: { type: DataTypes.STRING, allowNull: true, defaultValue: "traffic" },
    withOutDiscount: { type: DataTypes.VIRTUAL },
    // 醒目提示
    tip : { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        models.TrafficPlan.belongsTo(models.TrafficGroup, { foreignKey: 'trafficGroupId' });
      },
      getTrafficPlanByGroup: function(models, providerId, province, customer, coupons, pass){
        var groupParams = {
            providerId: providerId,
            $or : [ { name : {$like : '%'+province+'%'}},{ name : {$like : '%中国%'}},{ name : {$like : '%全国%'}}]
          }
        if(customer){
          groupParams['display'] = true
        }
        console.log(`[${__filename} 35]\n\t`,groupParams);
        models.TrafficGroup.findAll({
          where: groupParams,
          order: [
            ['sortNum', 'ASC'],
            ['id', 'ASC']
           ]
        }).then(function(trafficgroups) {
        console.log(`[${__filename} 42]\n\t trafficgroups:${trafficgroups.length}`);
          var params = {
              productType: TrafficPlan.PRODUCTTYPE["traffic"]
            }
          /*
          if(groupId){
            params['trafficGroupId'] = groupId
          }*/
          if(customer){
            params['display'] = true
          }
          console.log(`[${__filename} 52]\n\t`,params);
          async.map(trafficgroups, function(trafficgroup, next) {
            trafficgroup.getTrafficPlans({
              where: params,
              order: [
                ['sortNum', 'ASC'],
                ['id', 'ASC']
              ]
            }).then(function(trafficplans) {
              console.log(`[${__filename} 60]\n\t trafficplans:${trafficplans}`);
              var data = null
              if(trafficplans.length > 0){
                trafficplans = helpers.applyCoupon(coupons, trafficplans, customer)
                data = {
                  name: trafficgroup.name,
                  info : trafficgroup.info,
                  trafficplans: trafficplans
                }
              }
              next(null, data)
            }).catch(function(err) {
              next(err)
            })
          }, function(err, result) {
              console.log(`[${__filename} 74]\n\t`,result);
            if(err){
              pass(err)
            }else{
              var data = []
              for (var i = 0; i < result.length; i++) {
                if(result[i])
                  data.push(result[i])
              };
              pass(null, data)
            }
          })
        })
      }
    },
    instanceMethods: {
      className: function(){
        return "TrafficPlan"
      },
      provider: function(){
        return TrafficPlan.ProviderName[this.providerId]
      },
      typeJson: function(){
        return TrafficPlan.TYPE;
      }
    },
    scopes: {
      forSelect: {
        where: {
          providerId: 0,
          productType: 'traffic'
        },
        order: [
          ['sortNum']
        ]
      },
      forBillSelect: {
        where: {
          providerId: 0,
          productType: 'bill'
        },
        order: [
          ['sortNum']
        ]
      }
    }
  });

  TrafficPlan.Provider = {
    '中国移动': 0,
    '中国联通': 1,
    '中国电信': 2
  }

  TrafficPlan.ProviderName = {
    0: '中国移动',
    1: '中国联通',
    2: '中国电信'
  }

  TrafficPlan.TYPE = {
    "新号吧": 1,
    "大众": 2,
    '流量通': 3,
    '易赛': 4
  }

  TrafficPlan.PRODUCTTYPE = {
    traffic: "traffic",
    bill: "bill"
  }

  TrafficPlan.PROVIDERARRAY = Object.keys(TrafficPlan.Provider).map(function(k) { return [TrafficPlan.Provider[k], k] });

  TrafficPlan.TYPEARRAY = Object.keys(TrafficPlan.TYPE).map(function(k) { return [TrafficPlan.TYPE[k], k] });

  TrafficPlan.PRODUCTTYPEARRAY = Object.keys(TrafficPlan.PRODUCTTYPE).map(function(k) { return [TrafficPlan.PRODUCTTYPE[k], k] });

  return TrafficPlan;
};