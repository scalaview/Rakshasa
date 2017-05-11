var cusBalance = 0;
var lastSubmitdate = new Date().getTime();
if(!!!window.plans){window.plans={};}
Handlebars.registerHelper('if-lt', function(a, b) {
  var options = arguments[arguments.length - 1];
  if (a < b) { return options.fn(this); }
  else { return options.inverse(this); }
});

Handlebars.registerHelper('subSummary', function(text, size) {
  if(text.length <= size){
    return text
  }else{
    return text.substring(0, size) + "..."
  }
});

Array.prototype.eachSlice = function (size, callback){
  this.arr = []
  for (var i = 0, l = this.length; i < l; i += size){
    this.arr.push(this.slice(i, i + size))
    if(callback)
      callback.call(this, this.slice(i, i + size))
  }
  return this.arr;
};

//页面加载
$(document).ready(function () {
  applylimit()
  extractConfirm()
  bindTrafficplan()
  givenTo()
  withdrawal()
  trafficplanDetail()
  $(".correct").html("");
  $(".correct").hide();
  var m = $("#mobile").val();
  $(".llb").on('click', 'a', function(){
    var $this = $(this)
    $this.parent().children().removeClass("selected");
    $(this).addClass("selected");
    var cost = $this.data("cost");
    $("#needmyflow").html(cost);
  })
  initTrafficplan()
  mobileBlur(function(result) {
    var source   = $("#trafficplans-template").html();
    if(source !== undefined && source !== ''){
      window.catName = result.catName
      getTrafficplan(source, result.catName)
      loadBillPlans(source)
      submitIsEnable(true);
    }
  });
  changePayment()
});


function givenTo(){
  $('#givento').click(function(){
    var phone = $('#mobile').val(),
        amountStr = $('#amount').val()
        totalStr = $('#balance').data('amount')
    if(totalStr !== undefined){
      var total = parseInt(totalStr)
    }

    var amount = 0
    try{
      amount = parseInt(amountStr)

      if(! (amount % 10 == 0) ){
        showDialog("转赠数量必须是10的倍数")
        return
      }

      if(isNaN(amount) || amount > total) {
        showDialog("您的余额不足以支出转赠数量")
        return
      }
    }catch(e){
      console.log(e)
      showDialog("请输入正确的数量")
      return
    }
    $.ajax({
      url: '/givento',
      method: "POST",
      dataType: "JSON",
      data: {
        phone: phone,
        amount: amount
      }
    }).done(function(data) {
      console.log(data)
      if(data.code){
        showDialog(data.msg)
        doDelay(function(){
          window.location.href = data.url
        }, 2)
      }else{
        showDialog(data.msg)
      }
    }).fail(function(err) {
      console.log(err)
      showDialog("服务器异常")
    })
  })
}

function mobileBlur(successCallback){
  //手机号码失去焦点事件
  $("#mobile").bind("change", function () {
      var mobile = $.trim($(this).val());
      if ($.trim(mobile) == "") {
          $(".correct").hide();
          $(".correct").html("");
          // showDialog("请输入手机号码");
          return;
      }
      if (!isMobile(mobile)) {
          $(".correct").hide();
          $(".correct").html("");
          showDialog("请输入正确的手机号码");
          return;
      }
      getCarrier(mobile, successCallback);
      get360Carrier(mobile)
  });
}

///遮罩层
function maskShow(mobile, flow, code, isShow) {
  var isConfirmShow = isShow;
  $("#maskflow").data("flow", flow);
  $("#maskflow").data("code", code);
  $("#maskmobile").data("mobile", mobile);
  $("#maskmobile").html(mobile);
  $("#maskflow").html(flow + "MB");
  if (isConfirmShow === true) {
      $("#mask").show();
  } else {
      $("#mask").hide();
      $("#maskmobile").html("");
      $("#maskflow").html("");
  }
}

$("#mobile").bind("focus", function () {
    submitIsEnable(false);
});

//提交按钮可用设置
function submitIsEnable(isEnable) {
  if (!isEnable) {
    $(".btn-submit").data("enable", false);
    $(".btn-submit a").addClass("btn-gray");
  } else {
    $(".btn-submit").data("enable", true);
    $(".btn-submit a").removeClass("btn-gray");
  }
}

