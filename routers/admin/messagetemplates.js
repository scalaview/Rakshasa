var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")

admin.get("/messagetemplates", function(req, res) {
  models.MessageTemplate.findAndCountAll().then(function(messagetemplates) {
    if(messagetemplates){
      result = helpers.setPagination(messagetemplates, req)
    }else{
      result = {rows: {}}
    }
    res.render("admin/messagetemplates/index", {messagetemplates: result})
  })
})

admin.get('/messagetemplates/:id/edit', function(req, res) {
  models.MessageTemplate.findById(req.params.id).then(function(messagetemplate) {
    res.render('admin/messagetemplates/edit', {
      messagetemplate: messagetemplate,
      path: '/admin/messagetemplate/' + messagetemplate.id
    })
  }).catch(function(err) {
    console.log(err)
    res.redirect('/500')
  })
})


admin.post('/messagetemplate/:id', function(req, res) {
  var params = req.body
  async.waterfall([function(next) {
    models.MessageTemplate.findById(req.params.id).then(function(messagetemplate){
      next(null, messagetemplate)
    }).catch(function(err) {
      next(err)
    })
  }, function(messagetemplate, next) {
    messagetemplate.updateAttributes(params).then(function(messagetemplate) {
      next(null, messagetemplate)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, messagetemplate) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      req.flash("info", "create success")
      res.redirect('/admin/messagetemplates/'+ messagetemplate.id  +'/edit')
    }
  })
})

module.exports = admin;