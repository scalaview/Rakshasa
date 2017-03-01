var request = require("request")
var config = require("../config")
var crypto = require('crypto')


function Gdsjll(){
  this.appid = "yll58b61b967cf15"
  this.appsecret = "40490595784cfa0bf89f64ff4b3f9c9b"
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

Gdsjll.prototype.getProducts = function(){
  var params =  {
        appid: this.appid,
        timestamp: this.timestamp(),
        nonce_str: Math.round((new Date().valueOf() * Math.random())) + ''
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

module.exports.Gdsjll = Gdsjll;