var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")



admin.get('/levels', function(req, res) {
  async.waterfall([function(next) {
    models.Level.findAndCountAll().then(function(levels) {
      next(null, levels)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, levels) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      result = helpers.setPagination(levels, req)
      res.render("admin/levels/index", {
        levels: result
      })
    }
  })
})

admin.get('/levels/new', function(req, res) {
  var level = models.Level.build()
  res.render('admin/levels/new', { level: level, path: '/admin/level' })
})

admin.post('/level', function(req, res) {
  console.log(req.body)
  models.Level.build(req.body).save().then(function(level) {
    if(level){
      req.flash("info", "update success")
      res.redirect('/admin/levels/' + level.id + '/edit')
    }else{
      req.flash("info", "update fail")
      res.redirect('/admin/levels/new')
    }
  }).catch(function(err) {
    console.log(err)
    req.flash("info", "update fail")
    res.redirect('/500')
  })
})

admin.get("/levels/:id/edit", function(req, res) {
  models.Level.findById(req.params.id).then(function(level) {
    if(level){
      res.render('admin/levels/edit', { level: level, path: '/admin/level/' + level.id, method: 'POST' })
    }else{
      res.redirect('/500')
    }
  }).catch(function(err){
    console.log(err)
    res.redirect('/500')
  })
})


admin.post("/level/:id", function(req, res) {
  async.waterfall([function(next) {
    models.Level.findById(req.params.id).then(function(level) {
      if(level){
        next(null, level)
      }else{
        next(null)
      }
    })
  }, function(level, next){
    level.updateAttributes(req.body).then(function(level) {
      if(level){
        next(null, level)
      }else{
        next(new Error('update fail'))
      }
    })
  }], function(err, level){
    if(err){
      console.log(err)
      req.flash("info", "update fail")
      res.redirect('/500')
    }else{
      req.flash("info", "update success")
      res.redirect('/admin/levels/' + level.id + '/edit')
    }
  })
})

module.exports = admin;