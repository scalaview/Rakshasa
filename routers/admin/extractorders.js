var express = require('express');
var admin = express.Router();
var models  = require(process.env.PWD + '/models')
var helpers = require(process.env.PWD + "/helpers")
var async = require("async")
var _ = require('lodash')
var config = require(process.env.PWD + "/config")
var autoCharge = helpers.autoCharge
var recharger = require("../../recharger")

admin.get("/extractorders", function(req, res) {
  var result;
  async.waterfall([function(next) {
    var params = {}
    if(req.query.phone !== undefined && req.query.phone.present()){
      params = _.merge(params, { phone: { $like: "%{{phone}}%".format({ phone: req.query.phone }) } })
    }
    if(req.query.state !== undefined && req.query.state.present()){
      params = _.merge(params, { state: req.query.state })
    }
    if(req.query.exchangerType !== undefined && req.query.exchangerType.present()){
      params = _.merge(params, { exchangerType: req.query.exchangerType })
    }
    params["productType"] = models.TrafficPlan.PRODUCTTYPE["traffic"]
    models.ExtractOrder.findAndCountAll({
      where: params,
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15),
      order: [
        ['updatedAt', 'DESC']
      ]
    }).then(function(extractOrders) {
      result = extractOrders
      next(null, extractOrders.rows)
    }).catch(function(err) {
      next(err)
    })
  }, function(extractOrders, outnext) {
    async.map(extractOrders, function(extractOrder, next) {
      extractOrder.getExchanger().then(function(exchanger){
        if(exchanger){
          extractOrder.exchanger = exchanger
          if(exchanger.className() === "TrafficPlan"){
            extractOrder.trafficPlan = exchanger
          }else if(exchanger.className() === "FlowTask"){
            extractOrder.flowtask = exchanger
          }
        }
        next(null, extractOrder)
      }).catch(function(err) {
        next(err)
      })
    }, function(err, extractOrders){
      if(err){
        outnext(err)
      }else{
        outnext(null, extractOrders)
      }
    })
  }, function(extractOrders, outnext) {
    async.map(extractOrders, function(extractOrder, next) {
      extractOrder.getCustomer().then(function(customer){
        extractOrder.customer = customer
        next(null, extractOrder)
      }).catch(function(err) {
        next(err)
      })
    }, function(err, extractOrders){
      if(err){
        outnext(err)
      }else{
        outnext(null, extractOrders)
      }
    })
  }], function(err, extractOrders) {
    if(err){
      console.log(err)
      res.send(500)
    }else{
      var stateOptions = { name: 'state', class: "select2 col-lg-12 col-xs-12", includeBlank: true },
          stateCollection = [],
          exchangerTypeOptions = { name: 'exchangerType', class: "select2 col-lg-12 col-xs-12", includeBlank: true },
          exchangerTypeCollection = [ [ 'TrafficPlan', '充值' ], [ 'FlowTask', '流量任务' ] ]

      for (var key in models.ExtractOrder.STATE) {
        stateCollection.push([models.ExtractOrder.STATE[key] , key])
      };

      result.rows = extractOrders
      result = helpers.setPagination(result, req)
      res.render('admin/extractorders/index', {
        extractOrders: result,
        query: req.query,
        stateOptions: stateOptions,
        stateCollection: stateCollection,
        exchangerTypeOptions: exchangerTypeOptions,
        exchangerTypeCollection: exchangerTypeCollection
      })
    }
  })
})


admin.get("/extractorders/new", function(req, res) {
  async.waterfall([function(next){
    models.TrafficPlan.scope("forSelect").findAll().then(function(trafficPlans) {
      next(null, trafficPlans)
    }).catch(function(err) {
      next(err)
    })
  }, function(trafficPlans, outnext) {
    async.map(trafficPlans, function(trafficPlan, next) {
      next(null, [trafficPlan.id, trafficPlan.name])
    }, function(err, trafficPlanCollection) {
      outnext(null, trafficPlanCollection)
    })
  }], function(err, trafficPlanCollection) {
    var extractOrder = models.ExtractOrder.build({}),
        trafficPlanOptions = { name: 'trafficPlanId', id: 'trafficPlanId', class: 'select2 col-lg-12 col-xs-12' }
    res.render("admin/extractorders/new", {
      extractOrder: extractOrder,
      trafficPlanOptions: trafficPlanOptions,
      trafficPlanCollection: trafficPlanCollection,
      path: '/admin/extractorder'
    })
  })
})