///验证数字
function isNumber(content) {
    var reg = /^\d*$/;
    return reg.test(content);
}

function getCarrier(phone, successCallback){
  showLoadingToast();
  $.ajax({
    url: 'https://tcc.taobao.com/cc/json/mobile_tel_segment.htm',
    method: 'GET',
    dataType: 'JSONP',
    data: {
      tel: phone
    }
  }).done(function(result){
    hideLoadingToast();
    // areaVid: "30517"carrier: "广东移动"catName: "中国移动"ispVid: "3236139"mts: "1382846"province: "广东"
    if(result.catName){
      $("#phone-detail").html(result.catName + ' ' + result.carrier).data("provider", result.carrier).show()
      successCallback(result)
    }else{
      showDialog("请输入正确的手机号码");
    }
  }).fail(function(err) {
    hideLoadingToast();
    showDialog("服务器错误")
  })
}

function get360Carrier(phone, successCallback){
  showLoadingToast();
  $.ajax({
    url: '/getcarrier',
    method: 'GET',
    dataType: 'JSON',
    data: {
      phone: phone,
    }
  }).done(function(result){
    hideLoadingToast();

    // {
    //   "code": 0,
    //   "data": {
    //     "province": "广东",
    //     "city": "广州",
    //     "sp": "移动"
    //   }
    // }
    if(!result.code){
      if(successCallback){
        successCallback(result.data)
      }
      $(".phoneisp").html(result.data.province + result.data.city + result.data.sp)
    }else{
      showDialog("请输入正确的手机号码");
    }
  }).fail(function(err) {
    hideLoadingToast();
    showDialog("服务器错误")
  })
}

function initTrafficplan(){
  var source   = $("#trafficplans-template").html();
  if(source !== undefined && source !== ''){
    getTrafficplan(source, "中国移动")
    loadBillPlans(source)
  }
}

function getTrafficplan(source, catName, groupId){
  if(!source) return
  var template = Handlebars.compile(source),
      params = {
                  catName: catName
                };
  if(groupId){
    params["groupId"] = groupId
  }
  loadPlans('/getTrafficplans', params).then(function(data){
    if(data && data.length > 0){
      window.plans['traffic'] = data
      var html = template({trafficPlans: data.eachSlice(3), type: 'traffic'})
      $("#tabchargeliuliang").html(html)
    }else{
      $("#tabchargehuafei").html(emptyPlans())
    }
  })
}

function extractConfirm(){

  $(document).on('click', '.exchanger', function() {
    var mobile = $.trim($("#mobile").val());
    if (!isMobile(mobile)){
      showDialog("请输入正确的手机号码")
      return
    }

    var $this = $(this),
        provider = $this.data("provider"),
        type = $this.data('type')

    $(".llb a").removeClass('choose')
    var choose = $("#chooseMoney .weui_btn.selected")
    var lessE = choose.data('less')

    $this.addClass('choose')
    var cost = parseFloat($this.data('cost')),
        discount = 0.00
    if($("#use-integral").prop("checked")){
      var exchangeRate = $("#use-integral").data("exchangerate"),
          totalIntegral = $("#use-integral").data("totalintegral"),
          discount = parseFloat( parseFloat(totalIntegral) /  parseFloat(exchangeRate) ),
          cost = parseFloat($this.data('cost')) - discount
      if(cost < 0.00){
        discount = parseFloat($this.data('cost'))
        cost = 0
      }
    }
    if( parseFloat(lessE) < parseFloat(cost)){
      if(choose.data('id') == 'remainingTraffic'){
        showDialog("账户剩余余额不足")
      }else if(choose.data('id') == 'salary'){
        showDialog("账户分销奖励不足")
      }
      return
    }
    phone = $.trim($("#mobile").val())
    $("#maskflow").html($this.data('name'))
    $("#maskmobile").html(phone)
    $("#integral").html(discount.toFixed(2))
    $("#maskcost").html(cost.toFixed(2))
    if($("#use-integral").prop("checked") && discount > 0.00 ){
      $("#integral").parent().show()
    }else{
      $("#integral").parent().hide()
    }
    $("#mask").show()
    if(type == 'traffic'){
      $(".sure").on("click", paymentConfirm)
    }else{
      $(".sure").on("click", billConfirm)
    }
  })

}

