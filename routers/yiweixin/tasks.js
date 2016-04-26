var express = require('express');
var app = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var requireLogin = helpers.requireLogin

app.get('/tasks', function(req, res) {
  var tasks = models.FlowTask.scope('active', 'defaultSort').findAll().then(function(tasks) {
    res.render('yiweixin/flowtasks/index', { tasks: tasks })
  }).catch(function(err) {
      console.log(err)
      res.redirect('/500')
  })
})

app.get('/tasks/:id', function(req, res) {
  models.FlowTask.findById(req.params.id).then(function(flowtask) {
    res.render('yiweixin/flowtasks/show', { task: flowtask})
  })
})


app.get('/givento', requireLogin, function(req, res) {
  var customer = req.customer

  res.render('yiweixin/orders/givento', { customer: customer})
})


app.post('/givento', requireLogin, function(req, res) {
  var customer = req.customer,
      otherId = req.body.otherId

  if(!customer.allowGiven){
    res.json({ code: 0, msg: "抱歉，您的转赠功能被限制，请联系客服咨询，对您的不便我们深表抱歉"})
    return
  }

  async.waterfall([function(next) {
    models.Customer.findOne({
      where: {
        phone: req.body.phone
      }
    }).then(function(otherone) {
      if(otherone){
        if(otherone.id == customer.id){
          next(new Error("转赠方不能是本人"))
        }else{
          next(null, otherone)
        }
      }else{
        next(new Error("customer not found"))
      }
    }).catch(function(err) {
      next(err)
    })
  }, function(otherone, next) {
    customer.givenTo(models, otherone, parseInt(req.body.amount), function(){
      next(null)
    }, function(err) {
      next(err)
    })
  }], function(err) {
    if(err){
      res.json({ code: 0, msg: "转赠方不能是本人或者找不到当前用户" })
    }else{
      res.json({ code: 1, msg: "转赠成功", url: '/profile'})
    }
  })
})

module.exports = app;