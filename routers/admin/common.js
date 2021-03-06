var express = require('express');
var admin = express.Router();
var models  = require('../../models');
var formidable = require('formidable')
var helpers = require("../../helpers")
var fs        = require('fs');
var _ = require('lodash')
var async = require("async")
var config = require("../../config")

admin.get('/', function (req, res) {
  res.render('admin/home');
});

admin.post('/kindeditor/uploads', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if(err){
      res.send({ "error": 1, 'message': "server error" })
      return
    }else if(!files.imgFile.type.match('^image\/')){
      res.send({ "error": 1, 'message': "只允许上传图片" })
      return
    }else if(files.imgFile.size > config.maxfileuploadsize){
      res.send({ "error": 1, 'message': "超出最大文件限制" })
      return
    }
    var staticpath = '/public'
        dirpath = '/kindeditor/uploads',
        filename = helpers.fileUploadSync(files.imgFile, staticpath + dirpath),
        info = {
            "error": 0,
            "url": dirpath + "/" + filename
        };
    res.send(info)
  })
})

admin.post('/homeimage/uploads', function(req, res) {

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if(err){
      res.send({ "error": 1, 'message': "server error" })
      return
    }else if(!files.adimage.type.match('^image\/')){
      res.send({ "error": 1, 'message': "只允许上传图片" })
      return
    }else if(files.adimage.size > config.maxfileuploadsize){
      res.send({ "error": 1, 'message': "超出最大文件限制" })
      return
    }
    var staticpath = '/public'
        dirpath = '/uploads'
        files.adimage.name = "banner.png"
        filename = helpers.fileUploadSync(files.adimage, staticpath + dirpath, true),
        info = {
            "error": 0,
            "url": dirpath + "/" + filename
        };
    res.redirect("/admin")
  })
})

admin.get('/kindeditor/filemanager', function (req, res) {
  var dirpath = '/kindeditor/uploads',
      fspath = path.join(process.env.PWD, '/public' + dirpath),
      files = []
  fsss = fs.readdirSync(path.join(process.env.PWD, '/public' + dirpath))
    .filter(function(file) {
      return (file.indexOf('.') !== 0) && (file.match(/(\.image$|\.png$|\.gif$|\.jpg$)/i))
    })
    .forEach(function(file) {
      var refile = fs.statSync(fspath + '/' + file)
          splitd = file.split('.'),
          type = splitd[splitd.length - 1]

      files.push({
        is_dir: false,
        has_file: false,
        filesize: refile.size,
        dir_path: "",
        is_photo: true,
        filetype: type,
        filename: file,
        datetime: helpers.strftime(refile.birthtime)
      })
    })

    res.json({ moveup_dir_path: "",
        current_dir_path: dirpath,
        current_url: dirpath + '/',
        total_count:5,
        file_list: files
      })
})


admin.get('/fixdata', function(req, res){

  async.waterfall([function(next){
    models.FlowHistory.findAll({
      where: {
        trafficType: "salary",
        type: "ExtractOrder"
      }
    }).then(function(flowHistories){
      next(null, flowHistories)
    })
  }, function(flowHistories, pass){
    async.map(flowHistories, function(flow, next){
      models.ExtractOrder.findById(flow.typeId).then(function(extractOrder){
        if(extractOrder){
          models.Customer.findById(extractOrder.customerId).then(function(customer){
            if(customer){
              flow.updateAttributes({
                type: customer.className(),
                typeId: customer.id
              }).then(function(flow){
                next(null, flow)
              }).catch(function(err){
                next(err)
              })
            }else{
              console.log("Customer no found " + extractOrder.customerId)
              next(null)
            }
          })
        }else{
          console.log("ExtractOrder no found " + flow.typeId)
          next(null)
        }
      }).catch(function(err){
        next(err)
      })
    }, function(err, flows){
      if(err){
        pass(err)
      }else{
        pass(null, flows)
      }
    })
  }], function(err, flows){
    if(err){
      console.log(err)
      res.json(err)
    }else{
      res.json({success: true})
    }
  })

})

module.exports = admin;