/**
 * 流量接口
 * Created by 唐亮 on 2016/7/16.
 */
var express = require('express');
var app = express.Router();
var models  = require('../../models');
var async = require("async")
var recharger = require("../../recharger")
var Xinhaoba = recharger.Xinhaoba
var Dazhong = recharger.Dazhong
var Liuliangtong = recharger.Liuliangtong
var YiSai = recharger.YiSai

/**
 * 易赛获取产品
 */
app.get('/test_ys', function (req, res) {
    if(process.env.NODE_ENV  && process.env.NODE_ENV != "development"){
        return
    }
    var yisai = new YiSai("123445678", '18320376671', '100027')
/*    yisai.getProductList(function (data) {
        res.write(JSON.stringify(data))
        res.end()
    })*/

    yisai.then(function (data) {
        console.log(data)
        res.write(JSON.stringify(data))
        res.end()
    }).catch(function (err) {
        console.log(err)
        res.write(JSON.stringify(err))
        res.end()
    }).do()
})
/**
 * 易赛查看订单结果
 */
app.get('/test_ys_result', function (req, res) {
    if(process.env.NODE_ENV  && process.env.NODE_ENV != "development"){
        return
    }
    var yisai = new YiSai("123445678", '18320376671', '100027')

    yisai.rechargeResult('IF8766118201607281011266208012','18320376671_2286_1_188029',function (data) {
        res.write(JSON.stringify(data))
        res.end()
    })
})

app.post('/recharger_yisai', function (req, res) {
    //console.log('post ', req.body)

    async.waterfall([
        function (next) {
            next(null, req.body)
        },
        function (reqinfo, next) {
            models.ExtractOrder.findOne({
                where : {  out_trade_no: reqinfo.OutOrderNumber }
            }).then(function (extractOrder) {
                if(reqinfo.PayResult == '2'){
                    extractOrder.updateAttributes({
                        state: models.ExtractOrder.STATE.FINISH
                    }).then(function(extractOrder){
                        next(null, extractOrder)
                    }).catch(function(err) {
                        next(err)
                    })
                } else {
                    extractOrder.updateAttributes({
                        state: models.ExtractOrder.STATE.FAIL
                    })
                }
            }).catch(function (err) {
                next(err)
            })
        }
    ],function (err, extractOrder) {
        if(!err && extractOrder){
            res.write('<?xml version="1.0" encoding="utf-8"?><Esaipay><Result>success</Result><Message>接收成功</Message></Esaipay>')
            res.end()
        }
    })

})

module.exports = app;