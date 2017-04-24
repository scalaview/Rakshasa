var express = require('express');
var app = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var requireLogin = helpers.requireLogin
var config = require("../../config")
var fs        = require('fs');
var payment = helpers.payment;
var maxDepth = config.max_depth
var _ = require('lodash')
var autoCharge = helpers.autoCharge

app.get('/extractflow', requireLogin, function(req, res){
  async.waterfall([function(next){
    models.TrafficGroup.findAll({
      where: {
        providerId: models.TrafficGroup.Provider["中国移动"],
        display: true
      }
    }).then(function(CMCCtrafficGroups){
      next(null, CMCCtrafficGroups)
    }).catch(function(err){
      next(err)
    })
  }, function(CMCCtrafficGroups, next){
    models.DConfig.findOne({
      where: {
        name: "exchangeRate"
      }
    }).then(function(dConfig){
      next(null, CMCCtrafficGroups, dConfig)
    }).catch(function(err){
      next(err)
    })
  }, function(CMCCtrafficGroups, dConfig, next){
    models.Banner.findAll({
      where: {
        active: true
      },
      order: [
          'sortNum', 'id'
      ]
    }).then(function(banners) {
      next(null, CMCCtrafficGroups, dConfig, banners)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, CMCCtrafficGroups, dConfig, banners){
    res.render('yiweixin/orders/order', { customer: req.customer, CMCCtrafficGroups: CMCCtrafficGroups,
      exchangeRate: dConfig.value || 1, providers: models.TrafficGroup.Provider,
      banners: banners, layout: 'recharge'  })
  })
})

app.get('/extractflow1', requireLogin, function(req, res){
  async.waterfall([function(next){
    models.TrafficGroup.findAll({
      where: {
        providerId: models.TrafficGroup.Provider["中国移动"],
        display: true
      }
    }).then(function(CMCCtrafficGroups){
      next(null, CMCCtrafficGroups)
    }).catch(function(err){
      next(err)
    })
  }, function(CMCCtrafficGroups, next){
    models.DConfig.findOne({
      where: {
        name: "exchangeRate"
      }
    }).then(function(dConfig){
      next(null, CMCCtrafficGroups, dConfig)
    }).catch(function(err){
      next(err)
    })
  }, function(CMCCtrafficGroups, dConfig, next){
    models.Banner.findAll({
      where: {
        active: true
      },
      order: [
          'sortNum', 'id'
      ]
    }).then(function(banners) {
      next(null, CMCCtrafficGroups, dConfig, banners)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, CMCCtrafficGroups, dConfig, banners){
    res.render('yiweixin/orders/flow', { customer: req.customer, CMCCtrafficGroups: CMCCtrafficGroups,
      exchangeRate: dConfig.value || 1, providers: models.TrafficGroup.Provider,
      banners: banners, layout: 'flow'  })
  })
})

app.post('/pay', requireLogin, function(req, res) {
    var customer = req.customer,
        useIntegral = req.body.useIntegral == 'true' ? true : false
        console.log(req.body)
    switch(req.body.chargetype ){
      case  "remainingTraffic":
        var chargetype = models.Customer.CHARGETYPE.REMAININGTRAFFIC
        break;
      case  "salary":
        var chargetype = models.Customer.CHARGETYPE.SALARY
        break;
      default:
        var chargetype = models.Customer.CHARGETYPE.BALANCE
        break;
    }

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
      models.TrafficPlan.findById(req.body.flowId).then(function(trafficPlan){
        if(trafficPlan){
          next(null, paymentMethod, trafficPlan)
        }else{
          res.json({ err: 1, msg: "请选择正确的流量套餐" })
        }
      }).catch(function(err) {
        next(err)
      })
    }, function(paymentMethod, trafficPlan, next){
      models.Coupon.findAll({
        where: {
          trafficPlanId: trafficPlan.id,
          isActive: true,
          expiredAt: {
            $gt: (new Date()).begingOfDate()
          }
        },
        order: [
                ['updatedAt', 'DESC']
               ]
      }).then(function(coupons) {
        trafficPlan.coupon = coupons[0]
        next(null, paymentMethod, trafficPlan)
      }).catch(function(err) {
        next(err)
      })
    }, function(paymentMethod, trafficPlan, next){
      models.DConfig.findOne({
        where: {
          name: "exchangeRate"
        }
      }).then(function(dConfig){
        next(null, paymentMethod, trafficPlan, dConfig.value || 1)
      }).catch(function(err){
        next(err)
      })
    }, function(paymentMethod, trafficPlan, exchangeRate, next){

      var total = helpers.discount(customer, trafficPlan),
          deductible = 0.00
      if(useIntegral){
        deductible = (customer.totalIntegral / exchangeRate).toFixed(2)
      }
      if(useIntegral && deductible > 0.00){
        if((total - deductible) < 0.00 ){
          deductible = total
          total = 0.00
        }else{
          total = total - deductible
        }
      }
      if(chargetype == models.Customer.CHARGETYPE.SALARY && customer.salary < total){
        res.json({ err: 1, msg: "分销奖励不足" })
        return
      }

      if(chargetype == models.Customer.CHARGETYPE.REMAININGTRAFFIC && customer.remainingTraffic < total){
        res.json({ err: 1, msg: "充值余额不足" })
        return
      }

      models.ExtractOrder.findOne({
        where: {
          state: models.ExtractOrder.STATE.INIT,
          exchangerType: trafficPlan.className(),
          exchangerId: trafficPlan.id,
          phone: req.body.phone,
          customerId: customer.id,
          chargeType: chargetype,
          productType: models.TrafficPlan.PRODUCTTYPE["traffic"],
          paymentMethodId: paymentMethod.id
        }
      }).then(function(extractOrder) {
        if(extractOrder){
          extractOrder.updateAttributes({
            cost: trafficPlan.purchasePrice,
            value: trafficPlan.value,
            bid: trafficPlan.bid,
            total: total,
            totalIntegral: parseInt(deductible * exchangeRate),
            productType: models.TrafficPlan.PRODUCTTYPE["traffic"],
            exchangeIntegral: deductible
          }).then(function(extractOrder){
            next(null, paymentMethod, trafficPlan, extractOrder)
          }).catch(function(err){
            next(err)
          })
        }else{
           models.ExtractOrder.build({
            exchangerType: trafficPlan.className(),
            exchangerId: trafficPlan.id,
            phone: req.body.phone,
            cost: trafficPlan.purchasePrice,
            value: trafficPlan.value,
            bid: trafficPlan.bid,
            customerId: customer.id,
            chargeType: chargetype,
            paymentMethodId: paymentMethod.id,
            total: total,
            totalIntegral: parseInt(deductible * exchangeRate),
            productType: models.TrafficPlan.PRODUCTTYPE["traffic"],
            exchangeIntegral: deductible
          }).save().then(function(extractOrder) {
            next(null, paymentMethod, trafficPlan, extractOrder)
          }).catch(function(err) {
            next(err)
          })
        }
      }).catch(function(err){
        next(err)
      })
    }], function(error, paymentMethod, trafficPlan, extractOrder){
      if(error){
        console.log(error)
        res.json({ err: 1, msg: "server error" })
      }else{
        //TODO salary
        if(extractOrder.chargeType == models.Customer.CHARGETYPE.BALANCE && extractOrder.total > 0){
          var ip = helpers.ip(req),
              total_amount = Math.round(extractOrder.total * 100).toFixed(0),
              time = (new Date()).getTime() + "",
              time = time.substring(time.length-7, time.length-1)
              out_trade_no = extractOrder.phone + "_" + extractOrder.id + "_" + total_amount + "_" + time

          extractOrder.updateAttributes({
            out_trade_no: out_trade_no
          }).then(function(extractOrder){
            var orderParams = {
              body: '流量套餐 ' + trafficPlan.name,
              attach: extractOrder.id,
              out_trade_no: extractOrder.out_trade_no,
              total_fee: total_amount,
              spbill_create_ip: ip,
              openid: customer.wechat,
              trade_type: 'JSAPI'
            };

            console.log(orderParams)
            payment.getBrandWCPayRequestParams(orderParams, function(err, payargs){
              if(err){
                console.log("payment fail")
                console.log(err)
                res.json({err: 1, msg: '付款失败'})
              }else{
                console.log(payargs)
                res.json(payargs);
              }
            });
          })
        }else{
          // charge by salary or remainingTraffic or wechat payment total equal 0
          customer.reduceTraffic(models, extractOrder, function(){
            if(extractOrder.totalIntegral){
              customer.reduceIntegral(models, extractOrder).then(function(customer, extractOrder, trafficPlan, flowHistory){
                res.json({err: 0, msg: '付款成功', totalIntegral: customer.totalIntegral })
              }).catch(function(err){
                console.log(err)
              })
            }else{
              res.json({err: 0, msg: '付款成功', totalIntegral: customer.totalIntegral })
            }
            extractOrder.updateAttributes({
              state: models.ExtractOrder.STATE.PAID
            }).then(function(extractOrder){
              autoCharge(extractOrder, trafficPlan, function(err){
                if(err){
                  console.log(err)
                  // refund
                  customer.refundTraffic(models, extractOrder, err.message, function(customer, extractOrder, flowHistory){
                    if(extractOrder.totalIntegral){
                      customer.refundIntegral(models, extractOrder, err.message)
                    }
                  }, function(err){
                    console.log(err)
                  })
                }else{
                  console.log("充值成功")
                }
              })
            })
          }, function(err){
            console.log(err)
            res.json({err: 1, msg: '付款失败'})
          })
        }
      }
    })
})

var middleware = require('wechat-pay').middleware;
app.use('/paymentconfirm', middleware(helpers.initConfig).getNotify().done(function(message, req, res, next) {
  console.log(message)

  var extractOrderId = message.attach
  async.waterfall([function(next) {
    models.ExtractOrder.findById(extractOrderId).then(function(extractOrder) {
      if(extractOrder){
        next(null, extractOrder)
      }else{
        next(new Error('order not found'))
      }
    }).catch(function(err) {
      next(err)
    })
  }, function(extractOrder, next){
    if(message.result_code === 'SUCCESS' && extractOrder.state == models.ExtractOrder.STATE.INIT){
      extractOrder.updateAttributes({
        state: models.ExtractOrder.STATE.PAID,
        transactionId: message.transaction_id
      }).then(function(extractOrder){
        next(null, extractOrder)
      })
    }else{
      next(new Error("pass"))
    }
  }, function(extractOrder, next) {
    models.Customer.findById(extractOrder.customerId).then(function(customer) {
      next(null, extractOrder, customer)
    }).catch(function(err) {
      next(err)
    })
  }, function(extractOrder, customer, next) {
    extractOrder.getExchanger().then(function(trafficPlan){
      next(null, extractOrder, customer, trafficPlan)
    }).catch(function(err){
      next(err)
    })
  }, function(extractOrder, customer, trafficPlan, next) {
    //do history
    customer.reduceTraffic(models, extractOrder, function(){
      next(null, extractOrder, customer)
      if(extractOrder.totalIntegral){
        customer.reduceIntegral(models, extractOrder)
      }
      var originExtractOrder = extractOrder
      autoCharge(extractOrder, trafficPlan, function(err, trafficPlan, extractOrder){
        if(err){
          console.log(err)
          // refund
          if(originExtractOrder.totalIntegral){
            customer.refundIntegral(models, originExtractOrder, err.message)
          }
        }else{
          console.log("充值成功")
        }
      })
    }, function(err){
      next(err)
    }, extractOrder.chargeType)

  }, helpers.autoAffiliate], function(err, extractOrder, customer){
    if(err){
      res.reply(err)
    }else{
      res.reply('success');
    }
  })
}));

module.exports = app;
