var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var _ = require('lodash')

admin.get("/sellers", function(req, res) {
  var params = {}
  if(req.query.name !== undefined && req.query.name.present()){
    params = _.merge(params, { name: { $like: "%{{name}}%".format({ name: req.query.name }) } })
  }
  models.Seller.findAndCountAll({
    where: params,
    limit: req.query.perPage || 15,
    offset: helpers.offset(req.query.page, req.query.perPage || 15)
  }).then(function(sellers) {
    sellers = helpers.setPagination(sellers, req)
    res.render("admin/sellers/index", { sellers: sellers, query: req.query })
  })
})


admin.get("/sellers/:id/edit", function(req, res) {
  models.Seller.findById(req.params.id).then(function(seller) {
    res.render("admin/sellers/edit", { seller: seller, path: "/admin/seller/" + seller.id })
  })
})

admin.get("/sellers/new", function(req, res) {
  var seller = models.Seller.build()

  res.render("admin/sellers/new", { seller: seller, path: "/admin/seller" })
})

admin.post("/seller", function(req, res) {
  var seller = models.Seller.build(req.body)
  seller.generatAccessToken()
  seller.save().then(function(seller) {
    res.redirect("/admin/sellers/"+ seller.id +"/edit")
  }).catch(function(err){
    if(err){
      console.log(err)
      req.flash('err', err.message)
    }else{
      req.flash('info', "create success")
    }
    res.render("admin/sellers/new", { seller: seller, path: "/admin/seller" })
  })
})

admin.post("/seller/:id", function(req, res) {

  async.waterfall([function(next) {
    models.Seller.findById(req.params.id).then(function(seller) {
      next(null, seller)
    })
  }, function(seller, next) {
    seller.updateAttributes(req.body).then(function(seller) {
      next(null, seller)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, seller) {
    if(err){
      console.log(err)
      req.flash("err", err.message)
      res.render("admin/sellers/edit", { seller: seller, path: "/admin/seller/" + seller.id })
    }else{
      req.flash("info", "update success")
      res.redirect("/admin/sellers/{{id}}/edit".format({ id: seller.id }))
    }
  })

})


admin.get("/sellers/:id/reset", function(req, res){
  async.waterfall([function(next) {
    models.Seller.findById(req.params.id).then(function(seller) {
      seller.generatAccessToken()
      seller.save().then(function(seller){
        next(null, seller)
      })
    }).catch(function(err){
      next(err)
    })
  }], function(err, seller){
    if(err){
      console.log(err)
      res.json({ err: 1, msg: "重置token出错"})
    }else{
      res.json({ err: 0, msg: "重置token成功", token: seller.accessToken })
    }
  })
})

module.exports = admin;