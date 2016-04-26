'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.addIndex('Apks', ['isActive']);
    queryInterface.addIndex('Apks', ['sellerId']);
    queryInterface.addIndex('Apks', ['sortNum']);

    queryInterface.addIndex('Banners', ['active']);
    queryInterface.addIndex('Banners', ['sortNum']);

    queryInterface.addIndex('Coupons', ['trafficPlanId']);
    queryInterface.addIndex('Coupons', ['isActive']);
    queryInterface.addIndex('Coupons', ['expiredAt']);

    queryInterface.addIndex('Customers', ['wechat']);
    queryInterface.addIndex('Customers', ['phone']);
    queryInterface.addIndex('Customers', ['levelId']);
    queryInterface.addIndex('Customers', ['ancestryDepth']);
    queryInterface.addIndex('Customers', ['ancestry']);


    queryInterface.addIndex('DConfigs', ['name']);
    queryInterface.addIndex('DConfigs', ['value']);


    queryInterface.addIndex('ExtractOrders', ['state']);
    queryInterface.addIndex('ExtractOrders', ['exchangerType']);
    queryInterface.addIndex('ExtractOrders', ['exchangerId']);
    queryInterface.addIndex('ExtractOrders', ['phone']);
    queryInterface.addIndex('ExtractOrders', ['bid']);
    queryInterface.addIndex('ExtractOrders', ['type']);
    queryInterface.addIndex('ExtractOrders', ['customerId']);
    queryInterface.addIndex('ExtractOrders', ['chargeType']);
    queryInterface.addIndex('ExtractOrders', ['transactionId']);
    queryInterface.addIndex('ExtractOrders', ['taskid']);

    queryInterface.addIndex('FlowHistories', ['customerId']);
    queryInterface.addIndex('FlowHistories', ['state']);
    queryInterface.addIndex('FlowHistories', ['type']);
    queryInterface.addIndex('FlowHistories', ['typeId']);
    queryInterface.addIndex('FlowHistories', ['trafficType']);

    queryInterface.addIndex('FlowTasks', ['seller_id']);
    queryInterface.addIndex('FlowTasks', ['expiredAt']);
    queryInterface.addIndex('FlowTasks', ['sortNum']);
    queryInterface.addIndex('FlowTasks', ['isActive']);


    queryInterface.addIndex('Levels', ['code']);

    queryInterface.addIndex('MessageTemplates', ['name']);

    queryInterface.addIndex('TrafficGroups', ['providerId']);
    queryInterface.addIndex('TrafficGroups', ['sortNum']);
    queryInterface.addIndex('TrafficGroups', ['display']);

    queryInterface.addIndex('TrafficPlans', ['providerId']);
    queryInterface.addIndex('TrafficPlans', ['sortNum']);
    queryInterface.addIndex('TrafficPlans', ['display']);
    queryInterface.addIndex('TrafficPlans', ['type']);
    queryInterface.addIndex('TrafficPlans', ['bid']);
    queryInterface.addIndex('TrafficPlans', ['trafficGroupId']);

    queryInterface.addIndex('WechatMenus', ['sortNum']);
    queryInterface.addIndex('WechatMenus', ['ancestry']);
    queryInterface.addIndex('WechatMenus', ['ancestryDepth']);

    queryInterface.addIndex('WechatReplies', ['key']);
    queryInterface.addIndex('WechatReplies', ['isActive']);

    queryInterface.addIndex('Withdrawals', ['customerId']);
    queryInterface.addIndex('Withdrawals', ['state']);
    queryInterface.addIndex('Withdrawals', ['phone']);
    return;
  },
  down: function (queryInterface, Sequelize) {
  }
};