function paymentConfirm(){
  var $this = $(this),
        selectedFlow = $(".llb .exchanger.choose")
        phone = $.trim($("#mobile").val()),
        flowId = selectedFlow.data('id'),
        source   = $("#trafficplans-template").html(),
        choose = $("#chooseMoney .weui_btn.selected")

  if(source === undefined || source == ''){
    return
  }

  if(choose.data('id') === undefined || choose.data('id') == ''){
    return
  }

  if(isMobile(phone) && flowId !== undefined && flowId !== '' ){
    $(".sure").unbind("click")
    wechatPayment(phone, flowId, function(){
      $(".sure").on("click", paymentConfirm)
    })
  }else{
    showDialog("请输入电话和选择正确的套餐")
  }
}



function wechatPayment(phone, flowId, opt){
  showLoadingToast()
  $.ajax({
        url: '/pay',
        method: "POST",
        dataType: "JSON",
        data: {
          flowId: flowId,
          paymentMethod: 'WechatPay',
          chargetype: choose.data('id'),
          useIntegral: $("#use-integral").prop("checked"),
          phone: phone
        }
      }).done(function(payargs) {
        if(opt){
          opt()
        }
        hideLoadingToast()
        if(payargs.err){
          showDialog(payargs.msg)
        }else if(choose.data('id') == "balance" && !payargs.msg){
          WeixinJSBridge.invoke('getBrandWCPayRequest', payargs, function(res){
            if(res.err_msg == "get_brand_wcpay_request:ok"){
              $("#mask").hide();
              showDialog("支付成功")
              doDelay(function(){
                window.location.reload()
              },2)
            }else{
              showDialog("支付失败，请重试")
            }
          });
        }else{
          showDialog(payargs.msg)
          doDelay(function(){
            window.location.reload()
          },2)
        }
      }).fail(function(err) {
        hideLoadingToast()
        console.log(err)
        showDialog("服务器繁忙")
      })
}

function RegistEvent() {
    // 选择流量币大小
  $("#buylist").on("click", "a", function (e) {
      var target = e.target;
      $(target).siblings().each(function () {
          $(this).removeClass("selected");
          if ($(this).children(".an").length > 0) {
              $(this).children(".an").remove();
          }
      });
      $(target).addClass("selected");
      $(target).append("<div class=\"an\"></div>");

      var flowId = $(target).data("id"),
          flowCount = $(target).data("price");
          flowDiscount = $(target).data('discount');
      $("#txtFlowCount").val(flowId);
      $("#txtPayMoney").html(parseFloat(flowCount).toFixed(2));
  });
  $("#buylist a:eq(0)").click()
}

function orderConfirm(){

  $("#pay-now").click(function() {
    var selectedFlow = $(".llb a.selected");
    var flowId = selectedFlow.data("id");
    if (!flowId || flowId == "") {
        showDialog("请选择流量包");
        return;
    }

    var flow = selectedFlow.data("value"),
        price = selectedFlow.data("price"),
        flowDiscount = selectedFlow.data('discount');
    $("#maskmoney").html(price.toFixed(2))
    $("#maskflow").html(flow.toFixed(2))
    $("#mask").show()
  });

  $(".sure").on('click', sureBinding);
}

function sureBinding(){
    var $this = $(this),
        dataPlanId = $("#txtFlowCount").val()
    if(dataPlanId !== undefined && dataPlanId !== ''){
      $(".sure").unbind("click")
      $.ajax({
        url: '/wechat-order',
        method: "POST",
        dataType: "JSON",
        data: {
          dataPlanId: dataPlanId,
          paymentMethod: 'WechatPay'
        }
      }).done(function(payargs) {
        if(payargs.err){
          showDialog(payargs.msg)
          $(".sure").on('click', sureBinding);
        }else{
          WeixinJSBridge.invoke('getBrandWCPayRequest', payargs, function(res){
            if(res.err_msg == "get_brand_wcpay_request:ok"){
              showDialog("支付成功");
            }else{
              showDialog("支付失败，请重试");
            }
            $(".sure").on('click', sureBinding);
          });
        }
      }).fail(function(err) {
        console.log(err)
        showDialog("服务器繁忙")
        $(".sure").on('click', sureBinding);
      })
    }else{
      showDialog("请输入电话和选择正确的套餐")
    }
  }

