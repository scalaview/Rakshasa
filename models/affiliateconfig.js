'use strict';

var config = require("../config")
var async = require("async")
var maxDepth = config.max_depth

module.exports = function(sequelize, DataTypes) {
  var AffiliateConfig = sequelize.define('AffiliateConfig', {
    level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    percent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    trafficPlanId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      loadConfig: function(models, trafficPlan, successCallBack, errCallBack) {
        async.waterfall([function(next) {
          var params = {
                          trafficPlanId: {
                            $eq: null
                          },
                          level: {
                            $lte: maxDepth
                          },
                          percent: {
                            $gt: 0
                          }
                        }
          if(trafficPlan){
            models.AffiliateConfig.count({
              where: {
                trafficPlanId: trafficPlan.id,
                percent: {
                  $gt: 0
                }
              }
            }).then(function(c) {
              if(c > 0){
                var params = {
                                trafficPlanId: trafficPlan.id,
                                level: {
                                  $lte: maxDepth
                                },
                                percent: {
                                  $gt: 0
                                }
                              }
              }else{
                var params = {
                                trafficPlanId: {
                                  $eq: null
                                },
                                level: {
                                  $lte: maxDepth
                                },
                                percent: {
                                  $gt: 0
                                }
                              }
              }
              next(null, params)
            })
          }else{
            next(null, params)
          }
        }, function(params, next) {
          models.AffiliateConfig.findAll({
            where: params,
            order: [
              ['level']
            ]
          }).then(function(configs) {
            next(null, configs)
          }).catch(function(err) {
            next(err)
          })
        }], function(err, configs) {
          if(err){
            errCallBack(err)
          }else{
            successCallBack(configs)
          }
        })
      },
      existeConfig: function(models, trafficPlan, successCallBack, errCallBack){
         models.AffiliateConfig.count({
          where: {
            trafficPlanId: trafficPlan.id,
            percent: {
              $gt: 0
            }
          }
        }).then(function(c) {
          successCallBack(c)
        }).catch(function(err){
          errCallBack(err)
        })
      }
    }
  });
  return AffiliateConfig;
};