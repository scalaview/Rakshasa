/**
 * 易赛流量接口
 * Created by 唐亮 on 2016/7/16.
 */
var request = require("request")
var config = require("../config")
var crypto = require('crypto')
var moment = require('moment')
var xml2js = require('xml2js')
var iconv = require('iconv-lite')


function YiSai(orderId, phone, ProId) {
    var UserNumber = config.yisai_UserNumber
    var UserSystemKey = config.yisai_UserSystemKey
    var UserCustomerKey = config.yisai_UserCustomerKey
    var CallBackUrl = config.yisai_CallBackUrl

    this.options = {
        uri: 'http://llbchongzhi.esaipai.com/IRecharge_Flow',
        method: 'POST',
        qs: {
            'UserNumber': UserNumber,
            'OutOrderNumber': orderId,
            'ProId': ProId,
            'PhoneNumber': phone,
            'PayAmount': '1',
            'StartTime': createTime(),
            'TimeOut': '300',
            'Remark': '300',
            'CallBackUrl': CallBackUrl,
            'RecordKey': '',
        }
    }
    this.options.qs.RecordKey = recordKey(this.options.qs.UserNumber,
        this.options.qs.OutOrderNumber,
        this.options.qs.ProId,
        this.options.qs.PhoneNumber,
        this.options.qs.PayAmount,
        this.options.qs.StartTime,
        this.options.qs.TimeOut,
        this.options.qs.Remark,
        UserSystemKey,// UserSystemKey
        UserCustomerKey)
    console.log(this.options)
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
        var that = this
        request(this.options, function (error, res) {
            if (!error && res.statusCode == 200) {
                if (inerSuccessCallback) {
                    var parser =  new xml2js.Parser({explicitArray : false, ignoreAttrs : true})
                    parser.parseString(res.body.trim(), function (err, result) {
                        inerSuccessCallback.call(that, res, result)
                    })
                }
            } else {
                if (inerErrCallback) {
                    inerErrCallback.call(this, error)
                }
            }
        });

        return this
    }

    this.testRecharge = testRecharge
    this.rechargeResult = rechargeResult
    this.md5 = getMd5;
    return this;


    /**
     * 获取产品列表
     */
    function testRecharge(callback) {

        var options = {
            uri: 'http://llbchongzhi.esaipai.com/Flow_Test/IRecharge_Flow',
            method: 'POST',
            qs: {
                'UserNumber': 8888888,
                'OutOrderNumber': '1111111111111111',
                'ProId': '100000',
                'PhoneNumber': '18320376671',
                'PayAmount': '1',
                'StartTime': createTime(),
                'TimeOut': '300',
                'Remark': '300',
                'CallBackUrl': '',
                'RecordKey': '',
            }
        }
        options.qs.RecordKey = recordKey(options.qs.UserNumber,
            options.qs.OutOrderNumber,
            options.qs.ProId,
            options.qs.PhoneNumber,
            options.qs.PayAmount,
            options.qs.StartTime,
            options.qs.TimeOut,
            options.qs.Remark,
            'test',// UserSystemKey
            '')
        console.log(options)
        request(options, function (error, res) {
            if (!error && res.statusCode == 200) {
                var parser =  new xml2js.Parser({explicitArray : false, ignoreAttrs : true})
                parser.parseString(res.body.trim(), function (err, result) {
                    console.log(result)
                    callback(result)
                })
            } else {
                console.log(err)
            }
        });
    }

    /**
     * 产品信息查询接口
     * @param InOrderNumber
     * @param OutOrderNumber
     */
    function rechargeResult(InOrderNumber, OutOrderNumber, callback) {
        var options = {
            uri: 'http://llbchongzhi.esaipai.com/IRechargeResult_Flow',
            method: 'POST',
            qs: {
                'UserNumber': UserNumber,
                'InOrderNumber': InOrderNumber,
                'OutOrderNumber': OutOrderNumber,
                'Remark': '300',
                'RecordKey': '',
            }
        }

        options.qs.RecordKey = recordKey(options.qs.UserNumber,
            options.qs.InOrderNumber,
            options.qs.OutOrderNumber,
            options.qs.Remark,
            UserSystemKey,// UserSystemKey
            UserCustomerKey)

        console.log(options)
        request(options, function (error, res) {
            if (!error && res.statusCode == 200) {
                var parser =  new xml2js.Parser({explicitArray : false, ignoreAttrs : true})
                parser.parseString(res.body.trim(), function (err, result) {
                    console.log(result)
                    callback(result)
                })
            } else {
                console.log(err)
            }
        });

    }
    /**
     * 生成签名
     * @param Provider
     * @returns {*}
     */
    function recordKey() {
        var str = "";
        for (var i = 0 ; i < arguments.length; i ++ ) str += arguments[i];
        return getMd5(str)
    }
    /**
     * 生成MD5加密的sign
     */
    function getMd5(strParams) {
        return crypto.createHash('md5').update(strParams).digest("hex").toUpperCase().substring(0,16)
    }
    /**
     * 生成格式化的时间
     * @returns {ServerResponse|string|*}
     */
    function createTime() {
        return moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
}


module.exports.YiSai = YiSai;