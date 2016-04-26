var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var formidable = require('formidable')
var async = require("async")
var _ = require('lodash')
var config = require("../../config")
var WechatAPI = require('wechat-api');
// var api = new WechatAPI(config.appId, config.appSecret);

var api = helpers.API


admin.get('/wechatmenus', function(req, res) {

  async.waterfall([createHomeMenus, getMenus, function(result, next) {
    next(null, result)
  }], function(err, result) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      res.render('admin/wechatmenus/index', { wechatmenus: result })
    }
  })

})

admin.post('/wechatmenus', function(req, res) {
  var body = req.body
  var menu_1 = {
          name: body.menu_1_name,
          event: body.menu_1_event,
          key: body.menu_1_key,
          url: body.menu_1_url
        },
      menu_2 = {
          name: body.menu_2_name,
          event: body.menu_2_event,
          key: body.menu_2_key,
          url: body.menu_2_url
        },
      menu_3 = {
          name: body.menu_3_name,
          event: body.menu_3_event,
          key: body.menu_3_key,
          url: body.menu_3_url
        }
  var list  = [menu_1, menu_2, menu_3].map(function(value, index) {
        return { index: index, top: value}
      })

  async.map(list, function(one, next) {
    var index = one.index,
        top = one.top
    models.WechatMenu.findOrCreate({
      where: {
        key: top.key
      }
    }).spread(function(one) {
      one.updateAttributes({
        name: top.name,
        event: top.event,
        url: top.url
      }).then(function(one) {
        list.map(function(i, e) {
          return { index: i, top: e}
        })

        updateMenus(body, one, index, next)
      }).catch(function(err) {
        next(err)
      })
    }).catch(function(err) {
      next(err)
    })


  }, function(err, result) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      api.createMenu(buildMenuJSON(result), function(err, data) {
        if(err){
          console.log(err)
          req.flash("err", err.errmsg)
        }else{
          req.flash('info', "success")
        }
        res.redirect('/admin/wechatmenus')
      });
    }
  })


})



function updateMenus(body, top, index, pass){
  function stripArr(array, index) {
    if(array){
      return array[index]
    }else{
      return null
    }
  }
  var index = parseInt(index) + 1
  var wrapped = [0, 0, 0, 0, 0].map(function(value, index) {
    return {index: index, value: value}
  })
  async.map(wrapped, function(n, next) {
    var idx = parseInt(n.index)
    var menu = {
      name: body['menu_'+ index +'[name]' + '_' + idx],
      event: body['menu_'+ index +'[event]' + '_' + idx],
      key: 'menu_'+ index +'[key]' + '_' + idx ,
      url: body['menu_'+ index +'[url]' + '_' + idx],
      sortNum: body['menu_'+ index +'[sortNum]' + '_' + idx],
      ancestry: top
    }

    models.WechatMenu.findOrCreate({
      where: {
        key: menu.key
      },
      defaults: menu
    }).then(function(m) {

      if(!m[1]){
        for (var k in menu) {
          if(menu[k] === undefined){
            menu[k] = null
          }
        };
        m[0].updateAttributes({
          name: menu.name,
          event: menu.event,
          url: menu.url
        }).then(function(menuOne){
          next(null, menuOne)
        }).catch(function(err) {
          next(err)
        })
      }else{
        next(null, m[0])
      }
    }).catch(function(err) {
      next(err)
    })
  }, function(err, result) {
    if(err){
      pass(err)
    }else{
      pass(null, {top: top, menus: result})
    }
  })
}


function buildMenuJSON(tops){
  function doBuild(me, children) {
    var pre = {
        type: me.event,
        name: me.name
      }

    if(children.length > 0) {
      var list = []
      for (var i = 0; i < children.length; i++) {
        list.push(doBuild(children[i], []))
      };
      if(list.compact().length == 0){
        if(me.event == models.WechatMenu.EVENT.VIEW && (me.url != null && me.url != undefined && me.url != '' )){
          pre = _.merge(pre, {
            url: me.url
          })
          return pre
        }else if(me.event == models.WechatMenu.EVENT.CLICK && (me.url != null && me.url != undefined && me.url != '' )){
          pre = _.merge(pre, {
            key: me.key
          })
          return pre
        }else{
          return
        }
      }
      pre = _.merge(pre, {
        sub_button: list.compact()
      })
      return pre
    }else if(me.event == models.WechatMenu.EVENT.VIEW && (me.url != null && me.url != undefined && me.url != '' ) ){
      pre = _.merge(pre, {
        url: me.url
      })
      return pre
    }else if(me.event == models.WechatMenu.EVENT.CLICK && (me.url != null && me.url != undefined && me.url != '' ) ){
      pre = _.merge(pre, {
        key: me.key
      })
      return pre
    }else{
      return
    }
  }

  var json = { button: [] }

  for (var i = 0; i < tops.length ; i++) {
    var top = tops[i].top,
        menus = tops[i].menus
    json.button.push(doBuild(top, menus))
  };
  json.button = json.button.compact()
  console.log(JSON.stringify(json))
  return json
}


function createHomeMenus(pass){
  var keys = ['menu_1', 'menu_2', 'menu_3']
  async.map(keys,function(key, next) {
    models.WechatMenu.findOrCreate({
      where: {
        key: key
      },
      defaults: {
        name: key,
        key: key
      }
    }).spread(function(menu) {
      next(null, menu)
    }).catch(function(err) {
      next(err)
    })

  }, function(err, result) {
    if(err){
      console.log(err)
    }
    pass(null, result)
  })
}

function getMenus(tops, pass){

  async.map(tops, function(top, next) {
    models.WechatMenu.findAll({
      where: {
        ancestry: top.id + ''
      },
      order:[
        ['sortNum', "ASC"]
      ]
    }).then(function(menus) {
      next(null, { top: top, menus: menus })
    })
  }, function(err, result) {
    if(err){
      console.log(err)
      pass(err)
    }else{
      pass(null, result)
    }
  })

}

module.exports = admin;