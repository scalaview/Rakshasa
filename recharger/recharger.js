var config = require("../config")
var request = require("request")

// [0, '非正式'], [1, '空中平台'], [2, '华沃流量']
function Recharger(phone, value){
  // type = 0 or null
  this.phone = phone
  this.value = value

  this.options = {
    uri: config.yunma,
    method: 'GET',
    qs: {
      user_name: config.user,
      passwd: config.pwd,
      mobile: this.phone,
      num: (this.value / 50)
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

  request(this.options, function (error, res) {
    if (!error && res.statusCode == 200) {
      if(inerSuccessCallback){
        var values = res.body.split('\n')
        var data = {
          state: values[0],
          msg: values[1]
        }
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


module.exports.Recharger = Recharger;