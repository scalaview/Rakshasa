'use strict';

var fs        = require('fs');
var path      = require('path');
var basename  = path.basename(module.filename);

var rechargers        = [];

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var recharger = require(path.join(__dirname, file));
    for(var k in recharger){
      rechargers[k] = recharger[k]
    }
  });

module.exports = rechargers;