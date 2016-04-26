var express = require('express');
var admin = express.Router();
var models  = require('../../models');

admin.get('/login', function(req, res){
  if(req.query.to){
    backTo = new Buffer(req.query.to, "base64").toString()
  }
  res.render('admin/login', { layout: 'sign', backTo: req.query.to })
})

admin.post('/login', function(req, res) {
  models.User.findOne({ where: {username: req.body.username} }).then(function(user){
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

module.exports = admin;