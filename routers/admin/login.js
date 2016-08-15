var express = require('express');
var admin = express.Router();
var models  = require('../../models');
var recharger = require("../../recharger")
var Xinhaoba = recharger.Xinhaoba
var Dazhong = recharger.Dazhong
var Liuliangtong = recharger.Liuliangtong

admin.get('/login', function(req, res){
  if(req.query.to){
    backTo = new Buffer(req.query.to, "base64").toString()
  }
  res.render('admin/login', { layout: 'sign', backTo: req.query.to })
})

admin.post('/login', function(req, res) {
  models.User.findOne({ where: {username: req.body.username} }).then(function(user){
    console.log('== db user:%s',user.username)
    if(user && user.verifyPassword(req.body.password)){
      req.session.user_id = user.id
      if(req.body.to){
        var backTo = new Buffer(req.body.to, "base64").toString()
        res.redirect(backTo)
      }else{
        res.redirect('/admin')
      }
    }else{
      var message
      if(user){
        message = 'password error'
      }else{
        message = 'register new user'
      }
      res.render('admin/login', {
       locals: {message: message},
       layout: 'sign'
      })
    }
  })
})

admin.get('/logout', function(req, res) {
  req.session.user_id = null
  res.redirect('/admin/login')
})


// 测试流量通接口
admin.get('/testLiuliangtong', function (req, res) {
  var orderId = 1;
  var llt = new Liuliangtong(orderId++,'18320376671',10)
      .then(function (response, data) {
        console.log("test llt data ",data.Code)
        res.json(data)
        res.end()
      })
      .catch(function (err) {
        console.log("test llt err ",err)
        res.json(err)
        res.end()
      })

  llt.do()
})

module.exports = admin;