var request = require("request")
var config = require("../config")
var crypto = require('crypto')


function Huadong(orderId, phone, productId){
  this.host = "flow.139o2o.com"
  this.uri = "http://"+ this.host +"/flow/flow"
  this.appId = config.huadong_app_id
  this.key = config.huadong_key

  function token(productId, orderId, appId, phone, key){
    var par = [productId, orderId, appId, phone].join(""),
        md5 = crypto.createHash('md5').update(par).digest("hex"),
        sha1 = crypto.createHash('sha1').update(md5 + key).digest('hex')
        console.log("sha1:" + sha1)
    return sha1
  }

  var params = {
    phone_num: phone,
    app_id: this.appId,
    token: token(productId, orderId, this.appId, phone, this.key),
    order_num: orderId,
    product_id: productId
  }

  console.log(params)

  this.options = {
    uri: this.uri,
    method: "GET",
    qs: params
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

    request(this.options, function (error, res) {
      if (!error && res.statusCode == 200) {
        if(inerSuccessCallback){
          console.log(res.body)
          var data = JSON.parse(res.body.trim())
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

module.exports.Huadong = Huadong;