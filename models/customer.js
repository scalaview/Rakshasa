'use strict';
var _ = require('lodash')
var async = require("async")
var config = require("../config")

module.exports = function(sequelize, DataTypes) {
  var concern = require('./concerns/profile_attributes')
  var Customer = sequelize.define('Customer', {
    username: {type: DataTypes.STRING, allowNull: false},
    password_hash: {type: DataTypes.STRING, allowNull: false},
    password: {
      type: DataTypes.VIRTUAL,
      set: function(val){
        this.setDataValue('password', val);
        this.setDataValue('salt', this.makeSalt())
        this.setDataValue('password_hash', this.encryptPassword(this.password));
      },
      validate: {
         isLongEnough: function (val) {
           if (val.length < 7) {
             throw new Error("Please choose a longer password")
          }
       }
      }
    },
    salt: { type: DataTypes.STRING, allowNull: false },
    wechat: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true },
    remainingTraffic: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.0 },
    sex: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    province:  { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    headimgurl: { type: DataTypes.STRING, allowNull: true },
    levelId: { type: DataTypes.INTEGER, allowNull: true },
    isSubscribe: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    salary: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0,
      set: function(val) {
        this.setDataValue('salary', parseFloat(val))
      }
    },
    subscribeTime: { type: DataTypes.DATE, allowNull: true },
    ticket: { type: DataTypes.STRING, allowNull: true },
    ancestryDepth: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    ancestry: {
      type: DataTypes.STRING,
      allowNull: true,
      set: function(ancestryCustomer){
        if(ancestryCustomer){
          var ancestry = ancestryCustomer.ancestry
          if(ancestry){
            var list = ancestry.split('/')
          }else{
            var list = []
          }
          list.push(ancestryCustomer.id)
          this.setDataValue('ancestry', list.join('/'))
          this.setDataValue('ancestryDepth', parseInt(ancestryCustomer.ancestryDepth) + 1 )
        }
      }
    },
    orderTotal: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0,
      set: function(val) {
        this.setDataValue('orderTotal', parseFloat(val))
      }
    },
    isAffiliate: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    allowGiven: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    bindPhone:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    myticket: {
      type: DataTypes.STRING,
      allowNull: true
    },
    totalIntegral:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    classMethods: _.merge(concern.classMethods, {
      associate: function(models) {
        models.Customer.hasMany(models.FlowHistory, { foreignKey: 'customerId' })
        models.Customer.hasMany(models.Order, { foreignKey: 'customerId' })
        models.Customer.hasMany(models.ExtractOrder, { foreignKey: 'customerId' })
      }
    }),
    instanceMethods: _.merge(concern.instanceMethods, {
      className: function(){
        return 'Customer'
      },
      addTraffic: function(models, order, successCallBack, errCallBack) {
        var customer = this
        async.waterfall([function(next){
          if(order.isPaid()){
            order.getDataPlan().then(function(dataPlan) {
              order.dataPlan = dataPlan
              next(null, order)
            })
          }else{
            errCallBack()
          }
        }, function(order, next){
          customer.updateAttributes({
              remainingTraffic: parseFloat(customer.remainingTraffic) + parseFloat(order.dataPlan.value)
            }).then(function(customer){
              next(null, customer, order)
            }).catch(errCallBack)
        }, function(customer, order, next){
          customer.takeFlowHistory(models, order, order.dataPlan.value, "充值成功", models.FlowHistory.STATE.ADD, function(flowHistory){
              successCallBack(customer, order, flowHistory)
            }, errCallBack)
        }], function(err){
          errCallBack(err)
        })
      },
      reduceTraffic: function(models, extractOrder, successCallBack, errCallBack) {
        var customer = this
        async.waterfall([function(next){
          extractOrder.getTrafficPlan().then(function(trafficPlan) {
            extractOrder.trafficPlan = trafficPlan
            next(null, extractOrder, trafficPlan)
          }).catch(function(err) {
            next(err)
          })
        }, function(extractOrder, trafficPlan, next){

          if(extractOrder.chargeType == models.Customer.CHARGETYPE.BALANCE){
            var enough = (extractOrder.state == models.ExtractOrder.STATE.PAID || extractOrder.total <= 0)
          }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.SALARY){
            var enough = (customer.salary > extractOrder.total)
          }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.REMAININGTRAFFIC){
            var enough = (customer.remainingTraffic > extractOrder.total)
          }

          if(enough){
            if(extractOrder.chargeType == models.Customer.CHARGETYPE.BALANCE){
              next(null, customer, extractOrder, trafficPlan)
            }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.SALARY){
              customer.updateAttributes({
                  salary: parseFloat(customer.salary) - parseFloat(extractOrder.total)
                }).then(function(customer){
                  next(null, customer, extractOrder, trafficPlan)
                }).catch(function(err) {
                  next(err)
                })
            }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.REMAININGTRAFFIC){
              customer.updateAttributes({
                  remainingTraffic: parseFloat(customer.remainingTraffic) - parseFloat(extractOrder.total)
                }).then(function(customer){
                  next(null, customer, extractOrder, trafficPlan)
                }).catch(function(err) {
                  next(err)
                })
            }
          }else{
            if(extractOrder.chargeType == models.Customer.CHARGETYPE.BALANCE){
              next(new Error("支付失败"))
            }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.SALARY){
              next(new Error("分销奖励不足"))
            }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.REMAININGTRAFFIC){
              next(new Error("充值余额不足"))
            }
          }
        }, function(customer, extractOrder, trafficPlan, next){
          customer.takeFlowHistory(models, extractOrder, extractOrder.total, "购买流量" + trafficPlan.name + "至" + extractOrder.phone + " 支付成功", models.FlowHistory.STATE.REDUCE, function(flowHistory){
              next(null, customer, extractOrder, trafficPlan, flowHistory)
            }, function(err){
              next(err)
            }, extractOrder.chargeType)
        }], function(err, customer, extractOrder, trafficPlan, flowHistory){
          if(err){
            errCallBack(err)
          }else{
            successCallBack(customer, extractOrder, trafficPlan, flowHistory)
          }
        })
      },
      refundTraffic: function(models, extractOrder, message, successCallBack, errCallBack) {
        var customer = this
        async.waterfall([function(next) {
          if(extractOrder.chargeType == models.Customer.CHARGETYPE.BALANCE){
            next(null, customer, extractOrder)
          }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.SALARY){
            customer.updateAttributes({
              salary: parseFloat(customer.salary) + parseFloat(extractOrder.total)
            }).then(function(customer) {
              next(null, customer, extractOrder)
            }).catch(function(err) {
              next(err)
            })
          }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.REMAININGTRAFFIC){
            customer.updateAttributes({
              remainingTraffic: parseFloat(customer.remainingTraffic) + parseFloat(extractOrder.total)
            }).then(function(customer) {
              next(null, customer, extractOrder)
            }).catch(function(err) {
              next(err)
            })
          }
        }, function(customer, extractOrder, next) {
          extractOrder.getTrafficPlan().then(function(trafficPlan) {
            extractOrder.trafficPlan = trafficPlan
            next(null, customer, extractOrder, trafficPlan)
          }).catch(function(err) {
            next(err)
          })
        },function(customer, extractOrder, trafficPlan, next) {
          if(extractOrder.chargeType == models.Customer.CHARGETYPE.BALANCE){
            var msg = "提取" + trafficPlan.name + "至" + extractOrder.phone + "失败。原因：" + message + "。对你造成的不便我们万分抱歉"
          }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.SALARY){
            var msg = "提取" + trafficPlan.name + "至" + extractOrder.phone + "失败。原因：" + message + "。分销奖励已经退还账户，对你造成的不便我们万分抱歉"
          }else if(extractOrder.chargeType == models.Customer.CHARGETYPE.REMAININGTRAFFIC){
            var msg = "提取" + trafficPlan.name + "至" + extractOrder.phone + "失败。原因：" + message + "。充值余额已经退还账户，对你造成的不便我们万分抱歉"
          }
          customer.takeFlowHistory(models, extractOrder, extractOrder.cost, msg, models.FlowHistory.STATE.ADD, function(flowHistory){
              next(null, customer, extractOrder, flowHistory)
            }, function(err) {
              next(err)
            }, extractOrder.chargeType)
        }], function(err, customer, extractOrder, flowHistory) {
          if(err){
            errCallBack(err)
          }else{
            successCallBack(customer, extractOrder, flowHistory)
          }
        })
      },
      reduceIntegral: function(models, extractOrder) {
        var customer = this
        return new Promise(function (resolve, reject) {
          async.waterfall([function(next){
            extractOrder.getTrafficPlan().then(function(trafficPlan) {
              extractOrder.trafficPlan = trafficPlan
              next(null, extractOrder, trafficPlan)
            }).catch(function(err) {
              next(err)
            })
          }, function(extractOrder, trafficPlan, next){
            var enough = extractOrder.totalIntegral <= customer.totalIntegral
            if(enough){
              customer.updateAttributes({
                  totalIntegral: customer.totalIntegral - extractOrder.totalIntegral
                }).then(function(customer){
                  next(null, customer, extractOrder, trafficPlan)
                }).catch(function(err) {
                  next(err)
                })
            }else{
              next(new Error("积分不足"))
            }
          }, function(customer, extractOrder, trafficPlan, next){
            customer.takeFlowHistory(models, extractOrder, extractOrder.totalIntegral, "购买流量" + trafficPlan.name + "至" + extractOrder.phone + " 支付成功, 扣除积分： " + extractOrder.totalIntegral, models.FlowHistory.STATE.REDUCE, function(flowHistory){
                next(null, customer, extractOrder, trafficPlan, flowHistory)
              }, function(err){
                next(err)
              }, extractOrder.chargeType)
          }], function(err, customer, extractOrder, trafficPlan, flowHistory){
            if(err){
              reject(err)
            }else{
              resolve(customer, extractOrder, trafficPlan, flowHistory)
            }
          })
        });
      },
      refundIntegral: function(models, extractOrder, message) {
        var customer = this
        return new Promise(function (resolve, reject) {
          async.waterfall([function(next) {
              customer.updateAttributes({
                totalIntegral: customer.totalIntegral + extractOrder.totalIntegral
              }).then(function(customer) {
                next(null, customer, extractOrder)
              }).catch(function(err) {
                next(err)
              })
          }, function(customer, extractOrder, next) {
            extractOrder.getTrafficPlan().then(function(trafficPlan) {
              extractOrder.trafficPlan = trafficPlan
              next(null, customer, extractOrder, trafficPlan)
            }).catch(function(err) {
              next(err)
            })
          },function(customer, extractOrder, trafficPlan, next) {
            var msg = "提取" + trafficPlan.name + "至" + extractOrder.phone + "失败。原因：" + message + "。积分已经退还账户，对你造成的不便我们万分抱歉"
            customer.takeFlowHistory(models, extractOrder, extractOrder.totalIntegral, msg, models.FlowHistory.STATE.ADD, function(flowHistory){
                next(null, customer, extractOrder, flowHistory)
              }, function(err) {
                next(err)
              }, extractOrder.chargeType)
          }], function(err, customer, extractOrder, flowHistory) {
            if(err){
              reject(err)
            }else{
              resolve(customer, extractOrder, flowHistory)
            }
          })
        });
      },
      reduceAncestries: function(models, extractOrder, message) {
        var customer = this
        return new Promise(function (resolve, reject) {
          async.waterfall([function(next){
            var ll = customer.getAncestry()
            if(ll.length <= 0){
              console.log("on ancestry")
              return;
            }
            models.Customer.findAll({
              where: {
                id: {
                  $in: ll
                }
              }
            }).then(function(ancestries) {
              next(null, ancestries)
            }).catch(function(err) {
              next(err)
            })
          }, function(ancestries, next) {
            extractOrder.getTrafficPlan().then(function(trafficPlan) {
              extractOrder.trafficPlan = trafficPlan
              next(null, ancestries, extractOrder, trafficPlan)
            }).catch(function(err) {
              next(err)
            })
          }, function(ancestries, extractOrder, trafficPlan, pass) {
            async.each(ancestries, function(ancestry, next){
              models.FlowHistory.findOne({
                where: {
                  type: extractOrder.className(),
                  typeId: extractOrder.id,
                  state: models.FlowHistory.STATE.ADD,
                  customerId: ancestry.id
                },
                order: [
                  ["updatedAt", "DESC"]
                ]
              }).then(function(flowHistory){
                if(!flowHistory){
                  pass(null, customer, extractOrder, 0)
                }
                var salary = parseFloat(ancestry.salary) - parseFloat(flowHistory.amount)
                if(salary < 0){
                  salary = 0
                }
                ancestry.updateAttributes({
                  salary: salary
                }).then(function(ancestry){
                  var msg = "提取" + trafficPlan.name + "至" + extractOrder.phone + "失败。原因：" + message + "。分销奖励已经取消，对你造成的不便我们万分抱歉"
                  ancestry.takeFlowHistory(models, extractOrder, parseFloat(flowHistory.amount).toFixed(2), msg, models.FlowHistory.STATE.REDUCE, function(flowHistory){
                      next(null, customer, extractOrder, flowHistory)
                  }, function(err) {
                    next(err)
                  }, extractOrder.chargeType)
                })
              }).catch(function(err){
                next(err)
              })
            }, function(err){
              if(err){
                pass(err)
              }else{
                pass(null, customer, extractOrder)
              }
            })
          }], function(err, customer, extractOrder) {
            if(err){
              reject(err)
            }else{
              resolve(customer, extractOrder)
            }
          })
        });
      },
      takeFlowHistory: function(models, obj, amount, comment, state, successCallBack, errCallBack, from){
        var customer = this
        if(state !== models.FlowHistory.STATE.ADD && state !== models.FlowHistory.STATE.REDUCE){
          return errCallBack(new Error("Type Error"))
        }
        var params = {
          customerId: customer.id,
          state: state,
          amount: amount,
          comment: comment
        }
        if(obj !== undefined){
          _.merge(params, {
            type: obj.className(),
            typeId: obj.id
          })
        }
        if(from != undefined) {
          _.merge(params, {
            trafficType: from,
            ownerId: obj.id
          })
        }
        models.FlowHistory.build(params).save().then(function(flowHistory){
          successCallBack(flowHistory)
        }).catch(function(err){
          errCallBack(err)
        })
      },
      getLastFlowHistory: function(models, state, successCallBack, errCallBack){
        var customer = this
        if(state === undefined){
          this.getFlowHistories().then(function(flowHistories){
            if(flowHistories.length > 0){
              successCallBack(flowHistories[flowHistories.length - 1])
            }else{
              successCallBack()
            }
          }).catch(errCallBack)
        }else if( (state === models.FlowHistory.STATE.ADD) || (state === models.FlowHistory.STATE.REDUCE) ){
          async.waterfall([function(next){
            models.FlowHistory.findOne({ where: {
                customerId: customer.id,
                state: state
              }, order: [
                ['createdAt', 'DESC']
              ]
            }).then(function(flowHistory){
              if(flowHistory){
                customer.lastFlowHistory = flowHistory
                next(null, customer)
              }else{
                successCallBack(customer)
              }
            }).catch(errCallBack)
          }, function(customer, next){
            var flowHistory = customer.lastFlowHistory
            if(flowHistory.type){
              models[flowHistory.type].findById(flowHistory.typeId).then(function(source){
                if(source){
                  flowHistory.source = source
                }
                successCallBack(customer, flowHistory)
              }).catch(errCallBack)
            }else{
              successCallBack(customer, flowHistory)
            }
          }], function(err, result){
          })

        }else{
          errCallBack(new Error("FlowHistory state not include"))
        }
      },
      givenTo: function(models, otherone, amount, successCallBack, errCallBack){
        var customer = this

        if(customer.remainingTraffic < amount){
          errCallBack(new Error("not enough"))
          return
        }

        async.waterfall([function(next) {
          customer.updateAttributes({
            remainingTraffic: customer.remainingTraffic - amount
          }).then(function(customer) {
            next(null, customer)
          }).catch(function(err) {
            next(err)
          })
        }, function(customer, next) {
          customer.takeFlowHistory(models, otherone, amount, "向" + otherone.phone + "用户转赠流量" + amount +"E币", models.FlowHistory.STATE.REDUCE,
            function(flowHistory){
              next(null, customer, flowHistory)
            }, function(err) {
              next(err)
            })
        }, function(customer, flowHistory, next) {
          otherone.updateAttributes({
            remainingTraffic: otherone.remainingTraffic + amount
          }).then(function(otherone) {
            next(null, otherone)
          }).catch(function(err) {
            next(err)
          })
        }, function(otherone, next) {
          otherone.takeFlowHistory(models, otherone, amount, customer.phone + "向您转赠流量" + amount +"E币", models.FlowHistory.STATE.ADD,
            function(flowHistory){
              next(null, otherone, flowHistory)
            }, function(err) {
              next(err)
            })
        }], function(err) {
          if(err){
            errCallBack(err)
          }else{
            successCallBack()
          }
        })
      },
      getAncestry: function(){
        if(this.ancestry) {
          return this.ancestry.split('/')
        }else{
          return []
        }
      }
    }),
    scopes: {

    }
  });

  Customer.CHARGETYPE = {
    BALANCE: "balance",
    SALARY: "salary",
    REMAININGTRAFFIC: "remainingTraffic"
  }

  return Customer;
};