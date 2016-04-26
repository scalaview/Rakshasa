var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var formidable = require('formidable')
var async = require("async")



admin.get("/wechatreplies", function(req, res) {
  models.WechatReply.findAndCountAll({
    limit: req.query.perPage || 15,
    offset: helpers.offset(req.query.page, req.query.perPage || 15),
    order:[
      ['updatedAt', "DESC"]
    ]
  }).then(function(wechatreplies) {
    result = helpers.setPagination(wechatreplies, req)
    res.render('admin/wechatreplies/index', { wechatreplies: result })
  })
})

admin.get('/wechatreplies/new', function(req, res) {
  var reply = models.WechatReply.build()
  res.render('admin/wechatreplies/form', { reply: reply, path: '/admin/wechatreply', method: 'POST' })
})


admin.post('/wechatreply', function(req, res) {
  var params = {
      key: req.body.key,
      content: req.body.content
    }

  if(req.body.isActive){
    params['isActive'] = true
  }else{
    params['isActive'] = false
  }
  models.WechatReply.build(params).save().then(function(reply){
    req.flash('success', "create success")
    res.redirect('/admin/wechatreplies/'+ reply.id +'/edit')
  }).catch(function(err){
    console.log(err)
    res.redirect('/500')
  })

})

admin.get('/wechatreplies/:id/edit', function(req, res) {
  models.WechatReply.findById(req.params.id).then(function(reply) {
    console.log(reply)
    res.render('admin/wechatreplies/form', { reply: reply, path: '/admin/wechatreply/' + reply.id, method: 'POST' })
  })
})

admin.post('/wechatreply/:id', function(req, res) {

  async.waterfall([function(next) {
    models.WechatReply.findById(req.params.id).then(function(reply) {
      next(null, reply)
    }).catch(function(err) {
      next(err)
    })
  }, function(reply, next) {

    var params = {
      key: req.body.key,
      content: req.body.content
    }

    if(req.body.isActive){
      params['isActive'] = true
    }else{
      params['isActive'] = false
    }

    reply.updateAttributes(params).then(function(reply) {
      next(null, reply)
    }).catch(function(err) {
      next(err)
    })

  }], function(err, reply) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      req.flash('success', 'update success')
      res.redirect('/admin/wechatreplies/'+ reply.id +'/edit')
    }

  })

})


module.exports = admin;