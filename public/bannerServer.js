/**
 * Created by marco on 03/08/2016.
 */
// Variable passing as described in http://stackoverflow.com/questions/2190801/passing-parameters-to-javascript-files
var this_js_script = $('script[src*=bannerServer]');
var publisherId = this_js_script.attr('publisherId');

$.ajax({
    url: '/serve/serveBanner',
    data: {"publisherId": publisherId},
    success: success
});

function success(data) {
    $("#adcall").html("<img height='300px' width='300px' src=\""+data.image+"\">");

    $("#adcall").click(function(){
        $("#adcall").html("<div height='300px' id=\"remoteVideo\"></div>");


        var webrtc = new SimpleWebRTC({
            remoteVideosEl: 'remoteVideo',
            autoRequestMedia: true,
            media: { video: true, audio: true }
        });



        webrtc.on('readyToCall', function () {
            webrtc.joinRoom(data.companyid.toString());
        });
    })
}