Array.prototype.eachSlice = function (size, callback){
  this.arr = []
  for (var i = 0, l = this.length; i < l; i += size){
    this.arr.push(this.slice(i, i + size))
    if(callback)
      callback.call(this, this.slice(i, i + size))
  }
  return this.arr;
};
//无须修改此文件，将在配置文件中配置
var title = '飞度云商';
var subtitle = '飞度充值平台 - 专业 快速';
var services = "http://kefu.easemob.com/webim/im.html?tenantId=20171";
var copright = "Copyright  © 2016 飞度科技";
