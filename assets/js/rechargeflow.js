var cusBalance = 0;
var lastSubmitdate = new Date().getTime();

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

//页面加载
$(document).ready(function () {
  applylimit()
  extractConfirm()
  givenTo()
  withdrawal()
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
  var source   = $("#trafficplans-template").html();
  if(source !== undefined && source !== ''){
    getTrafficplan(source, "all")
    submitIsEnable(true);
  }
  if($("#movies-template").html() !== undefined && $("#movies-template").html() !== ''){
    popstateBack()
    loadMore()
    $(window).scroll(bindScroll);
  }
  mobileBlur(function(result) {
    var source   = $("#trafficplans-template").html();
    if(source !== undefined && source !== ''){
      getTrafficplan(source, result.catName)
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
          $(".llb").html(window.plans || "");
          // showDialog("请输入手机号码");
          return;
      }
      if (!isMobile(mobile)) {
          $(".correct").hide();
          $(".correct").html("");
          $(".llb").html(window.plans || "");
          showDialog("请输入正确的手机号码");
          return;
      }
      getCarrier(mobile, successCallback);
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

function getTrafficplan(source, catName){
  if(!source) return
  var template = Handlebars.compile(source);
  showLoadingToast();
  $.ajax({
    url: '/getTrafficplans',
    dataType: 'JSON',
    data: {
      catName: catName
    },
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
      var html = template({trafficgroups: data})
      if(catName == "all"){
        window.plans = html
      }
      $(".llb").html(html)
      hideLoadingToast();
    }
  }).fail(function(err){
    console.log(err)
    hideLoadingToast();
    showDialog("服务器错误")
  })
}

function extractConfirm(){

  $(".llb").on('click', 'a.exchanger', function() {
    var mobile = $.trim($("#mobile").val());
    if (!isMobile(mobile)){
      showDialog("请输入正确的手机号码")
      return
    }
    var $this = $(this)
    $(".llb a").removeClass('choose')
    var choose = $("#chooseMoney .weui_btn.selected")
    var lessE = choose.data('less')

    if( parseFloat(lessE) < parseFloat($this.data('cost')) ){
      if(choose.data('id') == 'balance'){
        showDialog("账户剩余余额不足")
      }else{
        showDialog("账户返利余额不足")
      }
      return
    }
    $this.addClass('choose')

    phone = $.trim($("#mobile").val())
    $("#maskflow").html($this.data('name'))
    $("#maskmobile").html(phone)
    $("#maskcost").html($this.data('cost'))
    $("#mask").show()
  })

  $(".sure").on("click", paymentConfirm)
}

function paymentConfirm(){
  var selectedFlow = $(".llb a.exchanger.choose")
        phone = $.trim($("#mobile").val()),
        flowId = selectedFlow.data("value"),
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
              // 这里可以跳转到订单完成页面向用户展示
              // window.location.href = '/profile'
            }else{
              showDialog("支付失败，请重试")
            }
          });
        }else{
          showDialog(payargs.msg)
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
      if(flowDiscount != ''){
        $("#txtPayMoneyDiscount").html(flowDiscount.toFixed(2)).parent().removeClass('hide');
        $("#txtPayMoney").attr('style', 'text-decoration: line-through;')
      }else{
        $("#txtPayMoney").removeAttr('style')
        $("#txtPayMoneyDiscount").parent().addClass('hide');
      }
      $("#txtPayMoney").html(parseFloat(flowCount).toFixed(2));
  });
  $("#buylist a:eq(0)").click()
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

function ajaxLoadData(url){
  $.ajax({
    url: url,
    dataType: 'JSON',
    method: "GET"
  }).done(function(data){
    var loading = $("#lazy-loading")
    $("#lazy-loading").remove()
    $(".g-body").append(window.movies_template(data))
    $(".g-body").append(loading)
    $("#nextUrl").attr("href", data.next_url)
    $("#lazy-loading").hide()
    $(window).bind('scroll', bindScroll);
  }).fail(function(err){
    console.log(err)
    $("#lazy-loading").hide()
  })
}


function popstateBack(){
  window.addEventListener('popstate', function(e){
    var character = e.state;
    if(character == null){
      $(".g-body").show()
      if(window.bodyscrollTop){
        $("body").scrollTop(window.bodyscrollTop + 50)
      }
      $('.g-detail').empty()
    } else if (character.detail){
      $(".g-body").show()
      $('.g-detail').html(character.data)
    }
    $(window).bind('scroll', bindScroll);
  })

  $(document).on("click", "a.movie-link", function(e){
    e.preventDefault();
    var url = $(this).attr("href");
    if(url != (location.pathname + location.search) ){
      $('.g-detail').load(url + ' .page', function(){
        videojs("#really-cool-video").load();
        $(".g-body").hide()
        history.pushState({ data: $('.g-detail').html(), detail: true }, null, url);
        $(window).unbind('scroll');
        window.bodyscrollTop = $("body").scrollTop()
        $("body").scrollTop(0)
      });
    }
    e.stopPropagation();
  })

}

function loadMore()
{
  if(!window.movies_template){
    var source = $("#movies-template").html()
    window.movies_template = Handlebars.compile(source);
  }
  var url = $("#nextUrl").attr("href")
  if(url){
    $("#lazy-loading").show()
    ajaxLoadData(url)
  }
}

function bindScroll(){
  if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    $(window).unbind('scroll');
    loadMore();
  }
}