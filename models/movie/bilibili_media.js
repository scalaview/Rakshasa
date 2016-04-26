'use strict';
var request = require("request")
var config = require(process.env.PWD + "/config")
var url = require('url');

function get_download_url(cid){
  var params = {
    otype: 'json',
    cid: cid,
    type: 'mp4',
    quality: 4,
    appkey: config.bilibili_appkey
  }
  var host = "http://interface.bilibili.com/playurl"
  var options = {
    uri: host,
    method: 'GET',
    qs: params
  }
  return new Promise(function (resolve, reject) {
      request(options, function (error, res) {
        if (!error && res.statusCode == 200) {
          resolve(res)
        }else{
          reject(error)
        }
       });
    });
}

module.exports = function(sequelize, DataTypes) {
  var BilibiliMedia = sequelize.define('BilibiliMedia', {
      avid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      mid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      offsite: {
        type: DataTypes.STRING,
      },
      download: {
        type: DataTypes.STRING,
      },
      expires: {
        type: DataTypes.INTEGER,
      },
      display: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
  }, {
    tableName: 'douban_bilibili_medias',
    classMethods: {
      associate: function(models) {
        models.BilibiliMedia.belongsTo(models.BilibiliMovie, { foreignKey: 'avid', targetKey: 'avid' });
      }
    },
    instanceMethods: {
      getDownloadUrl: function(){
        var media = this
        if( media.expires * 1000 < (new Date()).getTime()){
          return new Promise(function(resolve, reject){
            get_download_url(media.cid).then(function(res){
              var data = JSON.parse(res.body)
              console.log(data)
              var download_url = data['durl'][0]['url']
              var query = url.parse(download_url, true).query
              var expires = 0
              if(query.expires){
                expires = query.expires
              }else if(query.wsTime){
                expires = query.wsTime
              }else if(query.tm){
                expires = query.tm
              }
              resolve(download_url)
              media.updateAttributes({
                download: download_url,
                expires: expires
              })
            }).catch(function(err){
              reject(err)
            })
          })
        }else{
          return new Promise(function(resolve, reject){
            if(media.download){
              resolve(media.download)
            }else{
              reject(new Error("no found"))
            }
          })
        }
      },
      getJJDownloadUrl: function(){
        var media = this
        return "http://www.bilibilijj.com/Files/DownLoad/"+ media.cid +".mp4/www.bilibilijj.com.mp4?mp3=true";
      }
    }
  });
  return BilibiliMedia;
};