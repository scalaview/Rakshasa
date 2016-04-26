var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")

admin.get("/coupons", function(req, res) {
  async.waterfall([function(next){
    models.Coupon.findAndCountAll({
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15)
    }).then(function(result) {
      next(null, result)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, result) {
    if(err){
      console.log(err)
    }else{
      result = helpers.setPagination(result, req)
      helpers.getAllTrafficPlans(true, function(err, trafficPlanCollection, trafficPlanOptions) {
        trafficPlanOptions["class"] = "select2 col-lg-4 col-xs-4 disabled"
        res.render('admin/coupons/index', {
          coupons: result,
          trafficPlanCollection: trafficPlanCollection,
          trafficPlanOptions: trafficPlanOptions
        })
      })
    }
  })
})


admin.get('/coupons/new', function(req, res) {
  async.waterfall([function(next){
    models.TrafficPlan.findAll().then(function(trafficPlans){
      var trafficPlanCollection = []
      for (var i = 0; i < trafficPlans.length; i++ ) {
        trafficPlanCollection.push([trafficPlans[i].id, trafficPlans[i].name])
      };
      next(null, trafficPlanCollection)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, trafficPlanCollection) {
    var coupon = models.Coupon.build(),
        trafficPlanOptions = { name: 'trafficPlanId', class: "select2 col-lg-12 col-xs-12" }
    res.render('admin/coupons/new', {
      coupon: coupon,
      trafficPlanOptions: trafficPlanOptions,
      trafficPlanCollection: trafficPlanCollection,
      path: "/admin/coupon"
    })
  })
})

admin.post('/coupon', function(req, res) {
  var params = req.body
  params['isActive'] = params['isActive'] === 'on'
  params['ignoreLevel'] = params['ignoreLevel'] === 'on'
  models.Coupon.build(params).save().then(function(coupon) {
    if(coupon.id){
      req.flash('info', "create success")
      res.redirect('/admin/coupons/' + coupon.id + '/edit')
    }
  }).catch(function(err) {
    console.log(err)
    req.flash('err', "create fails")
    res.redirect('/admin/coupons/new')
  })
})

admin.get('/coupons/:id/edit', function(req, res) {
  async.waterfall([function(next) {
    models.Coupon.findById(req.params.id).then(function(coupon) {
      next(null, coupon)
    }).catch(function(err) {
      next(err)
    })
  }, function(coupon, next){
    models.TrafficPlan.findAll().then(function(trafficPlans){
      var trafficPlanCollection = []
      for (var i = 0; i < trafficPlans.length; i++ ) {
        if(trafficPlans[i].id  === coupon.trafficPlanId){
          coupon.trafficPlan = trafficPlans[i]
        }
        trafficPlanCollection.push([trafficPlans[i].id, trafficPlans[i].name])
      };
      next(null, coupon, trafficPlanCollection)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, coupon, trafficPlanCollection) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      var trafficPlanOptions = { name: 'trafficPlanId', class: "select2 col-lg-12 col-xs-12" }
      res.render('admin/coupons/edit', {
        coupon: coupon,
        trafficPlanOptions: trafficPlanOptions,
        trafficPlanCollection: trafficPlanCollection,
        path: "/admin/coupons/" + coupon.id
      })
    }
  })
})

admin.post('/coupons/:id', function(req, res) {
  var params = req.body
  params['isActive'] = params['isActive'] === 'on'
  params['ignoreLevel'] = params['ignoreLevel'] === 'on'
  async.waterfall([function(next) {
    models.Coupon.findById(req.params.id).then(function(coupon) {
      next(null, coupon)
    }).catch(function(err) {
      next(err)
    })
  }, function(coupon, next) {
    coupon.updateAttributes(params).then(function(coupon) {
      next(null, coupon)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, coupon) {
    if(err){
      console.log(err)
      req.flash('err', "update fails")
    }else{
      req.flash('info', "update success")
    }
    res.redirect('/admin/coupons/' + coupon.id + '/edit')
  })
})

module.exports = admin;