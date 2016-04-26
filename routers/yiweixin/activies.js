var express = require('express');
var app = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var requireLogin = helpers.requireLogin
var querystring = require('querystring');
var request = require("request")
app.get("/cmpower", requireLogin, function(req, res) {
  res.render("yiweixin/activities/cmpower", { title: "【广州移动专属】100M/1G免费流量等你拿"})
})

app.post("/cmpower", requireLogin, function(req, res){
  var phone = req.body.phone
  res.locals.customer = req.customer
  console.log(phone)

  async.waterfall([function(next){
    // http://weili.cmpower.cn/h5/lighten_gz/index?origin=light_gz_weixin&referer=CIRCLE&share_uuid=8ccd315524f496fe2536bc259dd091f9
    var options = {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12F70 MicroMessenger/6.1.5 NetType/WIFI'
        },
        uri: "http://weili.cmpower.cn/h5/lighten_gz/index?origin=light_gz_weixin&referer=CIRCLE&share_uuid=8ccd315524f496fe2536bc259dd091f9",
        method: 'GET'
      }
    request(options, function(err, httpRes, body){
      if (!err && httpRes.statusCode == 200) {
        console.log(httpRes.headers['set-cookie'])
        next(null, httpRes.headers['set-cookie'])
      }else{
        next(err)
      }
    })
  }, function(cookie, next){
    var form = {
      mobi: phone
    }
    var formData = querystring.stringify(form);
    var contentLength = formData.length;
    var options = {
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12F70 MicroMessenger/6.1.5 NetType/WIFI'
        },
        'Cookie': cookie,
        uri: "http://weili.cmpower.cn/h5/lighten_gz/press_index_button",
        method: 'POST',
        body: formData
      }
    console.log(options)
    request(options, function(err, httpRes, body){
      if (!err && httpRes.statusCode == 200) {
        var result = JSON.parse(body)
        console.log(result)
        if(result.code === 0){ // 已经赠送过了
          next(null, httpRes.headers['set-cookie'])
          // next({code: 3, msg: "您已经抽奖"})
        }else if(result.code === 3){
          // { code: 3,
          //   msg: '恭喜！您已成功领取10m流量  ，请留意短信通知。接下来还有丰富大奖等你来抢！',
          //   data: [] }
          next(null, httpRes.headers['set-cookie'])
        }else{
          next({code: 0, msg: result.msg})
        }
      }else{
        next(err)
      }
    })
  } ,function(cookie, next){
    var form = {
      "area": "荔湾",
      "building": "万科金域华府",
      "address": (Math.random().toFixed(1) * 10) + "栋" + (Math.random().toFixed(2) * 100) + "号房间"
    }
    var formData = querystring.stringify(form);
    var contentLength = formData.length;
    console.log(cookie)
    request(options = {
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12F70 MicroMessenger/6.1.5 NetType/WIFI'
      },
      uri: 'http://weili.cmpower.cn/h5/lighten_gz/register_login',
      body: formData,
      method: 'POST'
    }, function(err, httpRes, body){
      if (!err && httpRes.statusCode == 200) {
        var result = JSON.parse(body)
        console.log(result)
        console.log("cookie:")
        console.log(httpRes.headers['set-cookie'])
        // { code: 0, msg: '登记成功', data: [] }
        if(result.code === 0) {
          next(null, cookie)
        } else {
          next({code: 0, msg: result.msg})
        }
      }else{
        next(err)
      }
    });
  }, function(cookie, next){
    var options = {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12F70 MicroMessenger/6.1.5 NetType/WIFI',
          'Cookie': cookie
        },
        uri: "http://weili.cmpower.cn/h5/lighten_gz/do_play",
        method: 'POST',
        qs: {
        }
      }
    request(options, function(err, httpRes, body){
      if (!err && httpRes.statusCode == 200) {
        var result = JSON.parse(body)
        console.log(result)
        // { code: 0, msg: '返回数据', data: { user_type: 3, award_id: 1 } }
        if(result.code == 0){
          switch(result.data.award_id) {
                  case 1: next(null, {code: 1, msg: "获得100M流量"});
                  case 2: next(null, {code: 1, msg: "获得1G流量"});
                  case 3: next(null, {code: 1, msg: "半年期南方都市报报纸"});
                  case 4: next(null, {code: 1, msg: "中兴天机MAX手机"});
                  case 5: next(null, {code: 0, msg: "很遗憾！您与奖品擦肩而过"});
                }
        }else if(result.code === 1){
          next({code: 3, msg: "您已经抽奖"})
        }else{
          next({code: 0, msg: result.msg})
        }
      }else{
        next(err)
      }
    })
    var customer = req.customer
    if(!customer.phone){
      customer.updateAttributes({
        phone: phone
      }).then(function(customer){
        console.log("update customer phone")
      }).catch(function(err){
        console.log(err)
      })
    }
  }], function(err, data){
    if(err){
      console.log(err)
      res.json(err)
    }else{
      res.json(data)
    }
  })
})

module.exports = app;
