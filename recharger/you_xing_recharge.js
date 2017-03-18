var request = require("request")
var config = require("../config")
var crypto = require('crypto')


function YouXingRecharge(){
  this.appid = config.yt_appid
  this.key = config.yt_key

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
  var url = "http://www.gzytxxkj.com/api/flow/recharge",
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

