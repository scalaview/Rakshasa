var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var _ = require('lodash')
var config = require("../../config")


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

  }, function(customer, pass){

  }], function(err){

  })
})


module.exports = admin;