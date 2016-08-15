/**
 * 订单支付页面
 * Created by 唐亮 on 2016/7/12.
 */
$(document).ready(function () {
    // 调整详情弹出框的高度
    $('.modal').on('show.bs.modal', function(){
        var $this = $(this);
        var $modal_dialog = $this.find('.modal-dialog');
        // var m_top = ( window.screen.height - $modal_dialog.height() )/2;
        var m_top = 50;
        $modal_dialog.css({'margin': m_top + 'px auto'});
    });

    bindChargetype()
    bindCheckIntergral()
    $('#submit').click(function () {
        var tel = $('#tel').text()
        var flowId = $('input[name=flowId]').val()
        var chargetype = window.chargetype
        var useIntegral = $('input[type=checkbox]').val()
        var productType = $('input[name=productType]').val()
        var lessE = $('#'+ chargetype).data('less')

        var cost = parseFloat($('#cost').text()),
            discount = 0.00
        if(!chargetype){
            alert('请选择支付方式')
            return
        }

        if(useIntegral){
            var exchangeRate = $('input[type=checkbox]').data("exchangerate"),
                totalIntegral = $('input[type=checkbox]').data("totalintegral"),
                discount = parseFloat( parseFloat(totalIntegral) /  parseFloat(exchangeRate) ),
                cost = parseFloat($('#cost').text()) - discount

            // console.log(exchangeRate, totalIntegral)
            if(cost < 0.00){
                discount = parseFloat($('#cost').text())
                cost = 0
            }
        }
        // console.log(parseFloat(lessE) , parseFloat(cost))
        if( parseFloat(lessE) < parseFloat(cost)){
            if(chargetype == 'remainingTraffic'){
                alert("账户剩余余额不足")
            }else if(chargetype == 'salary'){
                alert("账户分销奖励不足")
            }
            return
        }

        if(productType == 'traffic'){ // 流量支付
            //console.log(tel, flowId, chargetype, useIntegral && discount > 0.00)
            wechatPayment(tel, flowId, chargetype, useIntegral && discount > 0.00)
        } else if(productType == 'bill'){ // 话费
            wechatBill(tel, flowId, chargetype, useIntegral && discount > 0.00)
        }
    })
})

function bindChargetype() {
    $('.chargetype a').click(function () {
        window.chargetype = $(this).data('type')
        console.log("charge %o",window.chargetype)
        $('.money div').hide()
        $('#' + window.chargetype).show()
    })
}
/**
 * 绑定积分选择事件
 */
function bindCheckIntergral() {
    $('#check-intergral').click(function () {
        var checked = $('input[type=checkbox]').is(':checked')
        $('input[type=checkbox]').attr('checked', !checked)
    })
}
/**
 * 流量套餐支付
 * @param phone 电话
 * @param flowId 套餐ID
 * @param chargetype 支付方式
 * @param useIntegral 使用积分
 * @param opt 成功前回调
 */
function wechatPayment(phone, flowId,chargetype,useIntegral, opt){
    
    $.ajax({
        url: '/pay',
        method: "POST",
        dataType: "JSON",
        data: {
            flowId: flowId,
            paymentMethod: 'WechatPay',
            chargetype: chargetype,
            useIntegral: useIntegral,
            phone: phone
        }
    }).done(function(payargs) {
        if(opt){
            opt()
        }
        if(payargs.err){
            alert(payargs.msg)
        }else if(chargetype == "balance" && !payargs.msg){
            WeixinJSBridge.invoke('getBrandWCPayRequest', payargs, function(res){
                if(res.err_msg == "get_brand_wcpay_request:ok"){
                    window.location.href = '/extractflow'
                } else if(res.err_msg != "get_brand_wcpay_request:cancel" ){
                    //  alert(JSON.stringify(res))
                    alert("支付失败，请重试")
                }
            });
        }else{
            alert(payargs.msg)
            setTimeout(function(){
                window.location.href = '/extractflow'
            },2000)
        }
    }).fail(function(err) {
        console.log(err)
        alert("服务器繁忙")
    })
}

/**
 * 话费套餐支付
 * @param phone 电话
 * @param flowId 套餐ID
 * @param chargetype 支付方式
 * @param useIntegral 使用积分
 * @param opt 成功前回调
 */
function wechatBill(phone, flowId,chargetype,useIntegral, opt){
    $.ajax({
        url: '/wechat-bill',
        method: "POST",
        dataType: "JSON",
        data: {
            flowId: flowId,
            paymentMethod: 'WechatPay',
            chargetype: chargetype,
            useIntegral: useIntegral,
            phone: phone
        }
    }).done(function(payargs) {
        if(opt){
            opt()
        }
        if(payargs.err){
            alert(payargs.msg)
        }else if(chargetype == "balance"){
            WeixinJSBridge.invoke('getBrandWCPayRequest', payargs, function(res){
                if(res.err_msg == "get_brand_wcpay_request:ok"){
                    window.location.href = '/bill'
                }else{
                    alert("支付失败，请重试")
                }
            });
        }else{
            alert(payargs.msg)
        }
    }).fail(function(err) {
        console.log(err)
        alert("服务器繁忙")
    })
}