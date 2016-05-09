var request = require("request")
var config = require("../config")
var crypto = require('crypto')
var querystring = require('querystring');

function Dazhong(phone, product_id, orderId){
  this.client_id = config.dazhong_client_id
  this.product_id = product_id
  this.timestamp = Math.round(new Date().getTime()/1000)
  this.nonce_str = Math.random().toString(36).substr(2);
  this.out_trade_no = orderId
  this.notify_url = "http://{{hostname}}/dazhongconfirm/".format({ hostname: config.hostname })
  this.phone = phone

  this.dazhong_apikey = config.dazhong_apikey

  var uri = 'http://traffic.52traffic.com/openapi/recharge/order/',
      params = {
        client_id: this.client_id,
        product_id: this.product_id,
        timestamp: this.timestamp,
        nonce_str: this.nonce_str,
        out_trade_no: this.out_trade_no,
        notify_url: this.notify_url,
        phone: this.phone
      }
  var strArray = [],
      keys = Object.keys(params).sort()
  for(var i=0; i < keys.length; i++){
    strArray.push(keys[i] + "=" + params[keys[i]])
  }
  strArray.push("key=" + this.dazhong_apikey)

  this.sign = crypto.createHash('md5').update(strArray.join("&")).digest("hex").toUpperCase();
  params['sign'] = this.sign


  var formData = querystring.stringify(params);
  var contentLength = formData.length;

  this.options = {
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12F70 MicroMessenger/6.1.5 NetType/WIFI'
    },
    uri: uri,
    method: 'POST',
    body: formData
  }
  console.log(this.options)

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

    request(this.options, function (error, res, body) {
      if (!error && res.statusCode == 200) {
        if(inerSuccessCallback){
          console.log(body)
          var data = JSON.parse(body.trim())
          inerSuccessCallback.call(this, res, data)
        }
       }else{
        if(inerErrCallback){
          inerErrCallback.call(this, error)
        }
       }
     });

     return this
   }
 return this

}

module.exports.Dazhong = Dazhong;