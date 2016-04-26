'use strict';
module.exports = function(sequelize, DataTypes) {
  var Order = sequelize.define('Order', {
    state: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    dataPlanId: { type: DataTypes.INTEGER, allowNull: false },
    paymentMethodId: { type: DataTypes.INTEGER, allowNull: false },
    discount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
      set: function(val) {
        this.setDataValue('discount', parseFloat(val))
      }
    },
    total: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0 ,
      set: function(val) {
        this.setDataValue('total', parseFloat(val))
      }
    },
    transactionId: { type: DataTypes.STRING, allowNull: true },
    stateName: {
      type: DataTypes.VIRTUAL,
      get: function(){
        switch(this.state){
          case 0:
            return "初始化"
          case 1:
            return "待处理"
          case 2:
            return "付款成功"
          case 3:
            return "付款失败"
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        models.Order.belongsTo(models.Customer, { foreignKey: 'customerId' });
        models.Order.belongsTo(models.PaymentMethod, { foreignKey: 'paymentMethodId' });
        models.Order.belongsTo(models.DataPlan, { foreignKey: 'dataPlanId' });
      }
    },
    instanceMethods: {
      className: function(){
        return "Order"
      },
      isPaid: function(){
        return (this.state === Order.STATE.PAID)
      }
    }
  });

  Order.STATE = {
    INIT: 0,
    ONHOLD: 1,
    PAID: 2,
    FAIL: 3
  }

  return Order;
};