admin.post("/extractorder", function(req, res) {
  if(!( req.body.phone !== undefined && req.body.phone.present() && req.body.trafficPlanId !== undefined &&  req.body.trafficPlanId.present() )){
    res.format({
      html: function(){
        res.redirect("/admin/extractorders/new")
        return
      },
      json: function(){
        res.json({
          code: 1,
          msg: "参数错误"
        });
        return
      },
      default: function() {
        res.status(406).send('Not Acceptable');
        return
      }
    });
    return
  }
  async.waterfall([function(next) {
    models.TrafficPlan.findById(req.body.trafficPlanId).then(function(trafficPlan) {
      if(trafficPlan){
        next(null, trafficPlan)
      }else{
        next(new Error("请选择正确的流量包"))
      }
    }).catch(function(err) {
      next(err)
    })
  }, function(trafficPlan, next){
    models.ExtractOrder.build({
      exchangerType: trafficPlan.className(),
      exchangerId: trafficPlan.id,
      phone: req.body.phone,
      cost: req.body.cost,
      value: trafficPlan.value,
      bid: trafficPlan.bid,
      type: trafficPlan.type,
      chargeType: "terminal",
      extend: req.body.extend,
      productType: models.TrafficPlan.PRODUCTTYPE["traffic"]
    }).save().then(function(extractOrder) {
      next(null, extractOrder, trafficPlan)
    }).catch(function(err) {
      next(err)
    })
  }, function(extractOrder, trafficPlan, next){
    autoCharge(extractOrder, trafficPlan, function(err){
      if(err){
        next(err)
      }else{
        next(null, extractOrder, trafficPlan)
      }
    })
  }], function(err, extractOrder, trafficPlan) {
    if(err){
      console.log(err)
      res.format({
        html: function(){
          req.flash('err', err.message)
          res.redirect("/admin/extractorders/new")
          return
        },
        json: function(){
          res.json({
            code: 1,
            msg: err.message
          });
          return
        },
        default: function() {
          res.status(406).send('Not Acceptable');
          return
        }
      });
    }else{
      res.format({
        html: function(){
          req.flash('info', "create success")
          res.redirect("/admin/extractorders/" + extractOrder.id + "/edit")
          return
        },
        json: function(){
          res.json({
            code: 0,
            msg: "成功"
          });
          return
        },
        default: function() {
          res.status(406).send('Not Acceptable');
          return
        }
      });
    }
  })

})


admin.get("/extractorders/:id/edit", function(req, res){
  async.waterfall([function(next) {
    models.ExtractOrder.findById(req.params.id).then(function(extractOrder) {
      next(null, extractOrder)
    }).catch(function(err){
      next(err)
    })
  }, function(extractOrder, next){
    if(extractOrder.exchangerType === "TrafficPlan"){
      models.TrafficPlan.scope("forSelect").findAll().then(function(trafficPlans) {
        next(null, extractOrder, trafficPlans)
      }).catch(function(err) {
        next(err)
      })
    }else{
      extractOrder.getExchanger().then(function(flowtask){
        extractOrder.flowtask = flowtask
        next(null, extractOrder, null)
      })
    }
  }, function(extractOrder, trafficPlans, outnext) {
    if(trafficPlans === null){
      outnext(null, extractOrder, null)
    }
    async.map(trafficPlans, function(trafficPlan, next) {
      next(null, [trafficPlan.id, trafficPlan.name])
    }, function(err, trafficPlanCollection) {
      outnext(null, extractOrder, trafficPlanCollection)
    })
  }], function(err, extractOrder, trafficPlanCollection) {
    var trafficPlanOptions = { name: 'trafficPlanId', id: 'trafficPlanId', class: 'select2 col-lg-12 col-xs-12' },
        stateOptions = { name: 'state', id: 'state', class: 'select2 col-lg-12 col-xs-12' }
    res.render("admin/extractorders/edit", {
      extractOrder: extractOrder,
      trafficPlanOptions: trafficPlanOptions,
      trafficPlanCollection: trafficPlanCollection,
      stateCollection: models.ExtractOrder.STATEARRAY,
      stateOptions: stateOptions,
      failState: models.ExtractOrder.STATE.FAIL,
      path: '/admin/extractOrder/'+extractOrder.id
    })
  })
})

