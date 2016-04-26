var request = require("request")
var config = require("../config")

function YiliuliangRecharger(phone, typeid){
  this.phone = phone
  this.typeid = typeid

  this.username = config.yiliuliang_user
  this.password = config.yiliuliang_pwd

  var host = 'http://' + config.yiliuliang + "/admin.php/Charged/apicharge"

  var params = {
    username: this.username,
    password: this.password,
    mobile: this.phone,
    typeid: this.typeid
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

module.exports.YiliuliangRecharger = YiliuliangRecharger;