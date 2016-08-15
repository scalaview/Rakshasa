/**
 * 流量通接口
 * Created by 唐亮 on 2016/7/9.
 */
var request = require("request")
var config = require("../config")
var crypto = require('crypto')

function Liuliangtong(orderId, phone, package){
    this.account = config.liuliangtong_account
    this.apikey = config.liuliangtong_apikey
    this.uri = 'http://120.25.209.96:8080/api.aspx'

    var check = 'account={{account}}&mobile={{phone}}&package={{package}}&key={{apikey}}'.format({
        account : this.account,
        phone : phone,
        package : package,
        apikey : this.apikey
    })
    this.options = {
        uri: this.uri,
        method: 'GET',
        qs: null
    }
    this.options.qs = {
        action : 'charge', //  单号码充流量
        v : "1.1", // 版本号
        //range : 0, // 流量类型	0 全国流量 1省内流量，不带改参数时默认为0
        //outTradeNo : orderId, // 商户订单号	商户系统内部的订单号,64个字符内、可包含字母，可为空
        account : this.account, // 帐号 (签名)
        mobile : phone,
        package : package, // 套餐 (签名)	流量包大小(必须在返回流量包选择内)
        sign : getMd5(check)
    }
    console.log(check)

    this.then = function (callback) {
        this.successCallback = callback
        return this
    }

    this.catch = function (callback) {
        this.errCallback = callback
        return this
    }

    this.do = function () {

        var inerSuccessCallback = this.successCallback;
        var inerErrCallback = this.errCallback;

        request(this.options, function (error, res) {
            if (!error && res.statusCode == 200) {
                if (inerSuccessCallback) {
                    console.log(res.body)
                    var data = JSON.parse(res.body.trim())
                    inerSuccessCallback.call(this, res, data)
                }
            } else {
                if (inerErrCallback) {
                    inerErrCallback.call(this, error)
                }
            }
        });

        return this
    }

    return this;

    /**
     * 生成MD5加密的sign
     */
    function getMd5(strParams) {
        return crypto.createHash('md5').update(strParams).digest("hex").toLowerCase()
    }

}


module.exports.Liuliangtong = Liuliangtong;