var mystream;
var previewVideo = document.getElementById("previewVideo")
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
}).then(stream => {
    mystream = stream
    previewVideo.srcObject = mystream
}).catch(err => {
    console.log(err)
})


function mutePreviewAudio() {
    $(".previewAudioButton").toggleClass("btn-danger")
    $(".previewAudioButton").children("i").toggleClass("fa-microphone-slash")
    mystream.getAudioTracks()[0].enabled = !mystream.getAudioTracks()[0].enabled
}

function mutePreviewVideo() {
    $(".previewVideoButton").toggleClass("btn-danger")
    $(".previewVideoButton").children("i").toggleClass("fa-video-slash")
    mystream.getVideoTracks()[0].enabled = !mystream.getVideoTracks()[0].enabled
}

function joinMeetNow() {
    // mystream.getTracks().forEach(function (track) {
    //     track.stop();
    // });
    $(".previewScreen").hide();
    $(".meetScreen").toggleClass("meetScreen-hidden")
    var newScript = document.createElement("script");
    newScript.src = scriptSrc;
    $("body").append(newScript);
}