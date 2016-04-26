var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var formidable = require('formidable')
var async = require("async")
var _ = require('lodash')


admin.get('/apks/new', function(req, res) {
  models.Seller.findAll().then(function(sellers) {
    if(sellers){
      async.map(sellers, function(seller, next){
        next(null, [seller.id, seller.name])
      }, function(err, sellerCollection){
        var sellerOptions = { name: 'sellerId', id: 'sellerId', class: 'select2 col-lg-12 col-xs-12' }
        res.render('admin/apks/new', {
          apk: models.Apk.build(),
          sellerCollection: sellerCollection,
          sellerOptions: sellerOptions,
          path: "/admin/apk"
        })
      })
    }
  })
})

admin.post("/apk", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    models.Apk.build({
      name: fields.name,
      isActive: fields.isActive ? 1 : 0,
      version: fields.version,
      sellerId: fields.sellerId,
      reward: fields.reward,
      apk: files.apk,
      icon: files.icon,
      image01: files.image01,
      image02: files.image02,
      image03: files.image03,
      adImage: files.adImage,
      description: fields.description,
      digest: fields.digest
    }).save().then(function(apk) {
      req.flash('info', 'create success')
      res.redirect("/admin/apks/"+apk.id+'/edit')
    }).catch(function(err, apk) {
      console.log(err)
      req.flash('err', err.message)
      res.redirect("/admin/apks/new")
    })
  })
})

admin.get("/apks", function(req, res){
  var result
  async.waterfall([function(next) {
    var params = {}
    if(req.query.name !== undefined && req.query.name.present()){
      params = _.merge(params, { name: { $like: "%{{name}}%".format({ name: req.query.name }) } })
    }
    if(req.query.sellerId !== undefined && req.query.sellerId.present()){
      params = _.merge(params, { sellerId: req.query.sellerId })
    }
    models.Apk.findAndCountAll({
        where: params,
        limit: req.query.perPage || 15,
        offset: helpers.offset(req.query.page, req.query.perPage || 15)
      }).then(function(apks) {
        result = apks
        next(null, apks.rows)
      })
  }, function(apks, outnext) {
    async.map(apks, function(apk, next){
      models.Seller.findById(apk.sellerId).then(function(seller) {
        apk.seller = seller
        next(null, apk)
      }).catch(function(err){
        next(err)
      })
    }, function(err, apks){
      if(err){
        outnext(err)
      }else{
        outnext(null, apks)
      }
    })
  },function(apks, next) {
    models.Seller.findAll({
      attributes: ['id', 'name']
    }).then(function(sellers) {
      var sellerCollection = []
      for (var i = 0; i < sellers.length; i++) {
        sellerCollection.push( [sellers[i].id, sellers[i].name] )
      };
      next(null, apks, sellerCollection)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, apks, sellerCollection) {
    if(err){
      console.log(err)
      res.send(500)
    }else{
      var sellerOptions = { name: 'sellerId', class: "select2 col-lg-12 col-xs-12", includeBlank: true}
      result.rows = apks
      result = helpers.setPagination(result, req)
      res.render('admin/apks/index', {
        apks: result,
        query: req.query,
        sellerCollection: sellerCollection,
        sellerOptions: sellerOptions
      })

    }
  })
})

admin.get("/apks/:id/edit", function(req, res) {
  async.waterfall([function(next) {
    models.Apk.findById(req.params.id).then(function(apk) {
      next(null, apk)
    }).catch(function(err) {
      next(err)
    })
  }, function(apk, outnext) {
    models.Seller.findAll().then(function(sellers) {
      async.map(sellers, function(seller, next){
        next(null, [seller.id, seller.name])
      }, function(err, sellerCollection){
        outnext(null, apk, sellerCollection)
      })
    })
  }], function(err, apk, sellerCollection) {
    if(err){
      console.log(err)
      req.flash('err', err.message)
      res.redirect("/admin/apks")
    }else{
      var sellerOptions = { name: 'sellerId', id: 'sellerId', class: 'select2 col-lg-12 col-xs-12' },
          trafficPlanOptions = { name: 'trafficPlanId', id: 'trafficPlanId', class: 'select2 col-lg-12 col-xs-12' }

      res.render('admin/apks/edit', {
        sellerOptions: sellerOptions,
        sellerCollection: sellerCollection,
        apk: apk,
        path: '/admin/apk/'+apk.id
      })
    }
  })
})


admin.post("/apk/:id", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    async.waterfall([function(next) {
      models.Apk.findById(req.params.id).then(function(apk) {
        next(null, apk)
      }).catch(function(err) {
        next(err)
      })
    }, function(apk, next){
      var list = ['Icon', 'Apk', 'Image01', 'Image02', 'Image03', 'Adimage']
      for (var i = 0; i < list.length; i++) {
        if(files[list[i].toLowerCase()].size > 0 ){
          fields[list[i].toLowerCase()] = files[list[i].toLowerCase()]
        }else if(fields['remove' + list[i]]){
          fields[list[i].toLowerCase()] = null
        }else{
          fields[list[i].toLowerCase()] = files[list[i].toLowerCase()]
        }
      };
      fields['isActive'] = fields.isActive ? 1 : 0
      apk.updateAttributes(fields).then(function(apk) {
        next(null, apk)
      }).catch(function(err) {
        next(err)
      })
    }], function(err, apk) {
      if(err){
        console.log(err)
        req.flash('err', err.message)
        res.redirect("/admin/apk/" + apk.id + "/edit")
      }else{
        req.flash('info', 'update success')
        res.redirect("/admin/apks")
      }
    })
  })
})


admin.get("/apk/:id/delete", function(req, res) {
  models.Apk.findById(req.params.id).then(function(apk) {
    apk.destroy().then(function() {
      res.redirect('/admin/apks')
    })
  })
})


module.exports = admin;