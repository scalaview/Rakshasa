var express = require('express');
var app = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var config = require("../../config")
var requireLogin = helpers.requireLogin
var _ = require('lodash')

/**
 * params { 
 *  catName : '' 运营商中文名字
 *  province : '' 地区
 * }
 */
app.get('/getTrafficplans', requireLogin, function(req, res){
  var customer = req.customer,
      province = req.query.province
  if(models.TrafficPlan.Provider[req.query.catName] !== undefined || req.query.catName == "all"){
    var providerId = req.query.catName == "all" ?  Object.keys(models.TrafficPlan.ProviderName) : models.TrafficPlan.Provider[req.query.catName]
    async.waterfall([function(next) {
      models.DConfig.findOne({
        where: {
          name: 'disable'
        }
      }).then(function(dConfig) {
        if(dConfig && dConfig.value == "true"){
          res.json({ err: 4, msg: "服务器维护中" })
          return
        }else{
          next(null)
        }
      }).catch(function(err){
        next(err)
      })
    }, function(next) {
      if(customer && customer.levelId){
        models.Level.findById(customer.levelId).then(function(level) {
          if(level.discount >= (config.blacklist || 3.00 )){
            res.json({ err: 4, msg: "服务器维护中" })
            return
          }else{
            customer.level = level
            next(null)
          }
        })
      }else{
        next(null)
      }
    }, function(outnext){
      models.Coupon.getAllActive(models).then(function(coupons) {
        outnext(null, coupons)
      }).catch(function(err) {
        outnext(err)
      })
    }, function(coupons, outnext) {
      models.TrafficPlan.getTrafficPlanByGroup(models, providerId, province, customer, coupons, outnext)
    }], function(err, result) {
      if(err){
        console.log(err)
        res.json({ err: 1, msg: "server err" })
      }else{
        console.log('[%s]\n\t result:%s', __filename,result);
        res.json(result)
      }
    })
  }else{
    res.json({ err: 1, msg: "phone err" })
  }
})

app.get("/income", requireLogin, function(req, res){
  var customer = req.customer
  models.FlowHistory.incomeHistories({
    where: {
      customerId: customer.id
    }
  }, function(flowHistories){
    res.render('yiweixin/flowhistories/income', { flowHistories: flowHistories })
  }, function(err){
    console.log(err)
  })
})


app.get("/spend", requireLogin, function(req, res){
  var customer = req.customer
  models.FlowHistory.reduceHistories({
    where: {
      customerId: customer.id
    }
  }, function(flowHistories){
    res.render('yiweixin/flowhistories/spend', { flowHistories: flowHistories })
  }, function(err){
    console.log(err)
  })
})


app.get('/salary', requireLogin, function(req, res) {
  var customer = req.customer
  models.FlowHistory.findAll({
    where: {
      customerId: customer.id,
      trafficType: models.FlowHistory.TRAFFICTYPE.SALARY
    }
  }).then(function(flowhistories) {
    res.render('yiweixin/flowhistories/salary', { flowhistories: flowhistories })
  }).catch(function(err) {
    console.log(err)
  })
})

app.get('/orders', requireLogin, function(req, res) {
  var customer = req.customer

  async.waterfall([function(next) {
    customer.getExtractOrders({
      order:[
        ['updatedAt', 'DESC']
      ]
    }).then(function(extractOrders){
      next(null, extractOrders)
    }).catch(function(err){
      next(err)
    })
  }, function(extractOrders, next){
    var trafficPlanIds = extractOrders.map(function(o, i){
      if(o.exchangerType == "TrafficPlan"){
        return o.exchangerId
      }
    }).compact()
    trafficPlanIds = _.union(trafficPlanIds)
    next(null, extractOrders, trafficPlanIds)
  }, function(extractOrders, trafficPlanIds, next) {
    models.TrafficPlan.findAll({
      where: {
        id: trafficPlanIds
      }
    }).then(function(trafficPlans){
      next(null, extractOrders, trafficPlans)
    }).catch(function(err){
      next(err)
    })
  }, function(extractOrders, trafficPlans, next){
    for (var i = 0; i < extractOrders.length; i++) {
      for (var j = 0; j < trafficPlans.length; j++) {
        if(trafficPlans[j].id == extractOrders[i].exchangerId){
          extractOrders[i].trafficPlan = trafficPlans[j]
          break
        }
      };
    };
    next(null, extractOrders, trafficPlans)
  }, function(extractOrders, trafficPlans, next){
    var list = customer.getAncestry()
    if(list.length > 0){
      models.Customer.findById(list[list.length - 1]).then(function(parent) {
        next(null, extractOrders, trafficPlans, parent)
      })
    }else{
      next(null, extractOrders, trafficPlans, {})
    }
  }], function(err, extractOrders, trafficPlans, parent){
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      res.render("yiweixin/flowhistories/myorders", { extractOrders: extractOrders, customer: customer, parent: parent })
    }
  })

})

module.exports = app;