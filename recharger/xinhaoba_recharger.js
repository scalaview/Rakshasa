var request = require("request")
var config = require("../config")
var crypto = require('crypto')

function Xinhaoba(orderId, phone, prodid, num) {
    this.phone = phone
    this.orderId = orderId
    this.prodid = prodid
    this.num = num
    this.loginname = config.xinhaoba_loginname
    this.apiKey = config.xinhaoba_apikey

    var uri = 'http://api.xinhaoba.com/commoninterface.do',
        checkParams = "api_key={{apiKey}}&prodid={{prodid}}&submitorderid={{orderId}}&phone={{phone}}&num={{num}}".format({
            apiKey: this.apiKey,
            prodid: this.prodid,
            orderId: this.orderId,
            phone: this.phone,
            num: this.num
        })

    this.check = crypto.createHash('md5').update(checkParams).digest("hex").toLowerCase()

    var params = {
        cmd: "recharge",
        loginname: this.loginname,
        prodid: prodid,
        submitorderid: orderId,
        phone: this.phone,
        num: this.num,
        custname: this.phone + "_" + orderId,
        check: this.check
    }

    this.options = {
        uri: uri,
        method: 'GET',
        qs: params
    }
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
    return this

}

module.exports.Xinhaoba = Xinhaoba;