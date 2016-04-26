var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var formidable = require('formidable')
var async = require("async")
var _ = require('lodash')


admin.get("/messagequeues", function(req, res) {
  var params = {};
  if(req.query.phone !== undefined && req.query.phone.present()){
    params = _.merge(params, { phone: { $like: "%{{phone}}%".format({ phone: req.query.phone }) } } )
  }
  if(req.query.type !== undefined && req.query.type.present()){
    params = _.merge(params, { type: req.query.type })
  }
  if(req.query.state !== undefined && req.query.state.present()){
    params = _.merge(params, { state: req.query.state })
  }
  models.MessageQueue.findAndCountAll({
    where: params,
    limit: req.query.perPage || 15,
    offset: helpers.offset(req.query.page, req.query.perPage || 15),
    order: [
      ['updatedAt', 'DESC']
    ]
  }).then(function(messageQueues) {
    var messagequeues = helpers.setPagination(messageQueues, req),
        messageTypeOptions = { name: "type", class: 'select2 col-lg-12 col-xs-12', includeBlank: true },
        stateTypeOptions = { name: "state", class: 'select2 col-lg-12 col-xs-12', includeBlank: true }
        messageTypeCollections = [],
        stateTypeCollections = []
    for (var key in models.MessageQueue.messageType) {
      messageTypeCollections.push([models.MessageQueue.messageType[key], key])
    };
    for (var key in models.MessageQueue.stateType) {
      stateTypeCollections.push([models.MessageQueue.stateType[key], key])
    };
    res.render("admin/messagequeues/index", {
      messagequeues: messagequeues,
      query: req.query,
      messageTypeCollections: messageTypeCollections,
      messageTypeOptions: messageTypeOptions,
      stateTypeCollections: stateTypeCollections,
      stateTypeOptions: stateTypeOptions
    })
  })
})


module.exports = admin;