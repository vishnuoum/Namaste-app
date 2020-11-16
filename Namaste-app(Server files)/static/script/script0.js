var mystream;
var video = document.getElementById("preview");
var audioEnabled = true, videoEnabled = true;

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        mystream = stream;
        video.srcObject = stream;
    }).catch(err => {
        console.log("Something went wrong!");
    });
}


function mutePreviewAudio(t) {
    try {
        mystream.getAudioTracks()[0].enabled = !(mystream.getAudioTracks()[0].enabled);
        $(t).toggleClass("btn-focus");
        $(t).toggleClass("btn-danger");
        $(t).children(".fas").toggleClass("fa-microphone");
        $(t).children(".fas").toggleClass("fa-microphone-slash");
        audioEnabled = !audioEnabled;
    }
    catch (err) {
        console.log(err)
    }
}


function mutePreviewVideo(t) {
    try {
        mystream.getVideoTracks()[0].enabled = !(mystream.getVideoTracks()[0].enabled);
        $(t).toggleClass("btn-focus");
        $(t).toggleClass("btn-danger");
        $(t).children(".fas").toggleClass("fa-video");
        $(t).children(".fas").toggleClass("fa-video-slash");
        videoEnabled = !videoEnabled;
    }
    catch (err) {
        console.log(err)
    }
}


function joinNow() {
    // mystream.getTracks().forEach(function (track) {
    //     track.stop();
    // });
    $(".previewScreen").hide();
    $(".meetScreen").toggleClass("meetScreen-hidden")
    var newScript = document.createElement("script");
    newScript.src = scriptSrc;
    $("body").append(newScript);
    startTime();
}