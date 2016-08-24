/**
 * Created by marco on 03/08/2016.
 */

$.ajax({
    url: '/serve/serveBanner',
    data: {"publisherId": publisherId},
    success: success
});

function success(data) {
    $("#adcall").html("<img height='300px' width='300px' src=\""+data.image+"\">")
    $("#adcall").click(function(){
        $("#adcall").html("<div height='300px' id=\"remoteVideo\"></div>");


        var webrtc = new SimpleWebRTC({
            remoteVideosEl: 'remoteVideo',
            autoRequestMedia: true,
            media: { video: true, audio: true }
        });

        webrtc.on('readyToCall', function () {
            console.log(webrtc.connection)
        });
    })
}