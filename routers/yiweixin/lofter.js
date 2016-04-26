var express = require('express');
var app = express.Router();
var models  = require('../../models')
var helpers = require("../../helpers")
var async = require("async")
var requireLogin = helpers.requireLogin
var config = require("../../config")


app.get('/lofter', requireLogin, function(req, res) {

  if(!req.query.page){
    res.render('yiweixin/lofter/index', { next_url: "/lofter?page=1" });
    return
  }

  async.waterfall([function(next) {
    var params = {
    }
    models.Movie.findAndCountAll({
      where: params,
      limit: req.query.perPage || 15,
      offset: helpers.offset(req.query.page || 1, req.query.perPage || 15),
      order: [
        ['createdAt']
      ]
    }).then(function(movies) {
      next(null, movies)
    }).catch(function(err){
      next(err)
    })
  }, movieWithGenres, movieWithImages, movieWithMedias], function(err, movies){
    if(err){
      console.log(err)
      if (req.accepts('json')) {
        res.json({ error: 500 })
      }else{
        res.redirect('/500')
      }
    }else{
      res.format({
        json: function(){
          res.json({ movies: movies.rows, next_url: helpers.nextUrl(movies.count, req.query.page || 1, req.query.perPage || 15, req.query) })
        },
        'default': function() {
          res.status(406).send('Not Acceptable');
        }
      });
    }
  })
})


app.get('/lofter/:id', requireLogin, function(req, res) {
  async.waterfall([function(next){
    models.BilibiliMovie.findById(req.params.id).then(function(bilibiliMovie) {
      next(null, bilibiliMovie)
    }).catch(function(err){
      next(err)
    })
  }, function(bilibiliMovie, next){
    models.BilibiliMedia.findAll({
      where: {
        avid: bilibiliMovie.avid,
        display: true
      }
    }).then(function(medias){
      bilibiliMovie.medias = medias || []
      bilibiliMovie.select_index = 0
      if(medias.length > 0){
        var target = medias[0]
        if(req.query.media_id){
          for (var i = 0; i < medias.length; i++) {
            if(medias[i].id == req.query.media_id){
              target = medias[i]
              bilibiliMovie.select_index = i
              break;
            }
          };
        }
        if(config.usebilibili){
          target.getDownloadUrl().then(function(download_url){
            console.log(download_url)
            bilibiliMovie.download_url = download_url
            next(null, bilibiliMovie)
          }).catch(function(err){
            next(null, bilibiliMovie)
          })
        }else{
          bilibiliMovie.download_url = target.getJJDownloadUrl()
          console.log(bilibiliMovie.download_url)
          next(null, bilibiliMovie)
        }
      }else{
        next(null, bilibiliMovie)
      }
    }).catch(function(err){
      next(err)
    })
  } ,function(bilibiliMovie, next){
    bilibiliMovie.getMovie({
      where: {
        display: true
      }
    }).then(function(movie) {
      next(null, bilibiliMovie, movie)
    }).catch(function(err){
      next(err)
    })
  }, function(bilibiliMovie, movie, pass){
    async.each(["countries", "genres", "directors", "casts", "images"], function(func, next) {
      movie["get" + func.capitalize()]().then(function(result){
        movie[func] = result || []
        next(null, movie)
      })
    }, function(err){
      if(err){
        pass(err)
      }else{
        pass(null, bilibiliMovie, movie)
      }
    })
  }, function(bilibiliMovie, movie, next){
    celebrityWithImages(movie.casts, next, bilibiliMovie, movie)
  }, function(casts, bilibiliMovie, movie, next){
    celebrityWithImages(movie.directors, next, bilibiliMovie, movie)
  }], function(err, directors, bilibiliMovie, movie){
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      res.render('yiweixin/lofter/show', { movie: movie, bilibiliMovie: bilibiliMovie, medias: bilibiliMovie.medias, title: movie.title })
    }
  })
})

app.get('/movie/:id', function(req, res) {
  async.waterfall([function(next){
    models.Movie.findById(req.params.id).then(function(movie){
      next(null, movie)
    }).catch(function(err){
      next(err)
    })
  }, function(movie, pass){
    async.each(["countries", "genres", "directors", "casts", "images"], function(func, next) {
      movie["get" + func.capitalize()]().then(function(result){
        movie[func] = result || []
        next(null, movie)
      })
    }, function(err){
      if(err){
        pass(err)
      }else{
        pass(null, movie)
      }
    })
  }, function(movie, next){
    celebrityWithImages(movie.casts, next, null, movie)
  }, function(casts, bilibiliMovie, movie, next){
    celebrityWithImages(movie.directors, next, null, movie)
  }], function(err, directors, bilibiliMovie, movie){
    if(err){
      console.log(err)
      res.redirect('/500')
    }else{
      res.render('yiweixin/lofter/show', { movie: movie, bilibiliMovie: {}, medias: [], title: movie.title })
    }
  })
})


function celebrityWithImages(celebrities, pass){
  var bilibiliMovie = arguments[2],
      movie = arguments[3]
  async.each(celebrities, function(celebrity, next) {
    celebrity.getImages().then(function(images){
      celebrity.images = images || []
      celebrity.image = celebrity.images[0]
      if(images.length > 0){
        celebrity.image = celebrity.images[0]
      }
      next(null, celebrity)
    })
  }, function(err){
    if(err){
      pass(err)
    }else{
      pass(null, celebrities, bilibiliMovie, movie)
    }
  })
}

function movieWithGenres(movies, pass){
  async.each(movies.rows, function(movie, next){
    movie.getGenres().then(function(genres){
      movie.genres = genres || []
      next(null, movie)
    }).catch(function(err){
      next(err)
    })
  }, function(err){
    if(err){
      pass(err)
    }else{
      pass(null, movies)
    }
  })
}

function movieWithImages(movies, pass){
  async.each(movies.rows, function(movie, next){
    movie.getImages().then(function(images) {
      movie.images = images || []
      if(images.length > 0){
        movie.cover = images[0]
      }
      next(null, movie)
    })
  }, function(err){
    if(err){
      pass(err)
    }else{
      pass(null, movies)
    }
  })
}



function movieWithMedias(movies, pass){
  async.each(movies.rows, function(movie, next){
    models.BilibiliMovie.findAll({
      where: {
        douban_id: movie.douban_id,
        display: true
      }
    }).then(function(bmovies) {
      movie.bilibiliMovies = bmovies || []
      if(bmovies.length > 0){
        movie.bilibiliMovie = bmovies[0]
      }
      next(null, movie)
    })
  }, function(err){
    if(err){
      pass(err)
    }else{
      pass(null, movies)
    }
  })
}


module.exports = app;