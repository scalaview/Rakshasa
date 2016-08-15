/**
 * Created by 唐亮 on 2016/7/13.
 */
///手机验证
window.isMobile = function (mobile) {
    var reg = /^1\d{10}$/;
    return (mobile !== undefined && mobile !== '' && reg.test(mobile))
}

$(document).ready(function () {
    // 调整详情弹出框的高度
    $('.modal').on('show.bs.modal', function(){
        var $this = $(this);
        var $modal_dialog = $this.find('.modal-dialog');
        // var m_top = ( window.screen.height - $modal_dialog.height() )/2;
        var m_top = 50;
        $modal_dialog.css({'margin': m_top + 'px auto'});
    });

    // 广告滑动设置
    var bannerItem = $('#banner .item').first()
    if( bannerItem )
        bannerItem.addClass("active")

    telBlur()
    trafficplanEvent()
})

/**
 * 手机输入框事件
 */
function telBlur() {
    $('#phoneNumber').blur(function () {
        var tel = $(this).val();
        if (!window.isMobile(tel)) {
            alert('请输入正确的手机号')
        }
    })

    $('#phoneNumber').on('propertychange input',function () {
        var tel = $(this).val();
        if (window.isMobile(tel)) {
            initTrafficplan(tel)
        }
    })
}

/**
 * 套餐点击事件
 */
function trafficplanEvent() {
    console.log($('.info').length,$('.exchanger').length)
    // 弹出详情
    $('.info').click(function () {
        var info = $(this).siblings('p').text() || '还没有详情'
        // alert(info)
        // console.log(info)
        $('#detail .modal-body textarea').text(info)
    })

    // 进入订单页面
    $('.exchanger').click(function () {
        $this = $(this)
        var tel = $('#phoneNumber').val();
        if (window.isMobile(tel)) {
            window.location.href = 'orderPage/?tel=' + tel + '&tranfficplanId=' + $this.data('value')
        } else {
            alert('请输入正确的手机号')
        }
    })
}

/**
 * 根据手机号初始化流量分组和套餐
 * @param tel
 */
function initTrafficplan(tel){
    var source   = $("#trafficplans-template").html();
    $("#traffic").html("<h6 class='center'>正在获取套餐</h6>")
    if(source !== undefined && source !== '' && tel !== undefined && tel !== ''){
        // 根据手机号获取电话的运营商，地区
        getCarrier(tel, function (provider, province) {
            //console.log(data, provider, province)
            //alert('1')
            getTrafficplan(source, provider, province)
        })
    }
}

/**
 * 根据手机号获取电话的运营商，地区
 * @param tel
 * @param successCallback(provider, province)
 */
function getCarrier(tel, successCallback){
    // 根据手机号获取电话的运营商，地区
    $.ajax({
        headers:{
            apikey : 'cfd9f84b0233a15c35c2608a12f4a9b1'
        },
        url: 'http://apis.baidu.com/apistore/mobilephoneservice/mobilephone',
        dataType: 'JSON',
        data: {
            tel : tel
        },
        method: "GET"
    }).done(function(data){
        var carrier = data.retData.carrier
        var provider = {'移动':'中国移动','联通':'中国联通','电信':'中国电信'}
            [carrier.substring(carrier.length - 2)]
        var province = carrier.substring(0,carrier.length - 2)
        // 设置全局变量
        window.catName = provider
        successCallback(provider, province)
    }).fail(function(err){
        console.log(err)
        alert('网络连接失败')
    })
}

/**
 * 获取流量分组和套餐
 * @param source 模板
 * @param catName 运营商
 * @param province 省
 */
function getTrafficplan(source, catName, province){
    if(!source) return
    var template = Handlebars.compile(source),
        params = {
            catName: catName
        };
    console.log(params)
    $.ajax({
        url: '/bill',
        dataType: 'JSON',
        data: params,
        method: "POST"
    }).done(function(data){
        console.log(data)
        if(data.err == 4){  //服务器维护中
            var err_source = $("#err-template").html()
            if(err_source != undefined && err_source != ''){
                alert(data.msg)
            }
        }else{
            var html = template({trafficgroups: data.trafficgroups})
            //alert('2')
            $("#traffic").html(html)
            // 添加套餐点击事件
            setTimeout(trafficplanEvent, 100)
        }
    }).fail(function(err){
        console.log(err)
        alert("服务器错误")
    })
}