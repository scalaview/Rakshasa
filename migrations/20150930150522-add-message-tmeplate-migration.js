'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.sequelize.query("insert into MessageTemplates (name, content, createdAt, updatedAt) values ('recharge message', '【广州孚技网络科技】尊敬的{{phone}}用户，您好，您通过[孚云]微信公众号充值的{{plan}}已经提交，将在两个小时内到账。如未成功到账，请关注[孚云]公众号查询流量充值进度。', CURTIME(), CURTIME())");
  },

  down: function (queryInterface, Sequelize) {
  }
};
