var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var _ = require('lodash')
var config = require("../../config")
var sequelize = models.sequelize


admin.get("/salecontribution", function(req, res){
  async.waterfall([function(next) {
    var params = {}
    if(req.query.phone !== undefined && req.query.phone.present()){
      params = _.merge(params, { phone: { $like: "%{{phone}}%".format({ phone: req.query.phone }) } })
    }
    if(req.query.customerId !== undefined && req.query.customerId.present()){
      params = _.merge(params, { id: req.query.customerId })
    }

    models.Customer.findAndCountAll({
      where: params,
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15)
    }).then(function(customers) {
      next(null, customers)
    })

  }, function(customers, pass){
    async.map(customers.rows, function(customer, next){
      var ancestryList = customer.getAncestry()
      if(ancestryList.length <= 0){
        var originCondition = customer.id;
      }else{
        var originCondition = customer.ancestry + '/' + customer.id;
      }

      async.map([0, 1, 2, 3], function(_i, _next){
        var condition = originCondition
        var replacements = { state: models.ExtractOrder.STATE["FINISH"], depth: (_i + customer.ancestryDepth) }
        switch(_i){
          case 0:
            var partailCondition = customer.id;
            replacements = { state: models.ExtractOrder.STATE["FINISH"] }
            break;
          case 1:
            var partailCondition = "SELECT id FROM Customers AS `Customer` WHERE `Customer`.ancestry = :condition AND `Customer`.ancestryDepth = :depth ";
            break;
          case 3:
            condition = condition + '/%'
            var partailCondition = "SELECT id FROM Customers AS `Customer` WHERE `Customer`.ancestry LIKE :condition AND `Customer`.ancestryDepth >= :depth ";
            break;
          default:
            condition = condition + '/%'
            var partailCondition = "SELECT id FROM Customers AS `Customer` WHERE `Customer`.ancestry LIKE :condition AND `Customer`.ancestryDepth = :depth ";
        }
        replacements['condition'] = condition

        if(req.query.trafficPlanId){
          _.merge(replacements, { trafficPlanId: req.query.trafficPlanId })
          var baseQuery = "SELECT sum(`total`) AS `total` FROM `ExtractOrders` AS `ExtractOrder` WHERE `ExtractOrder`.`state` = :state AND `ExtractOrder`.`exchangerType` = 'TrafficPlan' AND `ExtractOrder`.`exchangerId` = :trafficPlanId AND `ExtractOrder`.`customerId` IN ("
        }else if(req.query.trafficGroupId){
          var baseQuery = "SELECT sum(`total`) AS `total` FROM `ExtractOrders` AS `ExtractOrder` WHERE `ExtractOrder`.`state` = :state AND `ExtractOrder`.`exchangerType` = 'TrafficPlan' AND `ExtractOrder`.`exchangerId` IN ( SELECT TrafficPlan.id FROM TrafficPlans AS TrafficPlan WHERE TrafficPlan.trafficGroupId = :trafficGroupId ) AND `ExtractOrder`.`customerId` IN ("
          _.merge(replacements, { trafficGroupId: req.query.trafficGroupId })
        }else{
          var baseQuery = "SELECT sum(`total`) AS `total` FROM `ExtractOrders` AS `ExtractOrder` WHERE `ExtractOrder`.`state` = :state AND `ExtractOrder`.`exchangerType` = 'TrafficPlan' AND `ExtractOrder`.`customerId` IN ("
        }
        sequelize.query(baseQuery + partailCondition + ") ",
          { replacements: replacements, type: sequelize.QueryTypes.SELECT }
        ).then(function(result) {
          if(result.length >= 1){
            customer['total_' + _i]=result[0].total
            _next(null, result[0].total)
          }else{
            customer['total_' + _i]=0.00
            _next(null, 0)
          }
        }).catch(function(err, result){
          if(err){
            _next(err)
          }else{
            _next(null, customer)
          }
        })
      }, function(err, result){
        if(err){
          next(err)
        }else{
          next(null, customer)
        }
      })
    }, function(err, result){
      if(err){
        pass(err)
      }else{
        customers.rows = result
        pass(null, customers)
      }
    })
  }, function(customers, next){
    models.TrafficGroup.findAll({
      order:[
        'sortNum'
      ]
    }).then(function(trafficgroups) {
      var trafficgroupsCollection = [];
      for (var i = 0; i < trafficgroups.length; i++) {
        trafficgroupsCollection.push([ trafficgroups[i].id, trafficgroups[i].name ])
      };
      next(null, customers, trafficgroupsCollection)
    }).catch(function(err) {
      next(err)
    })
  }, function(customers, trafficgroupsCollection, next){
    if(req.query.trafficGroupId){
      models.TrafficPlan.findAll({
        where: {
          trafficGroupId: req.query.trafficGroupId
        }
      }).then(function(trafficPlans){
        var trafficPlansCollection = [];
        for (var i = 0; i < trafficPlans.length; i++) {
          trafficPlansCollection.push([ trafficPlans[i].id, trafficPlans[i].name ])
        };
        next(null, customers, trafficgroupsCollection, trafficPlansCollection)
      }).catch(function(err){
        next(err)
      })
    }else{
      next(null, customers, trafficgroupsCollection, [])
    }
  }], function(err, customers, trafficgroupsCollection, trafficPlansCollection){
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      var trafficgroupsOptions = { id: "sale-trafficGroupId", name: "trafficGroupId", class: 'select2 col-lg-12 col-xs-12', includeBlank: true },
          trafficPlansOptions  = { id: "sale-trafficPlanId", name: "trafficPlanId", class: 'select2 col-lg-12 col-xs-12', includeBlank: true },
          result = helpers.setPagination(customers, req)
      res.render('admin/sale/contribution', {
        customers: result,
        query: req.query,
        trafficgroupsOptions: trafficgroupsOptions,
        trafficgroupsCollection: trafficgroupsCollection,
        trafficPlansOptions: trafficPlansOptions,
        trafficPlansCollection: trafficPlansCollection
      })
    }
  })
})


admin.get('/getplans', function(req, res){
  var groupId = req.query.groupId ? req.query.groupId : null
  async.waterfall([function(next){
    models.TrafficPlan.findAll({
      where: {
        trafficGroupId: groupId
      },
      order: [
       'sortNum'
      ]
    }).then(function(trafficPlans) {
      next(null, trafficPlans)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, trafficPlans){
    if(err){
      console.log(err)
      res.json({ err: 1, msg: err.message })
    }else{
      res.json({ err: 0, data: trafficPlans })
    }
  })
})

module.exports = admin;