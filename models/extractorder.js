'use strict';

var request = require("request")
var async = require("async")
var helpers = require("../helpers")
var recharger = require("../recharger")
var Xinhaoba = recharger.Xinhaoba
var Dazhong = recharger.Dazhong
var Liuliangtong = recharger.Liuliangtong
var YiSai = recharger.YiSai
var config = require("../config")
var crypto = require('crypto')

module.exports = function(sequelize, DataTypes) {
  var ExtractOrder = sequelize.define('ExtractOrder', {
    state:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      set: function(val){
        var that = this
        if(val == ExtractOrder.STATE.FINISH && this.state != ExtractOrder.STATE.FINISH ){
          async.waterfall([function(next){
            that.getCustomer().then(function(customer){
              if(customer){
                next(null, customer)
              }else{
                next(new Error("customer not found"))
              }
            }).catch(function(err){
              next(err)
            })
          }, function(customer, next){
            helpers.doOrderTotal(that, customer, next)
          }, helpers.doAffiliate, helpers.doIntegral], function(err, extractOrder, customer){
            if(err){
              console.log(err)
              return;
            }
          })
        }else if(this.state == ExtractOrder.STATE.FINISH && val != ExtractOrder.STATE.FINISH){
          async.waterfall([function(next){
            that.getCustomer().then(function(customer){
              if(customer){
                next(null, customer)
              }else{
                next(new Error("customer not found"))
              }
            }).catch(function(err){
              next(err)
            })
          }, function(customer, next){
            customer.refundTraffic(helpers.models, that, "手动修改状态", function(customer, extractOrder, flowHistory){
              if(extractOrder.totalIntegral){
                customer.refundIntegral(helpers.models, extractOrder, "手动修改状态")
              }
              next(null, that, customer)
            }, function(err){
              next(err)
            })
          }, function(extractOrder, customer, next){
            customer.reduceAncestries(helpers.models, extractOrder, "手动修改状态").then(function(customer, extractOrder){
              next(null, extractOrder, customer)
            }).catch(function(err){
              next(err)
            })
          }], function(err, extractOrder, customer){
            if(err){
              console.log(err)
              return;
            }
          })
        }
        this.setDataValue('state', val);
      }
    },
    exchangerType: { type: DataTypes.STRING, allowNull: false },
    exchangerId: { type: DataTypes.INTEGER, allowNull: false },
    phone: {  type: DataTypes.STRING, allowNull: true },
    cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.0 },
    extend: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    value: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    type: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    bid: { type: DataTypes.STRING, allowNull: true },
    customerId: { type: DataTypes.INTEGER, allowNull: true },
    chargeType: { type: DataTypes.STRING, allowNull: false, defaultValue: "balance" },
    transactionId: { type: DataTypes.INTEGER },
    paymentMethodId: { type: DataTypes.INTEGER },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.0 },
    taskid: { type: DataTypes.STRING, allowNull: true },
    totalIntegral:{ type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    productType: { type: DataTypes.STRING, allowNull: true, defaultValue: "traffic" },
    exchangeIntegral:{ type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.0 },
    out_trade_no: { type: DataTypes.STRING, allowNull: true }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.ExtractOrder.belongsTo(models.TrafficPlan, {
          foreignKey: 'exchangerId',
          scope: {
            exchangerType: 'TrafficPlan'
          }
        });
        models.ExtractOrder.belongsTo(models.FlowTask, {
          foreignKey: 'exchangerId',
          scope: {
            exchangerType: 'FlowTask'
          }
        });
        models.ExtractOrder.belongsTo(models.Customer, {
          foreignKey: 'customerId',
          scope: {
            exchangerType: 'Customer'
          }
        });
      }
    },
    instanceMethods: {
      isDone: function() {
        return (this.state === ExtractOrder.STATE.SUCCESS)
      },
      className: function() {
        return "ExtractOrder";
      },
      getExchanger: function(conditions){
        return this['get' + this.exchangerType].call(this, conditions)
      },
      stateName: function(){
        if(this.state === ExtractOrder.STATE.INIT){
          return "等待付款"
        }else if(this.state === ExtractOrder.STATE.SUCCESS){
          return "充值任务提交成功"
        }else if(this.state === ExtractOrder.STATE.FAIL){
          return "失败"
        }else if(this.state === ExtractOrder.STATE.PAID){
          return "付款成功"
        }else if(this.state === ExtractOrder.STATE.UNPAID){
          return "付款失败"
        }else if(this.state === ExtractOrder.STATE.REFUNDED){
          return "退款"
        }else if(this.state === ExtractOrder.STATE.FINISH){
          return "充值成功"
        }else if(this.state === ExtractOrder.STATE.AWAIT){
          return "待充值"
        }
      },
      autoRecharge: function(trafficPlan){
        var typeJson = trafficPlan.typeJson()
        if(trafficPlan.type == typeJson['新号吧']){
          return new Xinhaoba(this.id, this.phone, this.bid, this.value)
        }else if(trafficPlan.type == typeJson['大众']){
          return new Dazhong(this.phone, this.bid, this.id)
        }else if(trafficPlan.type == typeJson['流量通']){
          return new Liuliangtong(this.id, this.phone, trafficPlan.value)
        }else if(trafficPlan.type == typeJson['易赛']){
          return new YiSai(this.out_trade_no, this.phone, trafficPlan.bid)
        }else{
          function Empty(){
            var that = this
            this.then = function(callback){ that.successCallback=callback; return this }
            this.catch = function(callback){ that.errorCallback=callback; return this }
            this.do = function(){
              that.successCallback()
            }
            return this
          }
          return new Empty()
        }
      },
      isPaid: function(){
        return (this.state === ExtractOrder.STATE.PAID)
      }
    }
  });

  ExtractOrder.STATE = {
    AWAIT: 7,
    INIT: 0,
    PAID: 1,
    UNPAID: 2,
    SUCCESS: 3,
    FAIL: 4,
    REFUNDED: 5,
    FINISH: 6
  }

  ExtractOrder.CHARGETYPE = {
    balance: "微信支付",
    salary: "分销奖励",
    remainingTraffic: "余额",
    terminal: "终端人工"
  }

  ExtractOrder.STATEARRAY = Object.keys(ExtractOrder.STATE).map(function(k) { return [ExtractOrder.STATE[k], k] });

  return ExtractOrder;
};