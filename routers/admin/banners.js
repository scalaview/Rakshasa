var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var formidable = require('formidable')
var async = require("async")
var _ = require('lodash')

admin.get('/banners', function(req, res) {
  models.Banner.findAndCountAll({
    limit: req.query.perPage || 15,
    offset: helpers.offset(req.query.page, req.query.perPage || 15)
  }).then(function(banners) {
    result = helpers.setPagination(banners, req)
    res.render('admin/banners/index', { banners: result })
  })
})

admin.get('/banners/new', function(req, res) {
  var banner = models.Banner.build()
  res.render('admin/banners/new', { banner: banner, path: '/admin/banner' })
})

admin.post('/banner', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    models.Banner.build({
      name: fields.name,
      active: fields.active ? 1 : 0,
      sortNum: fields.sortNum,
      url: fields.url,
      image: files.image
    }).save().then(function(banner) {
      req.flash('info', 'create success')
      res.redirect("/admin/banners/"+banner.id+'/edit')
    }).catch(function(err, banner) {
      console.log(err)
      req.flash('err', err.message)
      res.redirect("/admin/banners/new")
    })
  })
})

admin.get("/banners/:id/edit", function(req, res) {
  async.waterfall([function(next) {
    models.Banner.findById(req.params.id).then(function(banner) {
      next(null, banner)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, banner) {
    if(err){
      console.log(err)
      res.redirect('/admin/banners')
    }else{
      res.render('admin/banners/new', { banner: banner, path: '/admin/banner/' + banner.id })
    }
  })
})

admin.post('/banner/:id', function(req, res) {
  async.waterfall([function(next) {
    models.Banner.findById(req.params.id).then(function(banner) {
      next(null, banner)
    }).catch(function(err) {
      next(err)
    })
  }, function(banner, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      if(fields.removeImage === 'on'){
        files.image = null
      }
      banner.updateAttributes({
        name: fields.name,
        active: fields.active ? 1 : 0,
        sortNum: fields.sortNum,
        url: fields.url,
        image: files.image
      }).then(function(banner) {
        next(null, banner)
      }).catch(function(err) {
        next(err)
      })
    })
  }], function(err, banner) {
    if(err){
      console.log(err)
      req.flash('error', 'update fail')
      res.redirect('/admin/banners/' + banner.id + "/edit")
    }else{
      req.flash('info', 'update success')
      res.redirect('/admin/banners/' + banner.id + "/edit")
    }
  })
})


module.exports = admin;