var express = require('express');
var app = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var requireLogin = helpers.requireLogin
var config = require("../../config")
var fs        = require('fs');
var Payment = require('wechat-pay').Payment;
var initConfig = {
  partnerKey: config.partnerKey,
  appId: config.appId,
  mchId: config.mchId,
  notifyUrl: "http://" + config.hostname + "/orderconfirm",
  pfx: fs.readFileSync(process.env.PWD + '/cert/apiclient_cert.p12')
};
var payment = new Payment(initConfig);
var _ = require('lodash')

/**
 * 充值余额-页面
 */
app.get('/payment', requireLogin, function(req, res) {
  var customer = req.customer
  async.waterfall([function(next){
    models.DataPlan.allOptions(function(dataPlans) {
      next(null, dataPlans)
    }, function(err) {
      next(err)
    })
  }], function(err, dataPlans) {
    if(err){
      console.log(err)
    }else{
      res.render('yiweixin/orders/payment', { customer: customer, dataPlans: dataPlans })
    }
  })
})

/**
 * 订单-页面
 */
app.get('/orderPage', requireLogin, function (req, res) {
  var customer = req.customer
  var tranfficplanId = req.query.tranfficplanId
  var tel = req.query.tel
 console.log(tranfficplanId,tel)
  async.waterfall([function(next){
    models.TrafficPlan.findById(tranfficplanId).then(function(trafficPlan){
      if(trafficPlan){
        next(null, trafficPlan)
      }else{
        res.json({ err: 1, msg: "请选择正确的套餐" })
      }
    }).catch(function(err) {
      next(err)
    })
  },function(trafficgroups, next){ //
    models.DConfig.findOne({
      where: {
        name: "exchangeRate"
      }
    }).then(function(dConfig){
      next(null, trafficgroups, dConfig)
    }).catch(function(err){
      next(err)
    })
  }], function(err, trafficPlan, dConfig) {
    if(err){
      console.log(err)
    }else{
      res.render('yiweixin/orders/orderPage',
          { customer: customer, trafficPlan: trafficPlan, tel : tel,exchangeRate: (dConfig ? dConfig.value : 1), layout: 'orderPage' })
    }
  })
})

/**
 * 支付通用套餐
 */
app.post('/wechat-order', requireLogin, function(req, res) {
    var customer = req.customer
    async.waterfall([function(next){
      if(customer.levelId !== undefined){
        models.Level.findById(customer.levelId).then(function(level) {
          customer.level = level
        })
      }
      next(null, customer)
    }, function(customer, next) {
      models.PaymentMethod.findOne({ where: { code: req.body.paymentMethod.toLowerCase() } }).then(function(paymentMethod) {
        if(paymentMethod){
          next(null, paymentMethod);
        }else{
          res.json({ err: 1, msg: "找不到支付方式" })
        }
      }).catch(function(err){
        next(err)
      })
    }, function(paymentMethod, next){
      models.DataPlan.findById(req.body.dataPlanId).then(function(dataPlan){
        if(dataPlan){
          next(null, paymentMethod, dataPlan)
        }else{
          res.json({ err: 1, msg: "请选择合适的套餐" })
        }
      }).catch(function(err) {
        next(err)
      })
    }, function(paymentMethod, dataPlan, next){
      models.Order.findOne({
        where: {
          state: models.Order.STATE.INIT,
          customerId: customer.id,
          dataPlanId: dataPlan.id,
          paymentMethodId: paymentMethod.id,
          total: dataPlan.price
        }
      }).then(function(order){
        if(order){
          next(null, paymentMethod, dataPlan, order)
        }else{
          models.Order.build({
            state: models.Order.STATE.INIT,
            customerId: customer.id,
            dataPlanId: dataPlan.id,
            paymentMethodId: paymentMethod.id,
            total: dataPlan.price
          }).save().then(function(order){
            next(null, paymentMethod, dataPlan, order)
          }).catch(function(err){
            next(err)
          })
        }
      }).catch(function(err){
        next(err)
      })


    }], function(error, paymentMethod, dataPlan, order){
      if(error){
        console.log(error)
        res.json({ err: 1, msg: "server error" })
      }else{
        var ipstr = req.ip.split(':'),
          ip = ipstr[ipstr.length -1]

        var orderParams = {
          body: '流量套餐 ' + dataPlan.name,
          attach: order.id,
          out_trade_no: config.token + "_" + dataPlan.id + "_" + Math.round(order.total * 100),
          total_fee:  Math.round(order.total * 100),
          spbill_create_ip: ip,
          openid: customer.wechat,
          trade_type: 'JSAPI'
        };

        console.log(orderParams)
        payment.getBrandWCPayRequestParams(orderParams, function(err, payargs){
          if(err){
            console.log("payment fail")
            console.log(err)
            res.json({err: 1, msg: 'payment fail'})
          }else{
            console.log(payargs)
            res.json(payargs);
          }
        });
      }
    })
})

var middleware = require('wechat-pay').middleware;
app.use('/orderconfirm', middleware(initConfig).getNotify().done(function(message, req, res, next) {
  console.log(message)

  var orderId = message.attach

  async.waterfall([function(next) {
    models.Order.findById(orderId).then(function(order) {
      if(order){
        next(null, order)
      }else{
        next(new Error('order not found'))
      }
    }).catch(function(err) {
      next(err)
    })
  }, function(order, next){
    if(message.result_code === 'SUCCESS' && !order.isPaid()){
      order.updateAttributes({
        state: models.Order.STATE.PAID,
        transactionId: message.transaction_id
      }).then(function(order){
        next(null, order)
      })
    }else{
      next(new Error("pass"))
    }
  }, function(order, next) {
    models.Customer.findById(order.customerId).then(function(customer) {
      next(null, order, customer)
    }).catch(function(err) {
      next(err)
    })
  }, function(order, customer, next) {
    customer.addTraffic(models, order, function(customer, order, flowHistory){
      next(null, order, customer)
    }, function(err) {
      next(err)
    })
  }], function(err, order, customer){
    if(err){
      res.reply(err)
    }else{
      res.reply('success');
    }
  })
}));

module.exports = app;