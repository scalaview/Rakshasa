'use strict';
var helpers = require('../helpers')
var async = require("async")
var config = require("../config")
var _ = require('lodash')

module.exports = function(sequelize, DataTypes) {
  var Apk = sequelize.define('Apk', {
      name: { type: DataTypes.STRING },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      downloadTime: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      version: { type: DataTypes.STRING, allowNull: true },
      sellerId: { type: DataTypes.INTEGER, allowNull: true },
      reward: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      sortNum: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      apk: {
        type: DataTypes.STRING,
        allowNull: true,
        set: function(file){
          if(file == null){
            this.setDataValue('apk', null)
          }else if(file.size > 0 && file.name.match(/\.apk$/i)){
            var filename = helpers.fileUploadSync(file)
            this.setDataValue('apk', file.name);
            this.setDataValue('apkPath', filename);
            this.setDataValue('apkSize', file.size);
          }
        }
      },
      apkPath: {
        type: DataTypes.STRING,
        allowNull: true,
        get: function(){
           var apkPath = this.getDataValue('apkPath');
           return '/uploads/' + apkPath
        }
      },
      apkSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
        set: function(file){
          if(file == null){
            this.setDataValue('icon', null)
          }else if(file.size > 0 && file.type.match('^image\/')){
            var filename = helpers.fileUploadSync(file)
            this.setDataValue('icon', filename);
          }
        },
        get: function(){
          var icon = this.getDataValue('icon');
          if(icon) return '/uploads/' + icon
          return
        }
      },
      image01: {
        type: DataTypes.STRING,
        allowNull: true,
        set: function(file){
          if(file == null){
            this.setDataValue('image01', null)
          }else if(file.size > 0 && file.type.match('^image\/')){
            var filename = helpers.fileUploadSync(file)
            this.setDataValue('image01', filename);
          }
        },
        get: function(){
          var image01 = this.getDataValue('image01');
          if(image01) return '/uploads/' + image01
          return
        }
      },
      image02: {
        type: DataTypes.STRING,
        allowNull: true,
        set: function(file){
          if(file == null){
            this.setDataValue('image02', null)
          }else if(file.size > 0 && file.type.match('^image\/')){
            var filename = helpers.fileUploadSync(file)
            this.setDataValue('image02', filename);
          }
        },
        get: function(){
          var image02 = this.getDataValue('image02');
          if(image02) return '/uploads/' + image02
          return
        }
      },
      image03: {
        type: DataTypes.STRING,
        allowNull: true,
        set: function(file){
          if(file == null){
            this.setDataValue('image03', null)
          }else if(file.size > 0 && file.type.match('^image\/')){
            var filename = helpers.fileUploadSync(file)
            this.setDataValue('image03', filename);
          }
        },
        get: function(){
          var image03 = this.getDataValue('image03');
          if(image03) return '/uploads/' + image03
          return
        }
      },
      adimage: {
        type: DataTypes.STRING,
        allowNull: true,
        set: function(file){
          if(file == null){
            this.setDataValue('adimage', null)
          }else if(file.size > 0 && file.type.match('^image\/')){
            var filename = helpers.fileUploadSync(file)
            this.setDataValue('adimage', filename);
          }
        },
        get: function(){
          var adimage = this.getDataValue('adimage');
          if(adimage) return '/uploads/' + adimage
          return
        }
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      digest: { type: DataTypes.STRING, allowNull: true }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.Apk.belongsTo(models.Seller, { foreignKey: 'sellerId' })
      },
      listAll: function(successCallBack, errCallBack) {
        this.query({}, successCallBack, errCallBack)
      },
      activeList: function(successCallBack, errCallBack) {
        this.query({
          where: {
            isActive: true
          },
          order: [
            ['sortNum', 'DESC']
          ]
        }, successCallBack, errCallBack)
      },
      query: function(option, successCallBack, errCallBack) {
        Apk.findAll(option || {}).then(function(apks) {
          async.map(apks, function(apk, next){
            apk.getSeller().then(function(seller) {
              apk.seller = seller
              next(null, apk)
            }).catch(function(err) {
              next(err)
            })
          }, function(err, apks) {
            if(err){
              errCallBack(err)
            }else{
              successCallBack(apks)
            }
          })
        })
      }
    },
    instanceMethods: {
      className: function(){
        return "Apk"
      }
    },
    scopes: {
      active: {
        where: {
          isActive: false
        },
        order: [
          ['sortNum', 'DESC']
        ]
      }
    }
  });
  return Apk;
};