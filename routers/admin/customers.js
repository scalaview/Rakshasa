var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var _ = require('lodash')
var config = require("../../config")

var maxDepth = config.max_depth

admin.get('/customers', function(req, res) {
  var params = {}
  if(req.query.phone !== undefined && req.query.phone.present()){
    params = _.merge(params, { phone: { $like: "%{{phone}}%".format({ phone: req.query.phone }) } })
  }
  if(req.query.id !== undefined && req.query.id.present()){
    params = _.merge(params, { id: req.query.id })
  }
  async.waterfall([function(next){
    models.Customer.findAndCountAll({
      where: params,
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15),
      order: [
          ['createdAt', 'DESC']
        ]
    }).then(function(customers) {
      var result = helpers.setPagination(customers, req)
      next(null, result)
    }).catch(function(err){
      next(err)
    })
  }, function(result, next){
    models.Level.findAll().then(function(levels){
      next(null, result, levels || [])
    }).catch(function(err){
      next(err)
    })
  }], function(err, result, levels){
    res.render('admin/customers/index', { customers: result, query: req.query, levels: levels })
  })
})

admin.get("/customers/:id", function(req, res) {
  async.waterfall([function(next) {
    models.Customer.findById(req.params.id).then(function(customer) {
      if(customer){
        next(null, customer)
      }else{
        res.send(404)
      }
    }).catch(function(err) {
      next(err)
    })
  }, function(customer, next){
    models.Level.findAll().then(function(levels) {
      var levelCollection = []
        for (var i = 0; i < levels.length; i++) {
          levelCollection.push([ levels[i].id, levels[i].name ])
          if(customer.levelId != undefined && levels[i].id === customer.levelId){
            customer.level = levels[i]
          }
        };

      next(null, customer, levelCollection)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, customer, levelCollection) {
    if(err){
      console.log(err)
      res.send(500)
    }else{
      var levelOptions = { name: 'levelId', class: 'select2 col-xs-12 col-lg-12', includeBlank: true }
      res.render("admin/customers/show", {
          customer: customer,
          levelCollection: levelCollection,
          levelOptions: levelOptions
        })
    }
  })

})

admin.post("/customer/:id", function(req, res) {
  async.waterfall([function(next) {
    models.Customer.findById(req.params.id).then(function(customer) {
      if(customer){
        next(null, customer)
      }else{
        next(new Error("not found"))
      }
    }).catch(function(err) {
      next(err)
    })
  }, function(customer, next) {

    if(req.body.allowGiven !== undefined && req.body.allowGiven.present()){
      var allowGiven = true
    }else{
      var allowGiven = false
    }

    customer.updateAttributes({
      levelId: req.body.levelId ? req.body.levelId : null,
      allowGiven: allowGiven
    }).then(function(customer) {
      next(null, customer)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, customer) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      req.flash('info', "update success")
      res.redirect('/admin/customers/' + customer.id)
    }
  })
})

admin.post("/customer/traffic/:id", function(req, res) {
  var type = req.body.type,
      amount = parseInt(req.body.num)
  async.waterfall([function(next) {
    models.Customer.findById(req.params.id).then(function(customer) {
      if(customer){
        models.FlowHistory.build({
          customerId: customer.id,
          state: type,
          amount: amount,
          comment: req.body.comment
        }).save().then(function(flowhistory) {
          next(null, customer, flowhistory)
        }).catch(function(err) {
          next(err, customer)
        })

      }else{
        next(new Error('no customer found'))
      }
    })
  }, function(customer, flowhistory, next) {
    if(type == '1') {
      var value = customer.remainingTraffic + amount
    }else if (customer.remainingTraffic >= amount){
      var value = customer.remainingTraffic - amount
    }
    customer.updateAttributes({
      remainingTraffic: value
    }).then(function(customer) {
      next(null, customer)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, customer, flowhistory) {
    if(err){
      console.log(err)
      req.flash('err', err.message)
      res.redirect('/admin/customers/' + customer.id)
    }else{
      req.flash('info', "update success")
      res.redirect('/admin/customers/' + customer.id)
    }
  })
})

admin.get('/contribution', function(req, res) {

  async.waterfall([function(next) {

    var params = {}
    if(req.query.phone !== undefined && req.query.phone.present()){
      params = _.merge(params, { phone: { $like: "%{{phone}}%".format({ phone: req.query.phone }) } })
    }
    models.Customer.findAndCountAll({
      where: params,
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15)
    }).then(function(customers) {
      next(null, customers)
    })

  }, function(customers, pass) {

    async.map(customers.rows, function(customer, next) {

      var originList = customer.getAncestry()
      if(!originList || originList.length <= 0){
        next(null, customer)
        return
      }
      var list_c =[];
      var list = [];
      for (var i = 0; i < originList.length; i++) {
        list_c.push( originList[i] )
      };

      list_c = list_c.compact();
      var list_length = maxDepth>originList.length?originList.length:maxDepth;
      list = list_c.slice(0,list_length);

      models.Customer.findAll({
        where: [ 'id IN (?)', list_c ],
        order: [
          ["ancestryDepth", "DESC"]
        ]
      }).then(function(ancestries) {
        var ancestries_length = maxDepth>ancestries.length?ancestries.length:maxDepth;
        for (var i = 0; i < ancestries_length; i++) {
          customer['parent_'+i] = ancestries[i]
        };

        // count

        var reverseList = list.reverse().map(function(value, index) {
          return {index: index, id: value}
        })
        async.each(reverseList, function(map, go) {
          var index = map.index,
              id = map.id

          models.FlowHistory.sum('amount', {
            where: {
              type: 'Customer',
              typeId: customer.id,
              state: models.FlowHistory.STATE.ADD,
              trafficType: models.FlowHistory.TRAFFICTYPE.SALARY,
              customerId: id
            }
          }).then(function(sum) {
            customer['parent_sum_'+index] = sum || 0
            go(null, customer)
          })

        }, function(err){
          if(err){
            next(err)
          }else{
            next(null, customer)
          }
        })

        // count

      })

    }, function(err, result) {
      if(err){
        pass(err)
      }else{
        customers.rows = result
        pass(null, customers)
      }
    })

  }], function(err, customers) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      var result = helpers.setPagination(customers, req)
      res.render('admin/customers/contribution', { customers: result, query: req.query })
    }
  })

})

admin.get('/devote', function(req, res) {

  async.waterfall([function(next) {

    var params = {}
    if(req.query.phone !== undefined && req.query.phone.present()){
      params = _.merge(params, { phone: { $like: "%{{phone}}%".format({ phone: req.query.phone }) } })
    }
    models.Customer.findAndCountAll({
      where: params,
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15)
    }).then(function(customers) {
      next(null, customers)
    })

  }, function(customers, pass) {

    async.map(customers.rows, function(customer, next){

      helpers.getSlaves(customer, function(err, customer, result) {
        if(err){
          next(err)
        }else{
          next(null, { customer: customer, result: result })
        }
      })

    }, function(err, map) {
      if(err){
        pass(err)
      }else{
        customers.rows = map
        pass(null, customers)
      }
    })


  }], function(err, customers) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      var result = helpers.setPagination(customers, req)
      res.render('admin/customers/devote', { customers: result, query: req.query })
    }
  })

})


module.exports = admin;