function withdrawal(){
  $("#exchangeAmount").blur(function() {
    var amount = parseFloat($(this).val()),
        $exchange = $('#exchange'),
        exchangeValue = $exchange.data("exchange"),
        total = $exchange.data('total')

    if(!isNaN(amount)){
      if(amount > parseFloat(total) ){
        showDialog("你所拥有的余额不足")
      }
    }else{
      showDialog("请输入正确的数目")
    }
  })

  $("#exchangeSubmit").click(function(){
    var list = $("input[type='text']")
        for (var i = 0; i < list.length; i--) {
          if(list[i].value == ''){
            showDialog("请完整填写信息")
            break;
          }
        };
    if(i < list.length){
      return true
    }else{
      return false
    }
  })
}

function changePayment(){
  $("#chooseMoney .weui_btn").click(function(){
    $("#chooseMoney .weui_btn").removeClass("weui_btn_primary").removeClass('selected').addClass("weui_btn_default")
    $(this).removeClass("weui_btn_default").addClass("weui_btn_primary").addClass('selected')
    var $this = $(this),
        _id = $this.data("id")
    $(".tel-title").hide()
    $("#" + _id).show()
  })
}

function applylimit(){
  $(".applylimit").click(function(){
    showDialog("分销奖励未超过100元，无法提现")
  })
}

function bindTrafficplan(){
  $(".tab-link.button").click(function(){
    var $this = $(this)
    if(!$this.hasClass("active")){
      $(".tab-link.button.active").removeClass("active")
      $this.addClass("active")
      var href = $this.attr("href")
      if(!$(href).hasClass('active')){
        $(".tabs .tab.active").removeClass("active")
        $(href).addClass("active")
        $(".list-block.product-list ul").empty()
        $(".chargeitem-selected").removeClass("chargeitem-selected")
        $(".submitbtn").show();
      }
    }
  })

}

function chargeItem(e){
  var mobile = $.trim($("#mobile").val());
  if (!isMobile(mobile)){
    showDialog("请输入正确的手机号码")
    return
  }
  var $this = $(e)
  if(!$this.hasClass('chargeitem-selected')){
    $(".chargeitem-selected").removeClass("chargeitem-selected")
    $this.addClass("chargeitem-selected")
    var type = $this.data('type'),
        _id = $this.data('id')
    if(window.plans[type]){
      $.each(window.plans[type], function(i, v){
        if(v.id === _id){
          var li_source = $("#li-template").html()
          if(li_source != undefined && li_source != ''){
            var li_template = Handlebars.compile(li_source);
            var li_html = li_template({plans: v.trafficplans })
            $(".submitbtn").hide();
            $(".list-block.product-list ul").html(li_html)
          }
        }
      })
    }

  }
}

function billConfirm(){
  var selectedFlow = $(".llb .exchanger.choose")
        phone = $.trim($("#mobile").val()),
        flowId = selectedFlow.data("id"),
        source   = $("#trafficplans-template").html(),
        choose = $("#chooseMoney .weui_btn.selected")

  if(choose.data('id') === undefined || choose.data('id') == ''){
    return
  }

  if(isMobile(phone) && flowId !== undefined && flowId !== '' ){
    $(".sure").unbind("click")
    wechatBill(phone, flowId, function(){
      $(".sure").on("click", billConfirm)
    })
  }else{
    showDialog("请输入电话和选择正确的套餐")
  }
}

