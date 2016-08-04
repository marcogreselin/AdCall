/**
 * Created by marco on 03/08/2016.
 */

$.ajax({
    url: '/serve/serveBanner',
    data: {"publisherId": publisherId},
    success: success
});

function success(data) {
    console.log(data);

    $("#adcall").html("<img height='300px' width='300px' src=\""+data.image+"\">")
    $("#adcall").click(function(){
        $("#adcall").html("<div height='300px' id=\"remoteVideo\"></div>");


        var webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" video
            // localVideoEl: 'localVideo',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'remoteVideo',
            // immediately ask for camera access
            autoRequestMedia: true,
            media: { video: true, audio: true }
        });

        webrtc.on('readyToCall', function () {
            // you can name it anything
            webrtc.joinRoom('64');
        });

        // window.location.replace(data.fallback);
    })


}