var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")



admin.get('/dataplans', function(req, res) {
  models.DataPlan.findAndCountAll().then(function(dataplans) {
    result = helpers.setPagination(dataplans, req)
    res.render('admin/dataplans/index', { dataplans: result })
  }).catch(function(err) {
    console.log(err)
    res.redirect('/500')
  })
})

admin.get('/dataplans/:id/edit', function(req, res) {
  models.DataPlan.findById(req.params.id).then(function(dataplan) {
    res.render('admin/dataplans/edit', {
      dataplan: dataplan,
      path: '/admin/dataplan/' + dataplan.id
    })
  }).catch(function(err) {
    console.log(err)
    res.redirect('/500')
  })
})

admin.post('/dataplan/:id', function(req, res) {
  async.waterfall([function(next) {
    models.DataPlan.findById(req.params.id).then(function(dataplan) {
      next(null, dataplan)
    }).catch(function(err) {
      next(err)
    })
  }, function(dataplan, next) {
    dataplan.updateAttributes(req.body).then(function(dataplan) {
      next(null, dataplan)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, dataplan) {
    if(err){
      console.log(err)
      req.flash("info", "update fail")
      res.redirect('/500')
    }else{
      req.flash("info", "update success")
      res.redirect('/admin/dataplans/' + dataplan.id + "/edit")
    }
  })

})

module.exports = admin;