function wechatBill(phone, flowId, opt){
  showLoadingToast()
  $.ajax({
        url: '/wechat-bill',
        method: "POST",
        dataType: "JSON",
        data: {
          flowId: flowId,
          paymentMethod: 'WechatPay',
          chargetype: choose.data('id'),
          useIntegral: $("#use-integral").prop("checked"),
          phone: phone
        }
      }).done(function(payargs) {
        if(opt){
          opt()
        }
        hideLoadingToast()
        if(payargs.err){
          showDialog(payargs.msg)
        }else if(choose.data('id') == "balance"){
          WeixinJSBridge.invoke('getBrandWCPayRequest', payargs, function(res){
            if(res.err_msg == "get_brand_wcpay_request:ok"){
              $("#mask").hide();
              showDialog("支付成功")
              doDelay(function(){
                window.location.reload()
              },2)
            }else{
              showDialog("支付失败，请重试")
            }
          });
        }else{
          showDialog(payargs.msg)
          doDelay(function(){
            window.location.reload()
          },2)
        }
      }).fail(function(err) {
        hideLoadingToast()
        console.log(err)
        showDialog("服务器繁忙")
      })
}

function trafficplanDetail(){
  $(document).on('click', '.showActionSheet', function () {
      var providerId = $(this).data("provider"),
          _id = $(this).data("id"),
          type = $(this).data("type")
      var mask = $('#mask-block');
      var weuiActionsheet = $('#weui_actionsheet');
      showDetail(providerId, type, _id)
      weuiActionsheet.addClass('weui_actionsheet_toggle');
      mask.show()
          .focus()//加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
          .addClass('weui_fade_toggle').one('click', function () {
          hideActionSheet(weuiActionsheet, mask);
      });
      $('#actionsheet_cancel').one('click', function () {
          hideActionSheet(weuiActionsheet, mask);
      });
      mask.unbind('transitionend').unbind('webkitTransitionEnd');

      function hideActionSheet(weuiActionsheet, mask) {
          weuiActionsheet.removeClass('weui_actionsheet_toggle');
          mask.removeClass('weui_fade_toggle');
          mask.on('transitionend', function () {
              mask.hide();
          }).on('webkitTransitionEnd', function () {
              mask.hide();
          })
      }
  });
}

function showDetail(providerId, type, _id){
  $("#actionSheet_wrap .weui_article span").hide()
  var _plans = []
  if(type=='traffic'){
    $.each(window.plans[type], function(i, v){
      _plans = _plans.concat(v.trafficplans)
    })
  }else{
    _plans = _plans.concat(window.plans[type])
  }
  for(var i = 0; i < _plans.length; i++) {
    if(_plans[i].id === _id && _plans[i].detail && _plans[i].detail !== ""){
      $("#detail").html(_plans[i].detail.replace(/(\r\n|\n|\r)/gm, '<br>'))
      $("#detail").show()
      return;
    }
  }
  $("#detail-" + providerId).show()
}

function loadBillPlans(source){
  if(!source) return
  var template = Handlebars.compile(source)

  loadPlans('/bill-plans', {}).then(function(data){
    if(data.trafficPlans && data.trafficPlans.length > 0){
      var _plans = {},
          plans = []
      $.each(data.trafficPlans, function(i, e){
        if(!_plans[e.name]){
          _plans[e.name] = []
        }
        _plans[e.name].push(e)
      })
      Object.keys(_plans).map(function(key, index) {
         plans.push({
          id: index,
          name: key,
          trafficplans: _plans[key]
         })
      });
      window.plans['bill'] = plans
      var html = template({trafficPlans: plans.eachSlice(3), type: 'bill'})
      $("#tabchargehuafei").html(html)
    }else{
      $("#tabchargehuafei").html(emptyPlans())
    }
  })
}

function emptyPlans() {
  var source = $("#empty-template").html()
  if(!source) return "";
  var template = Handlebars.compile(source)
  return template()
}

function loadPlans(url, params){
  showLoadingToast();
  return new Promise(function (resolve, reject){
    $.ajax({
      url: url,
      dataType: 'JSON',
      data: params,
      method: "GET"
    }).done(function(data){
      if(data.err == 4){  //服务器维护中
        var err_source = $("#err-template").html()
        if(err_source != undefined && err_source != ''){
          var err_template = Handlebars.compile(err_source);
          var err_html = err_template({msg: data.msg})
          $(".no_data").html(err_html)
          $(".no_data").show()
          hideLoadingToast();
        }
      }else{
        $(".no_data").hide()
        resolve(data)
        hideLoadingToast();
      }
    }).fail(function(err){
      console.log(err)
      hideLoadingToast();
      showDialog("服务器错误")
      reject(err)
    })
  })
}

