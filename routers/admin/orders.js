var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var _ = require('lodash')


admin.get("/orders", function(req, res) {
  var result,
      paymentMethodCollection = [],
      dataPlanCollection = []
  async.waterfall([function(next) {
    var customerParams = {}
    if(req.query.phone !== undefined && req.query.phone.present()){
      customerParams = _.merge(customerParams, { phone:  { $like: "%{{phone}}%".format({ phone: req.query.phone }) } })
    }
    var params = {}
    if(req.query.state !== undefined && req.query.state.present()){
      params = _.merge(params, { state: req.query.state } )
    }
    if(req.query.dataPlanId !== undefined && req.query.dataPlanId.present()){
      params = _.merge(params, { dataPlanId: req.query.dataPlanId } )
    }
    if(req.query.paymentMethodId !== undefined && req.query.paymentMethodId.present()){
      params = _.merge(params, { paymentMethodId: req.query.paymentMethodId } )
    }
    models.Order.findAndCountAll({
      where: params,
      order: [
        ['updatedAt', 'DESC']
      ],
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15),
      include: [ { model: models.Customer, where: customerParams } ]
    }).then(function(orders){
      result = orders
      next(null, orders.rows)
    }).catch(function(err){
      next(err)
    })
  }, function(orders, next) {
    models.PaymentMethod.findAll().then(function(paymentMethods) {
      for (var i = 0; i < paymentMethods.length; i++) {
        paymentMethodCollection.push([paymentMethods[i].id, paymentMethods[i].name])
      };
      next(null, orders, paymentMethods)
    }).catch(function(err) {
      next(err)
    })
  }, function(orders, paymentMethods, outnext){
    async.map(orders, function(order, next) {
      for (var i = paymentMethods.length - 1; i >= 0; i--) {

        if(paymentMethods[i].id == order.paymentMethodId){
          order.paymentMethod = paymentMethods[i]
          break;
        }
      };
      next(null, order)
    }, function(err, orders){
      if(err){
        outnext(err)
      }else{
        outnext(null, orders)
      }
    })
  }, function(orders, next){
    models.DataPlan.findAll().then(function(dataPlans) {
      for (var i = 0; i < dataPlans.length; i++) {
        dataPlanCollection.push([dataPlans[i].id, dataPlans[i].name])
      };
      next(null, orders, dataPlans)
    })
  }, function(orders, dataPlans, outnext) {
    async.map(orders, function(order, next) {
      for (var i = dataPlans.length - 1; i >= 0; i--) {
        if(dataPlans[i].id == order.dataPlanId){
          order.dataPlan = dataPlans[i]
          break;
        }
      };
      next(null, order)
    }, function(err, orders) {
      if(err){
        outnext(err)
      }else{
        outnext(null, orders)
      }
    })
  }, function(orders, outnext) {
    async.map(orders, function(order, next){
      models.Customer.findById(order.customerId).then(function(customer) {
        order.customer = customer
        next(null, order)
      }).catch(function(err){
        next(err)
      })
    }, function(err, orders) {
      if(err){
        outnext(err)
      }else{
        outnext(null, orders)
      }
    })
  }], function(err, orders) {
    if(err){
      console.log(err)
      res.send(500)
    }else{
      var dataPlanOptions = { name: 'dataPlanId', id: 'dataPlanId', class: 'select2 col-lg-12 col-xs-12', includeBlank: true },
          paymentMethodOptions = { name: 'paymentMethodId', id: 'paymentMethodId', class: 'select2 col-lg-12 col-xs-12', includeBlank: true },
          stateOptions = { name: 'state', id: 'state', class: 'select2 col-lg-12 col-xs-12', includeBlank: true },
          stateCollection = []

      for(var key in models.Order.STATE){
        stateCollection.push([ models.Order.STATE[key], key ])
      }
      result.rows = orders
      result = helpers.setPagination(result, req)
      res.render("admin/orders/index", {
        orders: result,
        dataPlanCollection: dataPlanCollection,
        paymentMethodCollection: paymentMethodCollection,
        dataPlanOptions: dataPlanOptions,
        paymentMethodOptions: paymentMethodOptions,
        stateOptions: stateOptions,
        stateCollection: stateCollection,
        query: req.query
      })
    }
  })
})


admin.get("/orders/:id", function(req, res) {
  async.waterfall([function(next) {
    models.Order.findById(req.params.id).then(function(order) {
      next(null, order)
    }).catch(function(err) {
      next(err)
    })
  }, function(order, next) {
    models.Customer.findById(order.customerId).then(function(customer) {
      order.customer = customer
      next(null, order)
    }).catch(function(err){
      next(err)
    })
  }, function(order, next) {
    models.DataPlan.findById(order.dataPlanId).then(function(dataPlan) {
      order.dataPlan = dataPlan
      next(null, order)
    }).catch(function(err) {
      next(err)
    })
  }, function(order, next) {
    models.PaymentMethod.findById(order.paymentMethodId).then(function(paymentMethod) {
      order.paymentMethod = paymentMethod
      next(null, order)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, order){
    if(err){
      console.log(err)
    }else{
      res.render("admin/orders/show", { order: order })
    }
  })
})


module.exports = admin;