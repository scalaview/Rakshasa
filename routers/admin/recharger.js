/**
 * 测试流量接口
 * Created by 唐亮 on 2016/7/16.
 */
var express = require('express');
var admin = express.Router();
var models  = require('../../models');
var recharger = require("../../recharger")
var Xinhaoba = recharger.Xinhaoba
var Dazhong = recharger.Dazhong
var Liuliangtong = recharger.Liuliangtong
var YiSai = recharger.YiSai

/**
 * 易赛获取产品
 */
admin.get('/test_ys_productlist', function (req, res) {
    
    var yisai = new YiSai()
/*    yisai.getProductList(function (data) {
        res.write(JSON.stringify(data))
        res.end()
    })*/
    var str = yisai.md5("fuji孚技0717")
    console.log(str)
})

module.exports = admin;