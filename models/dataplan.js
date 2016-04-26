'use strict';
module.exports = function(sequelize, DataTypes) {
  var DataPlan = sequelize.define('DataPlan', {
    name: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.INTEGER, allowNull: false },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      set: function(val) {
        this.setDataValue('price', parseFloat(val))
      }
   }
  }, {
    classMethods: {
      associate: function(models) {
        models.DataPlan.hasMany(models.Order, { foreignKey: 'dataPlanId' })
      },
      allOptions: function(successCallBack, errCallBack) {
        DataPlan.findAll({ order: [ 'value'
          ] }).then(successCallBack).catch(errCallBack)
      }
    }
  });
  return DataPlan;
};