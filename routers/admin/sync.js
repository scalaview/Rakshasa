var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var _ = require('lodash')
var crypto = require('crypto')
var config = require("../../config")
var request = require("request")

admin.get('/syncliuliangshop', function(req ,res) {

  function getProviderId(providerType){
    //运营商类型 1：电信 2：移动 3：联通
    switch(providerType) {
      case "1":
        return models.TrafficPlan.Provider["中国电信"]
      case "2":
        return models.TrafficPlan.Provider["中国移动"]
      case "3":
        return models.TrafficPlan.Provider["中国联通"]
    }
  }

  models.ExtractOrder.ChongRecharger.getProducts(function(data){
    if(data.errcode == 0){
      async.each(data.products, function(product, next){
        models.TrafficPlan.findOrCreate({
          where: {
            bid: product.product_id
          },
          defaults: {
            providerId: getProviderId(product.provider_type),
            value: product.flow_value,
            name: product.name,
            cost: product.price,
            display: false,
            type: models.TrafficPlan.TYPE["曦和流量"],
            bid: product.product_id,
            purchasePrice: product.cost
          }
        }).spread(function(trafficPlan) {
          trafficPlan.updateAttributes({
            providerId: getProviderId(product.provider_type),
            value: product.flow_value,
            name: product.name,
            cost: product.price,
            display: false,
            type: models.TrafficPlan.TYPE["曦和流量"],
            bid: product.product_id,
            purchasePrice: product.cost
          }).then(function(trafficPlan){
            next(null)
          }).catch(function(err){
            next(err)
          })
        }).catch(function(err) {
          next(err)
        })
      }, function(err){
        if(err){
          res.send(err)
        }else{
          res.send("success")
        }
      })
    }else{
      res.send(data.errmsg)
    }
  }, function(err){
    res.send(err)
  })
})


module.exports = admin;