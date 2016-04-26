var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var formidable = require('formidable')
var async = require("async")

var config = require("../../config")
var WechatAPI = require('wechat-api');
// var api = new WechatAPI(config.appId, config.appSecret);
var api = helpers.API

admin.get("/withdrawals", function(req, res) {
  async.waterfall([function(next) {
    models.Withdrawal.findAndCountAll({
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page, req.query.perPage || 15),
      order:[
        ['updatedAt', "DESC"]
      ]
    }).then(function(withdrawals) {
      next(null, withdrawals)
    }).catch(function(err) {
      next(err)
    })
  }, function(withdrawals, pass) {
    withdrawals.row
    async.map(withdrawals.rows, function(drawals, next) {
      models.Customer.findById(drawals.customerId).then(function(customer) {
        drawals.customer = customer
        next(null, drawals)
      }).catch(function(err) {
        next(err)
      })
    }, function(err, datas) {
      if(err){
        pass(err)
      }else{
        withdrawals.rows = datas
        pass(null, withdrawals)
      }
    })
  }], function(err, withdrawals) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      result = helpers.setPagination(withdrawals, req)
      res.render('admin/withdrawals/index', { withdrawals: result, STATUS: models.Withdrawal.STATUS })
    }
  })
})

admin.get('/withdrawals/:id/edit', function(req, res) {
  async.waterfall([function(next) {
    models.Withdrawal.findById(req.params.id).then(function(withdrawal) {
      next(null, withdrawal)
    }).catch(function(err) {
      next(err)
    })
  }, function(withdrawal, next) {
    models.Customer.findById(withdrawal.customerId).then(function(customer) {
      withdrawal.customer = customer
      next(null, withdrawal)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, withdrawal) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      res.render('admin/withdrawals/edit', { withdrawal: withdrawal, STATUS: models.Withdrawal.STATUS, allowEdit: withdrawal.state == models.Withdrawal.STATUS.APPLY })
    }
  })
})

admin.post('/withdrawals/:id/apply', function(req, res) {

  async.waterfall([function(next) {
    models.Withdrawal.findById(req.params.id).then(function(withdrawal) {
      next(null, withdrawal)
    }).catch(function(err) {
      next(err)
    })
  }, function(withdrawal, next) {
    withdrawal.updateAttributes({
      state: models.Withdrawal.STATUS.SUCCESS
    }).then(function(withdrawal) {
      next(null, withdrawal)
      sendNotice(withdrawal, true)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, withdrawal) {
    if(err){
      console.log(err)
      req.flash("err", "update fail")
      res.redirect('/500')
    }else{
      req.flash("info", "update succes")
      res.redirect('/admin/withdrawals/'+ withdrawal.id +'/edit')
    }
  })

})

admin.post('/withdrawals/:id/reject', function(req, res) {
  async.waterfall([function(next) {
    models.Withdrawal.findById(req.params.id).then(function(withdrawal) {
      next(null, withdrawal)
    }).catch(function(err) {
      next(err)
    })
  }, function(withdrawal, next) {
    withdrawal.updateAttributes({
      comment: req.body.comment,
      state: models.Withdrawal.STATUS.FAIL
    }).then(function(withdrawal) {
      next(null, withdrawal)
      sendNotice(withdrawal, false)
    }).catch(function(err) {
      next(err)
    })
  }, function(withdrawal, next) {

    models.Customer.findById(withdrawal.customerId).then(function(customer) {
      customer.updateAttributes({
        salary: parseFloat(customer.salary) + parseFloat(withdrawal.cost)
      }).then(function(customer) {

        customer.takeFlowHistory(models, withdrawal, withdrawal.cost, "提取￥" + withdrawal.amount + "失败，返还" + withdrawal.cost + "元（￥）", models.FlowHistory.STATE.ADD , function() {
              }, function(err) {
              }, models.FlowHistory.TRAFFICTYPE.SALARY)

        next(null, withdrawal, dConfig, customer)
      }).catch(function(err) {
        next(err)
      })
    })

    next(null, withdrawal)
  }], function(err, withdrawal) {
    if(err){
      console.log(err)
      req.flash("err", "update fail")
      res.redirect('/500')
    }else{
      req.flash("info", "update succes")
      res.redirect('/admin/withdrawals/'+ withdrawal.id +'/edit')
    }
  })
})


function sendNotice(withdrawal, isDone){

  async.waterfall([function(next) {
    models.Customer.findById(withdrawal.customerId).then(function(customer) {
      next(null, customer)
    }).catch(function(err){
      next(err)
    })
  }, function(customer, next) {
    if(isDone){
      models.MessageTemplate.findOrCreate({
        where: {
          name: "notice apply"
        },
        defaults: {
          content: "你好，你的提现请求已接受。提现支付宝帐号：{{account}}，真实姓名：{{name}}，提取{{amount}}，请注意查收"
        }
      }).spread(function(template) {
        var content = template.content.format({ account: withdrawal.account, name: withdrawal.name, amount: withdrawal.amount })
        next(null, customer, content)
      }).catch(function(err) {
        next(err)
      })
    }else{
      models.MessageTemplate.findOrCreate({
        where: {
          name: "notice fail"
        },
        defaults: {
          content: "你好，你的提现请求已被拒绝。提现支付宝帐号：{{account}}，真实姓名：{{name}}，提取{{amount}}。拒绝理由{{reason}}"
        }
      }).spread(function(template) {
        var content = template.content.format({ account: withdrawal.account, name: withdrawal.name, amount: withdrawal.amount, reason: withdrawal.comment })
        next(null, customer, content)
      }).catch(function(err) {
        next(err)
      })
    }
  }, function(customer, content, next) {
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
    }
  })

}

module.exports = admin;