var request = require("request")
var config = require("../config")
var crypto = require('crypto')


function YouXingRecharge(appid, key, host){
  this.appid = appid
  this.key = key
  this.host = host
}

YouXingRecharge.prototype.syncProducts = function(products, type){
  var models  = require('../models')
  var async = require("async")

  function getValue(string){
    var y = /[M|G]/,
        end = y.exec(string)
    if(!end) return 0
    if(end.index + 1 <= string.length){
      var unit = string.substring(end.index, end.index + 1)
    }else{
      var unit = 'M'
    }
    var size = string.replace(/[^0-9]/ig,"")
    if(unit.toLowerCase() == 'g' ){
      return parseInt(size) * 1024
    }else{
      return parseInt(size)
    }
  }

  async.each(products, function(product, pass){
    async.waterfall([function(next){
      models.TrafficPlan.findOrCreate({
        where: {
          bid: product.pid,
          type: models.TrafficPlan.TYPE[type]
        },
        defaults: {
          providerId: models.TrafficPlan.Provider[product.provider],
          value: getValue(product.name),
          name: product.name,
          cost: parseFloat(product.purchase_price) + 3.00,
          display: false,
          type: models.TrafficPlan.TYPE[type],
          bid: product.pid,
          purchasePrice: product.purchase_price
        }
      }).spread(function(trafficPlan){
        next(null, trafficPlan)
      }).catch(function(err){
        next(err)
      })
    }, function(trafficPlan, next){
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
        next(null, trafficPlan, trafficGroup)
      }).catch(function(err){
        next(err)
      })
    }, function(trafficPlan, trafficGroup, next){
      trafficPlan.updateAttributes({
        trafficGroupId: trafficGroup.id
      }).then(function(trafficPlan){
        next(null, trafficPlan, trafficGroup)
      }).catch(function(err){
        next(err)
      })
    }], function(err, trafficPlan, trafficGroup){
      if(err){
        pass(err)
      }else{
        pass(null, trafficPlan, trafficGroup)
      }
    })
  }, function(err){
    if(err){
      console.log(err)
    }
  })
}

YouXingRecharge.prototype.sign = function(params){
  var strArray = [],
      keys = Object.keys(params).sort()
  for(var i=0; i < keys.length; i++){
    if(params[keys[i]] !== ""){
      strArray.push(keys[i] + "=" + params[keys[i]])
    }
  }
  strArray.push("key=" + this.key)
  return crypto.createHash('md5').update(strArray.join("&")).digest("hex").toUpperCase()
}

YouXingRecharge.prototype.createOrder = function(mobile, productId, orderId){
  var url = "http://"+this.host+"/api/flow/recharge",
      params = {
        appid: this.appid,
        timestamp: (new Date()).getTime(),
        mobile: mobile,
        product: productId,
        order_sn: orderId
      }
      params["sign"] = this.sign(params)
  var options = {
        url: url,
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

module.exports.YouXingRecharge = YouXingRecharge;