admin.post("/extractorder/:id", function(req, res) {
  if(!( req.body.phone !== undefined && req.body.phone.present() && req.body.trafficPlanId !== undefined &&  req.body.trafficPlanId.present() )){
    res.redirect("/admin/extractorders/" + req.params.id + "/edit")
    return
  }
  async.waterfall([function(next) {
    models.ExtractOrder.findById(req.params.id).then(function(extractOrder) {
      next(null, extractOrder)
    }).catch(function(err){
      next(err)
    })
  }, function(extractOrder, next) {
    models.TrafficPlan.findById(req.body.trafficPlanId).then(function(trafficPlan) {
      if(trafficPlan){
        next(null, extractOrder, trafficPlan)
      }else{
        next(new Error("请选择正确的流量包"))
      }
    }).catch(function(err) {
      next(err)
    })
  }, function(extractOrder, trafficPlan, next){
    extractOrder.updateAttributes({
      exchangerId: trafficPlan.id,
      phone: req.body.phone,
      cost: req.body.cost,
      value: trafficPlan.value,
      extend: req.body.extend,
      state: req.body.state,
      transactionId: req.body.transactionId,
      taskid: req.body.taskid
    }).then(function(extractOrder) {
      next(null, extractOrder)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, extractOrder) {
    if(err){
      console.log(err)
      req.flash('err', err.message)
    }else{
      req.flash('info', 'update success')
    }
    res.redirect("/admin/extractorders/" + extractOrder.id + "/edit")
  })
})


admin.post("/extractorder/:id/refund", function(req, res){
  async.waterfall([function(next){
    models.ExtractOrder.findById(req.params.id).then(function(extractOrder) {
      next(null, extractOrder)
    }).catch(function(err){
      next(err)
    })
  }, function(extractOrder, next){
    if(extractOrder.state == models.ExtractOrder.STATE.FAIL){
      var payment = helpers.payment,
          total_amount = Math.round(extractOrder.total * 100).toFixed(0),
          refund = {
            out_trade_no: extractOrder.out_trade_no,
            out_refund_no: "refund_" + extractOrder.out_trade_no,
            total_fee: total_amount,
            refund_fee: total_amount
          }
      console.log(refund)
      payment.refund(refund, function(err, result){
        if(err){
          next(err)
        }else{
          extractOrder.updateAttributes({
            state: models.ExtractOrder.STATE.REFUNDED
          }).then(function(extractOrder){
            next(null, extractOrder)
          }).catch(function(err){
            next(err)
          })
        }
      });
    }else{
      next(new Error("no permission"))
    }
  }], function(err, extractOrder){
    if(err){
      console.log(err)
      res.json({err: 1, message: err.message})
    }else{
      res.json({message: "refund success"})
    }
  })
})


admin.get("/syncorderdetail", function(req, res){
  async.waterfall([function(next){
    models.ExtractOrder.findAll({
      where: {
        state: models.ExtractOrder.STATE.SUCCESS,
        type: {
          $ne: 0
        }
      }
    }).then(function(extractOrders){
      next(null, extractOrders)
    }).catch(function(err){
      next(err)
    })
  }, function(extractOrders, pass){
    async.each(extractOrders, function(extractOrder, next){
      var detail = recharger.XinhaobaOrderDetail(extractOrder.id, extractOrder.taskid, extractOrder.bid, extractOrder.phone)
      if(detail){
        detail.then(function(data){
          console.log(data)
          switch(data.code){
            case '1':
              extractOrder.updateAttributes({
                state: models.ExtractOrder.STATE.FINISH
              })
              break;
            case '20':
              extractOrder.updateAttributes({
                state: models.ExtractOrder.STATE.FAIL
              })
              break;
            default:
              console.log("extractOrder: " + extractOrder.id + " sync code: " + data.code + ", " + data.msg)
          }
          console.log("extractOrder: " + extractOrder.id + " sync code: " + data.code + ", " + data.msg)
          next(null)
        })
      }else{
        next(null)
      }
    }, function(err){
      if(err){
        pass(err)
      }else{
        pass(null)
      }
    })
  }], function(err){
    if(err){
      console.log(err)
      req.flash('err', err.message)
    }else{
      req.flash('info', "sync success")
    }
    res.redirect('/admin/extractorders')
  })
})


module.exports = admin;