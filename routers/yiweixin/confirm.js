var express = require('express');
var app = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var requireLogin = helpers.requireLogin
var config = require("../../config")
var WechatAPI = require('wechat-api');
var formidable = require('formidable')

var api = helpers.API

function confirmOrder(params, isDone, msg, pass){
    async.waterfall([function(next) {
      models.ExtractOrder.findOne({
        where: params
      }).then(function(extractorder) {
        if(extractorder){
          next(null, extractorder)
        }else{
          pass(null)
          return
        }
      }).catch(function(err) {
        next(err)
      })
    }, function(extractorder, next){
      if(extractorder.customerId){  // 正规充值
        extractorder.getCustomer().then(function(customer) {
          next(null, extractorder, customer)
        }).catch(function(err) {
          next(err)
        })
      }else{  // 流量任务奖励
        next(null, extractorder, null)
      }
    }, function(extractorder, customer, next){
      var status = models.ExtractOrder.STATE.FAIL
      if(isDone){
        status = models.ExtractOrder.STATE.FINISH
        bindCustomerPhone(customer, extractorder.phone)
        next(null, extractorder, status)
      }else{
        if(customer){
          customer.refundTraffic(models, extractorder, msg, function(customer, extractorder, flowHistory) {

            // send notice
            sendRefundNotice(customer, extractorder, msg)

            next(null, extractorder, status)
          }, function(err) {
            next(err)
          })
        }else{
          next(null, extractorder, status)
        }
      }
    }, function(extractorder, status, next) {
      extractorder.updateAttributes({
        state: status
      }).then(function(extractorder) {
        next(null, extractorder)
      }).catch(function(err) {
        next(err)
      })
    }, function(extractorder, next) {
      extractorder.getExchanger().then(function(exchanger) {
        if(exchanger.className() === 'TrafficPlan'){
          next(null, extractorder, exchanger)
        }else{
          exchanger.getTrafficPlan().then(function(trafficPlan) {
            next(null, extractorder, trafficPlan)
          }).catch(function(err) {
            next(err)
          })
        }
      }).catch(function(err) {
        next(err)
      })
    }, function(extractorder, trafficPlan, next) {
      if(extractorder.status === models.ExtractOrder.STATE.FINISH){
        models.MessageQueue.sendRechargeMsg(models, trafficPlan, extractorder.phone, function(messageQueue) {
          next(null, extractorder)
        }, function(err) {
          next(err)
        })
      }else{
        next(null, extractorder)
      }
    }], function(err, extractorder){
        if(err){
          console.log(err)
        }
        pass(null)
    })
}

function bindCustomerPhone(customer, phone, pass){
  if(!customer.phone){
    customer.updateAttributes({
      phone: phone,
      bindPhone: true
    }).then(function(customer){
    }).catch(function(err){
      console.log(err)
    })
  }
}

function sendRefundNotice(customer, extractOrder, resean){

  async.waterfall([function(next) {

    extractOrder.getTrafficPlan().then(function(trafficPlan) {
      extractOrder.trafficPlan = trafficPlan
      next(null, trafficPlan)
    }).catch(function(err) {
      next(err)
    })

  }, function(trafficPlan, next) {
    if(extractOrder.chargeType == models.Customer.CHARGETYPE.BALANCE){
      var content = "订单：{{orderid}}, 您充值的{{name}}套餐充值失败, 充值号码{{phone}}，原因: {{resean}}。 凭此信息联系客服退还费用 {{value}}。感谢您使用, 对您造成的不便我们万分抱歉"
    }else{
      var content = "订单：{{orderid}}, 您充值的{{name}}套餐充值失败, 充值号码{{phone}}，原因: {{resean}}。 {{value}}分销奖励已经返回您的账户，感谢您使用, 对您造成的不便我们万分抱歉"
    }
    models.MessageTemplate.findOrCreate({
        where: {
          name: "sendRefundNotice"
        },
        defaults: {
          content: content
        }
      }).spread(function(template) {
        var content = template.content.format({ orderid: extractOrder.id, name: trafficPlan.name, phone: extractOrder.phone, resean: resean, value: extractOrder.total })
        next(null, content)
      }).catch(function(err) {
        next(err)
      })

  }, function(content, next) {
    api.sendText(customer.wechat, content, function(err, result) {
      if(err){
        next(err)
      }else{
        next(null, result)
      }
    });
  }], function(err, result) {
    if(err){
      console.log(err)
    }else{
      console.log(result)
    }
  })
}

app.post("/dazhongconfirm", function(req, res){
  console.log(req.body)
  var data = req.body

  confirmOrder({
    id: data.out_trade_no,
    state: models.ExtractOrder.STATE.SUCCESS
  }, data.return_code == "FINISH", data.return_msg, function(err){
    if(err){
      console.log(err)
      res.json({success: false})
    }else{
      res.json({success: true})
    }
  })
})

app.get("/huadongconfirm", function(req, res){
  console.log(req.query)
  var data = req.query

  confirmOrder({
    taskid: data.charge_num,
    state: models.ExtractOrder.STATE.SUCCESS
  }, data.status == "1", "", function(err){
    if(err){
      console.log(err)
      res.json({success: false})
    }else{
      res.json({success: true})
    }
  })
})

app.post("/omsconfirm", function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    console.log(fields)
    confirmOrder({
      taskid: fields.order_number,
      state: models.ExtractOrder.STATE.SUCCESS
    }, fields.shipping_status == '4', fields.shipping_status_message, function(err){
      if(err){
        console.log(err)
        res.json({success: false})
      }else{
        res.json({success: true})
      }
    })
  })
})

app.post("/gdsjllconfirm", function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    console.log(fields)
    confirmOrder({
      taskid: fields.order_id,
      state: models.ExtractOrder.STATE.SUCCESS
    }, fields.errcode == '0', fields.errmsg + "; " + fields.order_errormsg, function(err){
      if(err){
        console.log(err)
        res.json({success: false})
      }else{
        res.json({success: true})
      }
    })
  })
})

app.post("/ytconfirm", function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    confirmOrder({
      id: fields.order_sn,
      state: models.ExtractOrder.STATE.SUCCESS
    }, fields.errcode !== 4, fields.fail_msg, function(err){
      if(err){
        console.log(err)
        res.json({success: false})
      }else{
        res.json({success: true})
      }
    })
  })
})

app.post("/sdconfirm", function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    confirmOrder({
      id: fields.order_sn,
      state: models.ExtractOrder.STATE.SUCCESS
    }, fields.errcode !== 4, fields.fail_msg, function(err){
      if(err){
        console.log(err)
        res.json({success: false})
      }else{
        res.json({success: true})
      }
    })
  })
})


module.exports = app;