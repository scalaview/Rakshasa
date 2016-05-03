var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")

// 配置信息

function initDConfig(req, res, pass){
  var dConfigs = models.DConfig.dConfigs

  async.each(dConfigs, function(DC, next) {
    models.DConfig.findOrCreate({
      where: {
        name: DC.name
      },
      defaults: DC
    }).spread(function(one) {
       next(null, one)
    }).catch(function(err){
      next(err)
    })
  }, function(err) {
    if(err){
      console.log(err)
    }
    pass()
  })

}

admin.get('/configs', initDConfig, function(req, res) {
  models.DConfig.findAll({}).then(function(dconfigs){
    var result = {}

    for (var i = 0; i < dconfigs.length ; i++) {
      if(dconfigs[i].name == 'vipLimit'){
        result['vipLimit'] = {
            name: "自动升级VIP限制",
            key: 'vipLimit',
            value: dconfigs[i].value
        }
      }

      if(dconfigs[i].name == 'exchangeRate'){
        result['exchangeRate'] = {
          name: '兑换汇率(1元等于多少积分)',
          key: 'exchangeRate',
          value: dconfigs[i].value
        }
      }

      if(dconfigs[i].name == 'affiliate'){
        result['affiliate'] = {
          name: '分销商限制',
          key: 'affiliate',
          value: dconfigs[i].value
        }
      }

      if(dconfigs[i].name == 'disable'){
        result['disable'] = {
          name: '开启平台维护',
          key: 'disable',
          value: dconfigs[i].value
        }
      }

    };

    res.render('admin/dconfigs/show', { result: result })

  })
})


admin.post('/configs', function(req, res) {
  models.DConfig.findAll({}).then(function(dconfigs) {
    var dConfigsArray = models.DConfig.dConfigs
    async.map(dconfigs, function(dconfig, next){
      var done = false
      for (var i = 0; i < dConfigsArray.length; i ++) {
        if(dconfig.name == dConfigsArray[i].name){
          dconfig.updateAttributes({
          value: req.body[dConfigsArray[i].name]
          }).then(function(dconfig) {
            done = true
            next(null, dconfig)
          }).catch(function(err) {
            done = true
            next(err)
          })
        }
      };
      if(!done){
        next(null)
      }
    }, function(err, result) {
      if(err){
        console.log(err)
        req.flash("err", "update fail")
        res.redirect('/500')
      }else{
        req.flash("info", "update succes")
        res.redirect('/admin/configs')
      }
    })

  })
})

module.exports = admin;
