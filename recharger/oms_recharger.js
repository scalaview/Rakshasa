var request = require("request")
var config = require("../config")
var crypto = require('crypto')

function Oms() {
  this.timestamp = ((new Date()).getTime()/1000).toFixed(0)
  this.cert = "6HNJAD4CA517619M4T4PSPME9R1I4MRU"
  this.username = "UFMAITCZDD"
  this.url = "http://cztim.oms88.com/api/v1.php"
  this.notify_url = "http://" + config.hostname + "/omsconfirm"
  return this
}

Oms.prototype.sign = function(){
  return crypto.createHash('md5').update(this.timestamp + this.cert).digest("hex").toLowerCase()
}

Oms.prototype.headers = function(callname){
  return {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12F70 MicroMessenger/6.1.5 NetType/WIFI',
    'API-USER-NAME': this.username,
    'API-NAME':  callname,
    'API-TIMESTAMP': this.timestamp,
    'API-SIGNATURE': this.sign()
  }
}

Oms.prototype.createOrder = function(phone, productId){
  var options = {
        headers: this.headers("OrderCreate"),
        url: this.url,
        formData: {
          phone_number: phone,
          product_id: productId,
          notify_url: this.notify_url
        }
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


Oms.prototype.getProducts = function(){
  var options = {
        headers: this.headers("ProductQuery"),
        url: this.url
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

Oms.prototype.syncProducts = function(){
  var models  = require('../models')

  function getProviderId(product_category){
    //运营商类型 1：电信 2：移动 3：联通
    var providerType = product_category.slice(0, 2)
    switch(providerType) {
      case "电信":
        return models.TrafficPlan.Provider["中国电信"]
      case "移动":
        return models.TrafficPlan.Provider["中国移动"]
      case "联通":
        return models.TrafficPlan.Provider["中国联通"]
    }
  }

    function getValue(string){
      var string = string.replace(/[0-9]*元/ig,"")
          y = /[M|G]/,
          end = y.exec(string)
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

  this.getProducts().then(function(data){
    if(data.ack == "success"){
      async.each(data.product, function(product, next){
        models.TrafficPlan.findOrCreate({
          where: {
            bid: product.product_id
          },
          defaults: {
            providerId: getProviderId(product.product_category),
            value: getValue(product.product_name),
            name: product.product_name,
            cost: parseFloat(product.product_price) + 3.00,
            display: false,
            type: models.TrafficPlan.TYPE["大众通信"],
            bid: product.product_id,
            purchasePrice: product.product_price
          }
        }).then(function(trafficPlan){
          next(null)
        }).catch(function(err){
          next(err)
        })
      }, function(err){
        if(err){
          console.log(err)
        }else{
          console.log("sync success")
        }
      })
    }else{
      console.log(data.message)
    }
  }).catch(function(err){
    console.log(err)
  })
}

module.exports.Oms = Oms;
