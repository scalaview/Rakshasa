var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var formidable = require('formidable')
var async = require("async")
var _ = require('lodash')

admin.get('/flowtasks', function(req, res) {
  var result;
  async.waterfall([function(next) {
    var params = {}
    if(req.query.title !== undefined && req.query.title.present()){
      params = _.merge(params, { title: { $like: req.query.title } })
    }
    if(req.query.sellerId !== undefined && req.query.sellerId.present()){
      params = _.merge(params, { seller_id: req.query.sellerId })
    }
    if(req.query.isActive !== undefined && req.query.isActive.present()){
      params = _.merge(params, { isActive: req.query.isActive })
    }
    models.FlowTask.findAndCountAll({
      where: params,
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15)
    }).then(function(flowtasks) {
      result = flowtasks
      next(null, flowtasks.rows)
    })
  }, function(flowtasks, next) {
    models.Seller.findAll({
      attributes: ['id', 'name']
    }).then(function(sellers) {
      var sellerCollection = []
      for (var i = 0; i < sellers.length; i++) {
        sellerCollection.push( [sellers[i].id, sellers[i].name] )
      };
      next(null, flowtasks, sellerCollection)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, flowtasks, sellerCollection, next) {
    async.map(flowtasks, function(flowtask, mapnext) {
      async.waterfall([function(next) {
        models.Seller.findById(flowtask.seller_id).then(function(seller) {
          flowtask.seller = seller
          next(null, flowtask)
        }).catch(function(err) {
          next(err)
        })
      }, function(flowtask, next) {
        models.TrafficPlan.findById(flowtask.trafficPlanId).then(function(trafficPlan) {
          flowtask.trafficPlan = trafficPlan
          next(null, flowtask)
        }).catch(function(err) {
          next(err)
        })
      }], function(err, flowtask) {
        if(err){
          console.log(err)
          mapnext(err)
        }else{
          mapnext(null, flowtask)
        }
      })
    }, function(err, flowtasks) {
      if(err){
        console.log(err)
        req.flash('err', err.message)
        res.redirect('back')
      }else{
        var sellerOptions = { name: "sellerId", class: "col-lg-12 col-xs-12 select2", includeBlank: true },
            isActiveOptions = { name: "isActive", class:  "col-lg-12 col-xs-12 select2", includeBlank: true },
            isActiveCollection = [ [1, '激活'], [0, '冻结'] ]
        result.rows = flowtasks
        result = helpers.setPagination(result, req)
        res.render("admin/flowtasks/index", {
          flowtasks: result,
          sellerOptions: sellerOptions,
          sellerCollection: sellerCollection,
          isActiveOptions: isActiveOptions,
          isActiveCollection: isActiveCollection,
          query: req.query
        })
      }
    })
  })
})

admin.get('/flowtasks/new', function(req, res) {
  async.waterfall([function(next) {
    models.Seller.findAll().then(function(sellers) {
      next(null, sellers)
    })
  }, function(sellers, outnext) {
    models.TrafficPlan.scope('forSelect').findAll().then(function(trafficPlans) {
      if(trafficPlans){
        async.map(trafficPlans, function(trafficPlan, next){
          next(null, [trafficPlan.id, trafficPlan.name])
        }, function(err, trafficPlanCollection){
          outnext(null, sellers, trafficPlanCollection)
        })
      }else{
        outnext(new Error("no trafficPlans found"))
      }
    }).catch(function(err) {
      outnext(err)
    })
  }, function(sellers, trafficPlanCollection, outnext) {
    async.map(sellers, function(seller, next){
      next(null, [seller.id, seller.name])
    }, function(err, sellerCollection){
      outnext(null, sellerCollection, trafficPlanCollection)
    })
  }], function(err, sellerCollection, trafficPlanCollection) {
    if(err){
      console.log(err)
    }else{
      var sellerOptions = { name: 'seller_id', id: 'seller_id', class: 'select2 col-lg-12 col-xs-12' },
          trafficPlanOptions = { name: 'trafficPlanId', id: 'trafficPlanId', class: 'select2 col-lg-12 col-xs-12' }
      res.render('./admin/flowtasks/new', {
        flowtask: models.FlowTask.build(),
        sellerOptions: sellerOptions,
        sellerCollection: sellerCollection,
        trafficPlanOptions: trafficPlanOptions,
        trafficPlanCollection: trafficPlanCollection
      })
    }
  })
})

admin.get('/flowtasks/:id/edit', function(req, res) {
  async.waterfall([function(next){
    models.FlowTask.findById(req.params.id).then(function(flowtask) {
      next(null, flowtask)
    }).catch(function(err) {
      next(err)
    })
  }, function(flowtask, outnext) {
    models.Seller.findAll().then(function(sellers) {
      for (var i = sellers.length - 1; i >= 0; i--) {
        if(sellers[i].id == flowtask.seller_id){
          flowtask.seller = sellers[i]
          break;
        }
      };
      async.map(sellers, function(seller, next){
        next(null, [seller.id, seller.name])
      }, function(err, sellerCollection){
        outnext(null, flowtask, sellerCollection)
      })
    })
  }, function(flowtask, sellerCollection, outnext){
    models.TrafficPlan.scope('forSelect').findAll().then(function(trafficPlans) {
      if(trafficPlans){
        async.map(trafficPlans, function(trafficPlan, next){
          next(null, [trafficPlan.id, trafficPlan.name])
        }, function(err, trafficPlanCollection){
          outnext(null, flowtask, sellerCollection, trafficPlanCollection)
        })
      }else{
        outnext(new Error("no trafficPlans found"))
      }
    }).catch(function(err) {
      outnext(err)
    })
  }], function(err, flowtask, sellerCollection, trafficPlanCollection){
    if(err){
      console.log(err)
      res.redirect("/admin/flowtasks")
    }else{
      var sellerOptions = { name: 'seller_id', id: 'seller_id', class: 'select2 col-lg-12 col-xs-12' },
            trafficPlanOptions = { name: 'trafficPlanId', id: 'trafficPlanId', class: 'select2 col-lg-12 col-xs-12' }
      res.render('./admin/flowtasks/edit', {
        sellerOptions: sellerOptions,
        sellerCollection: sellerCollection,
        trafficPlanOptions: trafficPlanOptions,
        trafficPlanCollection: trafficPlanCollection,
        flowtask: flowtask,
        path: '/admin/flowtask/'+flowtask.id
      })
    }
  })
})

admin.post('/flowtask', function(req, res) {

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    models.FlowTask.build({
      title: fields.title,
      content: fields.content,
      expiredAt: new Date(fields.expired_at),
      isActive: fields.is_active ? 1 : 0,
      sortNum: fields.sortNum,
      cover: files.cover,
      seller_id: fields.seller_id,
      trafficPlanId: fields.trafficPlanId,
      actionUrl: fields.actionUrl
    }).save().then(function(flowtask) {
      req.flash('info', 'create success')
      res.redirect("/admin/flowtasks/" + flowtask.id + "/edit")
    }).catch(function(err) {
      console.log(err)
      req.flash("err", err.message)
      res.redirect("/admin/flowtasks/new")
    });
  });
});


admin.post("/flowtask/:id", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    async.waterfall([function(next) {
      models.FlowTask.findById(req.params.id).then(function(flowtask) {
        next(null, flowtask)
      }).catch(function(err) {
        next(err)
      })
    }, function(flowtask, next){
      if(files.cover.size > 0){
        fields['cover'] = files.cover
      }else if( fields.removeCover){
        fields['cover'] = null
      }else{
        fields['cover'] = files.cover
      }
      fields['isActive'] = fields.is_active ? 1 : 0
      fields['expiredAt'] = new Date(fields.expired_at)
      flowtask.updateAttributes(fields).then(function(flowtask) {
        next(null, flowtask)
      }).catch(function(err) {
        next(err)
      })
    }], function(err, flowtask) {
      if(err){
        console.log(err)
        req.flash('err', err.message)
        res.redirect("/admin/flowtasks/" + flowtask.id + "/edit")
      }else{
        req.flash('info', 'update success')
        res.redirect("/admin/flowtasks")
      }
    })
  })
})

module.exports = admin;