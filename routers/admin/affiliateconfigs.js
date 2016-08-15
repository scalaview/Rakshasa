var express = require('express');
var admin = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var formidable = require('formidable')
var async = require("async")
var _ = require('lodash')

// login filter
var skipUrls = [ '^\/wechat[\/|\?|\#]\?.*', '^\/admin\/login[\/|\?|\#]\?.*', '^\/admin\/register[\/|\?|\#]\?.*']

admin.all("*", function(req, res, next) {
  var url = req.originalUrl
  if(req.session.user_id){
    models.User.findById(req.session.user_id).then(function(user){
      res.locals.user = user
      next()
      return
    })
  }else{
    for (var i = skipUrls.length - 1; i >= 0; i--) {
      var match = req.originalUrl.match(skipUrls[i]);
      if(match !== null){
        next()
        return
      }
    };
    var encodeUrl = new Buffer(url).toString('base64');
    return res.redirect("/admin/login?to=" + encodeUrl);
  }
})

admin.use(function(req, res, next){
  res.originrender = res.render
  res.render = function(path, options, fn){
    res.originrender(path, _.merge(options, { info: req.flash('info'), err: req.flash('err') }))
  }
  next();
});

admin.use(function(req, res, next){
  helpers.compact(req.body)
  helpers.compact(req.query)
  helpers.compact(req.params)
  next();
});


admin.get('/affiliateconfigs', function(req, res) {

  async.waterfall([function(pass){
    async.map([1, 2, 3], function(level, next) {
      models.AffiliateConfig.findOrCreate({
        where: {
          level: level,
          trafficPlanId: null
        },
        defaults: {
          level: level
        }
      }).spread(function(aConfig) {
        next(null, aConfig)
      }).catch(function(err) {
        next(err)
      })
    }, function(err, result) {
      if(err){
        pass(err)
      }else{
        pass(null, res)
      }
    })
  }, function(result, next){
    models.AffiliateConfig.findAll({
      trafficPlanId: "is not null"
    }).then(function(aConfigs){
      next(null, result, aConfigs)
    }).catch(function(err){
      next(err)
    })
  }], function(err, result, aConfigs){
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      helpers.getAllTrafficPlans(true, function(err, trafficPlanCollection, trafficPlanOptions) {
        trafficPlanOptions["class"] = "select2 col-lg-12 col-xs-12 disabled"
        trafficPlanOptions["style"] = "width: 100%"
        res.render('admin/affiliateconfigs/index', {
          aConfigs: aConfigs,
          trafficPlanCollection: trafficPlanCollection,
          trafficPlanOptions: trafficPlanOptions
        })
      })
    }
  })

})


admin.get('/affiliateconfigs/:id/edit', function(req, res) {
  models.AffiliateConfig.findById(req.params.id).then(function(aConfig) {
    res.render('admin/affiliateconfigs/show', { aConfig: aConfig })
  }).catch(function(err) {
    console.log(err)
    res.redirect('/500')
  })
})

admin.post('/affiliateconfig/:id', function(req, res) {

  async.waterfall([function(next) {
    models.AffiliateConfig.findById(req.params.id).then(function(aConfig) {
      next(null, aConfig)
    }).catch(function(err) {
      next(err)
    })
  }, function(aConfig, next) {
    aConfig.updateAttributes({
      percent: req.body.percent
    }).then(function(aConfig) {
      next(null, aConfig)
    }).catch(function(err) {
      next(err)
    })
  }], function(err, aConfig) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      req.flash("info", "update succes")
      res.redirect('/admin/affiliateconfigs/' + aConfig.id + '/edit')
    }
  })

})

admin.get('/affiliateconfig/trafficplan/:id/edit', function(req, res) {

  async.waterfall([function(next) {
    models.TrafficPlan.findById(req.params.id).then(function(trafficPlan) {
      next(null, trafficPlan)
    }).catch(function(err){
      next(err)
    })
  }, function(trafficPlan, pass) {
    async.map([1, 2, 3], function(level, next) {
      models.AffiliateConfig.findOrCreate({
        where: {
          level: level,
          trafficPlanId: trafficPlan.id
        },
        defaults: {
          level: level,
          trafficPlanId: trafficPlan.id
        }
      }).spread(function(aConfig) {
        next(null, aConfig)
      }).catch(function(err) {
        next(err)
      })
    }, function(err, result) {
      if(err){
        pass(err)
      }else{
        pass(null, result, trafficPlan)
      }
    })

  }], function(err, result, trafficPlan) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      res.render('admin/affiliateconfigs/edit', { result: result, trafficPlan: trafficPlan } )
    }
  })


})

admin.post('/affiliateconfig/trafficplan/:id', function(req, res) {
  console.log(req.body)
  async.waterfall([function(next) {
    models.TrafficPlan.findById(req.params.id).then(function(trafficPlan) {
      next(null, trafficPlan)
    }).catch(function(err) {
      next(err)
    })
  }, function(trafficPlan, next) {

    models.AffiliateConfig.findAll({
      where: {
        trafficPlanId: trafficPlan.id
      }
    }).then(function(aConfigs) {
      next(null, aConfigs, trafficPlan)
    }).catch(function(err) {
      next(err)
    })

  }, function(aConfigs, trafficPlan, pass) {

    async.each(aConfigs, function(aConfig, next) {
      aConfig.updateAttributes({
        percent: req.body['percent[' + aConfig.level + ']']
      }).then(function(aConfig) {
        next(null, aConfig)
      }).catch(function(err) {
        next(err)
      })
    }, function(err, result) {
      if(err){
        pass(err)
      }else{
        pass(null, result, trafficPlan)
      }
    })

  }], function(err, result, trafficPlan) {
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      req.flash("info", "update succes")
      res.redirect('/admin/affiliateconfig/trafficplan/' + trafficPlan.id + '/edit')
    }
  })

})



module.exports = admin;