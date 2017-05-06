var request = require("request")
var config = require("../config")
var crypto = require('crypto')


function Gdsjll(){
  this.appid = config.gdsjll_appid
  this.appsecret = config.gdsjll_appsecret
}


Gdsjll.prototype.sign = function(params){
  var strArray = [],
      keys = Object.keys(params).sort()
  for(var i=0; i < keys.length; i++){
    if(params[keys[i]] !== ""){
      strArray.push(keys[i] + "=" + params[keys[i]])
    }
  }
  strArray.push("appsecret=" + this.appsecret)
  return crypto.createHash('md5').update(strArray.join("&")).digest("hex").toUpperCase()
}

Gdsjll.prototype.timestamp = function(){
  return ((new Date()).getTime()/1000).toFixed(0);
}


Gdsjll.prototype.nonceString = function(){
  return Math.round((new Date().valueOf() * Math.random())) + '';
}

Gdsjll.prototype.getProducts = function(){
  var params =  {
        appid: this.appid,
        timestamp: this.timestamp(),
        nonce_str: this.nonceString()
      }
  params['sign'] = this.sign(params)
  console.log(params)
  var options = {
    url: "http://mp.gdsjll.com/api/goodsList",
    formData: params
  }

  return new Promise(function(resolve, reject){
    request.post(options, function(err, res, body){
      if (!err && res.statusCode == 200) {
        console.log(body)
        var data = JSON.parse(res.body.trim())
        resolve(data)
      }else{
        reject(err)
      }
    })
  })
}


Gdsjll.prototype.createOrder = function(phone, productId){
  var params = {
    appid: this.appid,
    timestamp: this.timestamp(),
    nonce_str: this.nonceString(),
    mobile: phone,
    goods_id: productId
  }
  params['sign'] = this.sign(params)
  var options = {
        url: "http://mp.gdsjll.com/api/recharge",
        formData: params
      }

  this.then = function(callback){
    this.successCallback = callback
    return this
  }

  this.catch = function(callback){
   this.errCallback = callback
   return this
  }

  this.do = function(){
    var inerSuccessCallback = this.successCallback;
    var inerErrCallback = this.errCallback;

    request.post(options, function(err, res, body){
      if (!err && res.statusCode == 200) {
        if(inerSuccessCallback){
          console.log(body)
          var data = JSON.parse(res.body.trim())
          inerSuccessCallback.call(this, res, data)
        }else{
          if(inerErrCallback){
            inerErrCallback.call(this, err)
          }
        }
      }
    })
    return this
  }

  return this
}

Gdsjll.prototype.syncProducts = function(){
  var models  = require('../models')
  var async = require("async")


  function getProviderId(operator){
    //运营商类型 1：中国电信 2：中国移动 3：中国联通
    switch(operator) {
      case "中国电信":
        return models.TrafficPlan.Provider["中国电信"]
      case "中国移动":
        return models.TrafficPlan.Provider["中国移动"]
      case "中国联通":
        return models.TrafficPlan.Provider["中国联通"]
    }
  }

  this.getProducts().then(function(data){
    if(data.errcode === 0){
       async.each(data.list, function(product, next){
        async.waterfall([function(pass){
          models.TrafficPlan.findOrCreate({
            where: {
              bid: product.id,
              type: models.TrafficPlan.TYPE["gdsjll"]
            },
            defaults: {
              providerId: getProviderId(product.operator),
              value: product.flow,
              name: product.title,
              cost: parseFloat(product.price) + 3.00,
              display: false,
              type: models.TrafficPlan.TYPE["gdsjll"],
              bid: product.id,
              purchasePrice: product.price
            }
          }).spread(function(trafficPlan){
            pass(null, trafficPlan)
          }).catch(function(err){
            pass(err)
          })
        }, function(trafficPlan, pass){
          models.TrafficGroup.findOrCreate({
            where: {
              name: trafficPlan.name,
              providerId: trafficPlan.providerId
            },
            defaults: {
              name: trafficPlan.name,
              providerId: trafficPlan.providerId,
              display: false
            }
          }).spread(function(trafficGroup){
            pass(null, trafficPlan, trafficGroup)
          }).catch(function(err){
            pass(err)
          })
        },function(trafficPlan, trafficGroup, pass){
          trafficPlan.updateAttributes({
            trafficGroupId: trafficGroup.id
          }).then(function(trafficPlan){
            pass(null, trafficPlan, trafficGroup)
          }).catch(function(err){
            pass(err)
          })
        }], function(err, trafficPlan, trafficGroup){
          if(err){
            next(err)
          }else{
            next(null)
          }
        })
      }, function(err){
        if(err){
          console.log(err)
        }else{
          console.log("sync success")
        }
      })
    }else{
      console.log(data.errmsg)
    }
  }).catch(function(err) {
    console.log(err)
  })
}

module.exports.Gdsjll = Gdsjll;