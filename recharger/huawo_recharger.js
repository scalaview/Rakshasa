var config = require("../config")
var request = require("request")

function HuawoRecharger(phone, packagesize, orderId, account, pwd, range){
  // type = 2
  this.phone = phone
  this.packagesize = packagesize
  this.orderId = orderId

  this.account = account || config.huawo_account

  var host = 'http://' + config.huawo_hostname

  this.signTime = helpers.strftime(new Date(), "YYYYMMDDHH")

  var md5Params = '{"username":"'+ helpers.toUnicode(this.account) +'","mobile":"'+ this.phone +'","packagesize":"'+ this.packagesize +'","password":"'+ config.huawo_pwd +'","signTime":"'+ this.signTime +'"}'

  this.sign = crypto.createHash('md5').update(md5Params).digest("hex")
  console.log(this.sign)

  var params = {
    username: this.account,
    mobile: this.phone,
    packagesize: this.packagesize + "",
    password: pwd || config.huawo_pwd,
    signTime: helpers.strftime(new Date(), "YYYYMMDDHH"),
    range: range,
    requestTime: helpers.strftime(new Date(), "YYYYMMDDHHmmss"),
    sign: this.sign,
    returnUrl: encodeURIComponent("http://" + config.hostname + "/huawoconfirm")
  }

  this.options = {
    uri: host,
    method: 'GET',
    qs: params
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

  request(this.options, function (error, res) {
    if (!error && res.statusCode == 200) {
      if(inerSuccessCallback){
        console.log(res.body)
        var data = JSON.parse(res.body)
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

module.exports.HuawoRecharger = HuawoRecharger;