var express = require('express');
var app = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var config = require("../../config")
var _ = require('lodash')
var WechatAPI = require('wechat-api');
var requireLogin = helpers.requireLogin
var images = require("images");
var text2Png = helpers.text2Png
var api = helpers.API

var request = require("request")
var fs        = require('fs');

var maxDepth = config.max_depth

app.get('/myaccount', requireLogin, function(req, res) {
  var customer = req.customer

  async.waterfall([function(next) {
    next(null, customer)
  }, helpers.getSlaves, function(customer, result, next) {
    var list = customer.getAncestry()
    if(list.length > 0){
      models.Customer.findById(list[list.length - 1]).then(function(parent) {
        next(null, result, parent)
      })
    }else{
      next(null, result, {})
    }

  }], function(err, result, parent) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      var sum = 0
      for (var i = result.length - 1; i >= 0; i--) {
        sum = sum + parseInt(result[i].count)
      };
      res.render('yiweixin/customer/myaccount', { customer: customer, result: result, parent: parent, sum: sum })
    }
  })
})

app.get('/myticket', requireLogin, function(req, res) {
  var customer = req.customer
  res.redirect("/myticket/" + helpers.toHex(customer.id))
})

app.get('/myticket/:id', function(req, res) {
  var id = new Buffer(req.params.id, "hex").toString("utf8")
  async.waterfall([function(next){
    models.Customer.findById(id).then(function(customer){
      if(customer){
        if(customer.myticket){
          res.render('yiweixin/withdrawal/myticket', { url: customer.myticket, customer: customer, layout: 'ticket' })
          return
        }else{
          next(null, customer)
        }
      }else{
        next(new Error("not found"))
      }
    }).catch(function(err){
      next(err)
    })
  }, function(customer, next) {
    if(customer.ticket){
      var url = api.showQRCodeURL(customer.ticket);
      next(null, url, customer)
    }else{
      api.createLimitQRCode(customer.id, function(err, data, res){
        if(err){
          next(err)
        }else{
          console.log(data)
          customer.updateAttributes({
            ticket: data.ticket
          }).then(function(customer) {
            var url = api.showQRCodeURL(customer.ticket);
            next(null, url, customer)
          }).catch(function(err) {
            next(err)
          })
        }
      });
    }
  }, generateMyticket, function(myticket, customer, next) {
    customer.updateAttributes({
      myticket: myticket
    }).then(function(customer){
      next(null, myticket, customer)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, url, customer) {
    if(err){
      console.log(err)
      res.redirect('/myaccount')
    }else{
      res.render('yiweixin/withdrawal/myticket', { url: url, customer: customer, layout: 'ticket' })
    }
  })
})

function generateMyticket(url, customer, pass){
  var filename = customer.id + (Math.round((new Date().valueOf() * Math.random()))) +'.png'
  var headimgname = customer.id + (Math.round((new Date().valueOf() * Math.random()))) +'.png'
  var tmp_file = process.env.PWD + "/public/uploads/tmp/" + filename
  var headimg_tmp_file = process.env.PWD + "/public/uploads/tmp/" + headimgname
  var save_file_path =  process.env.PWD + "/public/uploads/tickets/" + filename
  var file = fs.createWriteStream(tmp_file)
  var headimgfile = fs.createWriteStream(headimg_tmp_file)

  async.waterfall([function(next){
    request(url).pipe(file)
    file.on('finish', function() {
      next(null, file)
    })
  }, function(file, next){
    if(customer.headimgurl){
      request(customer.headimgurl).pipe(headimgfile)
      headimgfile.on('finish', function() {
        next(null, file, headimgfile)
      })
    }else{
      next(new Error("无法获取用户头像"))
    }
  }, function(file, headimgfile, next){
    try {
      text2Png("我为夕阳流量代言").then(function(data){
        var te = data.te,
            des_path = data.file_path,
            pngFile = data.pngFile
        next(null, des_path)
      }).catch(function(err){
        next(err)
      })
    }catch(err) {
      next(err)
    }
  }, function(des_path, next){
    try {
      text2Png("我是倾国倾城墨鱼妹妹" + customer.username).then(function(data){
        var te = data.te,
            iam_path = data.file_path,
            pngFile = data.pngFile
        images(process.env.PWD + "/public/images/myticket-bg.JPG")
          .draw(images(tmp_file).size(200), 220, 350)
          .draw(images(iam_path).size(te.width, 100), 120, 250)
          .draw(images(des_path).size(200), 120, 300)
          .draw(images(headimg_tmp_file).size(180), 130, 80)
          .save(save_file_path, {quality : 30 });
        next(null, [tmp_file, iam_path, des_path, headimg_tmp_file])
      }).catch(function(err){
        next(err)
      })
    }catch(err) {
      next(err)
    }
  } , function(removeFiles, next){
    async.each(removeFiles, function(path, pnext){
      fs.unlink(path, function(err) {
          if (err){
            pnext(err)
          }else{
            pnext(null)
          }
      });
    }, function(err){
      if(err){
        next(err)
      }else{
        next(null, filename, customer)
      }
    })
  }], function(err){
    if(err){
      pass(err)
    }else{
      pass(null, filename, customer)
    }
  })
}

app.get('/myslaves', requireLogin, function(req, res){
  var customer = req.customer,
      depth = parseInt(req.query.depth) + 1 + ( parseInt(customer.ancestryDepth) || 0 )

  async.waterfall([function(next) {

    if( (depth - customer.ancestryDepth) == 1 ){
      var params = {
        ancestry: (customer.ancestry) ? customer.ancestry + '/' + customer.id : customer.id + ''
      }
    }else{
      var params = {
        ancestry: {
          $like: (customer.ancestry) ? customer.ancestry + '/' + customer.id + '/%' : customer.id + '/%'
        }
      }
    }

    params = _.extend(params, { ancestryDepth: depth })

    models.Customer.findAndCountAll({
      where: params
    }).then(function(customers) {
      next(null, customers)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, customers) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      res.render('yiweixin/customer/myslaves', { customers: customers, customer: customer })
    }
  })
})

app.get('/apply', requireLogin, function(req, res) {
  var customer = req.customer

  if(customer.salary < (config.applylimit || 100.00)){
    res.render('yiweixin/withdrawal/errmsg', { message: "分销奖励未达到提现要求" })
    return
  }

  models.DConfig.findOrCreate({
    where: {
      name: "exchangeRate"
    },
    defaults: {
      value: '1'
    }
  }).spread(function(dConfig, created) {
    res.render('yiweixin/withdrawal/apply', { customer: customer, dConfig: dConfig })
  })
})

app.post('/apply', requireLogin, function(req, res) {
  var w = req.body,
      customer = req.customer
      params = req.body

      params = _.extend(params, { customerId: customer.id })

  if(params.amount <= 0){
    res.redirect('/errmsg')
    return
  }
  async.waterfall([function(next) {
    models.DConfig.findOrCreate({
      where: {
        name: "exchangeRate"
      },
      defaults: {
        value: '1'
      }
    }).spread(function(dConfig, created) {
      next(null, dConfig)
    })
  }, function(dConfig, next) {
    var fix = parseFloat(params.amount)
    params = _.extend(params, { cost: fix })
    if( parseFloat(customer.salary) >= fix ){
      models.Withdrawal.build(params).save().then(function(withdrawal) {
        if(withdrawal){
          next(null, withdrawal, dConfig)
        }else{
          next(new Error("提现出错"))
        }
      })
    }else{
      next(new Error('not enought'))
    }
  },function(withdrawal, dConfig, next) {

    customer.updateAttributes({
      salary: customer.salary - withdrawal.cost
    }).then(function(customer) {

      customer.takeFlowHistory(models, withdrawal, withdrawal.cost, "提取￥" + withdrawal.amount + "，花费" + withdrawal.cost + "元（￥）", models.FlowHistory.STATE.REDUCE , function() {
            }, function(err) {
            }, models.FlowHistory.TRAFFICTYPE.SALARY)

      next(null, withdrawal, dConfig, customer)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, withdrawal) {
    if(err){
      console.log(err)
      res.redirect('/errmsg')
    }else{
      res.redirect('/successmsg')
    }
  })

})


app.get('/slave', requireLogin, function(req, res) {
  var customer = req.customer

  async.waterfall([function(next) {
    models.Customer.findById(req.query.id).then(function(one) {
      next(null, one)
    })
  }, helpers.getSlaves], function(err, one, result) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      res.render('yiweixin/customer/slave', { customer: customer, one: one, result: result })
    }
  })
})


app.get('/withdrawals', requireLogin, function(req, res) {
  var customer = req.customer

  models.Withdrawal.findAll({
    where: {
      customerId: customer.id
    },
    order: [
      ['createdAt', "DESC"]
    ]
  }).then(function(withdrawals) {
    res.render('yiweixin/withdrawal/index', { withdrawals: withdrawals, Withdrawal: models.Withdrawal })
  }).catch(function(err) {
    res.redirect('/500')
  })

})

app.get("/awards", requireLogin, function(req, res) {
  var customer = req.customer

  async.waterfall([function(next) {
    if(customer.levelId){
      models.Level.findById(customer.levelId).then(function(level) {
        if(level.discount >= (config.blacklist || 3.00 )){
          res.json({ err: 4, msg: "服务器维护中" })
          return
        }else{
          customer.level = level
          next(null)
        }
      })
    }else{
      next(null)
    }
  }, function(next) {
    models.Coupon.getAllActive(models).then(function(coupons) {
      next(null, coupons)
    }).catch(function(err) {
      next(err)
    })
  }, function(coupons, next) {
    models.TrafficPlan.getTrafficPlanByGroup(models, Object.keys(models.TrafficPlan.ProviderName), null, customer, coupons, next)
  }, function(data, next) {
    models.AffiliateConfig.loadConfig(models, null, function(configs){
      next(null, data, configs)
    }, function(err){
      next(err)
    })
  }, function(data, defaultConfigs, pass){
    var allPlans = []
    for (var i = 0; i < data.length; i++) {
      allPlans = allPlans.concat(data[i].trafficplans)
    };

    async.each(allPlans, function(trafficPlan, next) {
      models.AffiliateConfig.existeConfig(models, trafficPlan,
        function(count){
          var result = [],
              level = ["A", "B", "C"]

          if(count > 0){
            models.AffiliateConfig.loadConfig(models, trafficPlan, function(configs){
              for (var i = 0; i < config.max_depth; i++) {
                if(configs[i]){
                  result.push({name: level[i], value: (0.01 * configs[i].percent * trafficPlan.cost).toFixed(2) })
                }else{
                  result.push({name: level[i], value: 0.00})
                }
              };
              trafficPlan.awards = result
              next(null, trafficPlan)
            }, function(err) {
              next(err)
            })
          }else{
            for (var i = 0; i < config.max_depth; i++) {
              if(defaultConfigs[i]){
                result.push({name: level[i], value: (0.01 * defaultConfigs[i].percent * trafficPlan.cost).toFixed(2) })
              }else{
                result.push({name: level[i], value: 0.00})
              }
            };
            trafficPlan.awards = result
            next(null, trafficPlan)
          }
        }, function(err) {
          pass(err)
        })
    }, function(err) {
      if(err){
        pass(err)
      }else{
        pass(null, data)
      }
    })
  }], function(err, data) {
    if(err){
      console.log(err)
      res.redirect("/500")
    }else{
      res.render('yiweixin/withdrawal/award', { trafficgroups: data })

    }
  })

})

module.exports = app;