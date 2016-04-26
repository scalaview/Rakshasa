'use strict';

var request = require("request")
var async = require("async")
var helpers = require("../helpers")
var recharger = require("../recharger")
var ChongRecharger = recharger.ChongRecharger
var DefaultRecharger = recharger.DefaultRecharger
var Recharger = recharger.Recharger
var HuawoRecharger = recharger.HuawoRecharger
var YiliuliangRecharger = recharger.YiliuliangRecharger
var config = require("../config")
var crypto = require('crypto')

module.exports = function(sequelize, DataTypes) {
  var ExtractOrder = sequelize.define('ExtractOrder', {
    state: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
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
    taskid: { type: DataTypes.STRING, allowNull: true }
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
        models.ExtractOrder.ChongRecharger = new ChongRecharger(models, config.chong[process.env.NODE_ENV || "development"].client_id, config.chong[process.env.NODE_ENV || "development"].client_secret, recharger.storeCallback, recharger.accessCallback)
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
        }
      },
      autoRecharge: function(trafficPlan){
        var typeJson = trafficPlan.typeJson()
        if(trafficPlan.type == typeJson['空中平台']){
          return new DefaultRecharger(this.phone, this.bid, this.id)
        }else if(trafficPlan.type == typeJson['华沃广东']){
          return new HuawoRecharger(this.phone, this.bid, this.id, config.huawo_province_account, config.huawo_province_pwd, 1)
        }else if(trafficPlan.type == typeJson['华沃全国']){
          return new HuawoRecharger(this.phone, this.bid, this.id, config.huawo_account, config.huawo_pwd, 0)
        }else if(trafficPlan.type == typeJson['华沃红包']){
          return new HuawoRecharger(this.phone, this.bid, this.id, config.huawo_lucky_account, config.huawo_lucky_pwd, 0)
        }else if(trafficPlan.type == typeJson['曦和流量']){
          return ExtractOrder.ChongRecharger.rechargeOrder(this.phone, this.bid, "http://protchar.cn/liuliangshopconfirm")
        }else if(trafficPlan.type == typeJson['易流量']){
          return new YiliuliangRecharger(this.phone, this.bid)
        }else{
          return new Recharger(this.phone, this.value)
        }
      },
      isPaid: function(){
        return (this.state === ExtractOrder.STATE.PAID)
      }
    }
  });

  ExtractOrder.STATE = {
    INIT: 0,
    PAID: 1,
    UNPAID: 2,
    SUCCESS: 3,
    FAIL: 4,
    REFUNDED: 5,
    FINISH: 6
  }

  ExtractOrder.STATEARRAY = Object.keys(ExtractOrder.STATE).map(function(k) { return [ExtractOrder.STATE[k], k] });

  return ExtractOrder;
};