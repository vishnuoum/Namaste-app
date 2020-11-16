const videoGrid = document.getElementsByClassName("videoScreen")[0]
var timeOut;
var socket = io()
var selfVideo = document.getElementById("selfVideo");
var myStream = null;
const myPeer = new Peer(undefined, {
    host: "/",
    port: "3001"
})
var controlButtonshown = true;
var UserId;
const peers = {}


$(".meetInfo").html(`link: ${(window.location.href).replace("?mobileUserAgent=ys", "")}`)


videoGrid.addEventListener("touchstart", toggleControlButton)



setTimeout(toggleControlButton, 3000);


function toggleControlButton() {
    if (controlButtonshown) {
        controlButtonshown = false;
        $(".meetScreen .controlButtons").fadeOut();
        clearTimeout(timeOut)
    }
    else {
        controlButtonshown = true;
        $(".meetScreen .controlButtons").fadeIn();
        timeOut = setTimeout(toggleControlButton, 5000);
    }
}


function showInfo(t) {
    $(".details .btn-group .btn").removeClass("btn-active")
    $(t).addClass("btn-active")
    if ($(".infoScreen").hasClass("Screen-hidden")) {
        $(".infoScreen").removeClass("Screen-hidden")
        $("#chatForm").addClass("Screen-hidden")
        if (!$(".chatScreen").hasClass("Screen-hidden")) $(".chatScreen").addClass("Screen-hidden")
        if (!$(".userScreen").hasClass("Screen-hidden")) $(".userScreen").addClass("Screen-hidden")
    }
}

function showChat(t) {
    $(".details .btn-group .btn").removeClass("btn-active")
    $(t).addClass("btn-active")
    if ($(".chatScreen").hasClass("Screen-hidden")) {
        $(".chatScreen").removeClass("Screen-hidden")
        $("#chatForm").removeClass("Screen-hidden")
        if (!$(".infoScreen").hasClass("Screen-hidden")) $(".infoScreen").addClass("Screen-hidden")
        if (!$(".userScreen").hasClass("Screen-hidden")) $(".userScreen").addClass("Screen-hidden")
    }
}

function showUser(t) {
    $(".details .btn-group .btn").removeClass("btn-active")
    $(t).addClass("btn-active")
    if ($(".userScreen").hasClass("Screen-hidden")) {
        $(".userScreen").removeClass("Screen-hidden")
        $("#chatForm").addClass("Screen-hidden")
        if (!$(".infoScreen").hasClass("Screen-hidden")) $(".infoScreen").addClass("Screen-hidden")
        if (!$(".chatScreen").hasClass("Screen-hidden")) $(".chatScreen").addClass("Screen-hidden")
    }
}

function muteAudio(t) {
    $(t).toggleClass("btn-danger")
    $(t).children("i").toggleClass("fa-microphone-slash")
    myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled
}

function muteVideo(t) {
    $(t).toggleClass("btn-danger")
    $(t).children("i").toggleClass("fa-video-slash")
    // if (myStream.getVideoTracks()[0].enabled) {
    //     selfVideo.srcObject = null
    //     selfVideo.style.objectFit = "fit"
    // }
    // else {
    //     selfVideo.srcObject = myStream
    //     selfVideo.style.objectFit = "cover"
    // }
    myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled
}

function endCall() {
    console.log("endcall")
    // history.back()
    myPeer.destroy();
    socket.off();
    socket.disconnect();
    myStream.getTracks().forEach(function (track) {
        track.stop();
    });
    $(".endScreen").toggleClass("endScreen-hidden")
    $(".meetScreen").hide()

}


function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}


function addPeople(name, id) {
    $(".userScreen").append(`<div class="user" id="${id}"> \
                    <img src="https://ui-avatars.com/api/?bold=true&size=50&rounded=true&name=${name[0]}&background=rgb(0,123,255)&color=rgb(255,255,255)" \
                        alt="user-img"> \
                    <div class="userName">${name}</div> \
                </div>`)
}


function addVideoStream(video, stream) {
    try {
        video.srcObject = stream
        video.poster = "noposter"
        video.classList.add("centerVideo")
        video.addEventListener("loadedmetadata", () => {
            video.play()
        })

        videoGrid.append(video)
    }
    catch (e) {
        console.log("add videostream error", e)
    }
}




//seting up peer connection and emit join room event
myPeer.on("open", id => {
    UserId = id
    console.log(id)
    socket.emit("join-room", id, RoomId, name)
})


/* accessing camera block unnecessary*/
// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     myStream = stream
//     selfVideo.srcObject = myStream;



//     //function to attend receiving calls
//     myPeer.on("call", call => {
//         console.log("receiving call")
//         call.answer(myStream)
//         const video = document.createElement("video")
//         video.id = `video-${call.peer}`
//         call.on("stream", userVideoStream => {
//             console.log(userVideoStream)

//             //add receiving stream to video grid
//             addVideoStream(video, userVideoStream)
//         })
//         call.on("close", () => {
//             video.remove()
//         })
//     })

//     //peer connection error
//     myPeer.on('error', function (err) {
//         console.log("Error: ", err);
//     });
// }, (err) => {
//     console.log(err)
// })

/* accessing camera block unnecessary*/



/*accessing camera block required*/
myStream = mystream
if (!(myStream.getAudioTracks()[0].enabled)) { $("#muteAudioButton").toggleClass("btn-danger"); $("#muteAudioButton").children("i").toggleClass("fa-microphone-slash") }
if (!(myStream.getVideoTracks()[0].enabled)) { $("#muteVideoButton").toggleClass("btn-danger"); $("#muteVideoButton").children("i").toggleClass("fa-video-slash") }
selfVideo.srcObject = myStream;



//function to attend receiving calls
myPeer.on("call", call => {
    console.log("receiving call")
    call.answer(myStream)
    const video = document.createElement("video")
    video.id = `video-${call.peer}`
    call.on("stream", userVideoStream => {
        console.log(userVideoStream)
        //add receiving stream to video grid
        addVideoStream(video, userVideoStream)
    })
    call.on("close", () => {
        video.remove()
    })
})

//peer connection error
myPeer.on('error', function (err) {
    console.log("Error: ", err);
});

/*accessing camera block required ends*/





$("#chatForm").submit(function (e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    if ($("#chatMsg").val().length == 0) return
    $(".chatScreen").append(`<div class="msg"> \
                    <div class="msgUser">You</div> \
                    <div class="msgTime">${formatAMPM(new Date)}</div> \
                    <div class="msgContent">${$("#chatMsg").val()}</div> \
                </div>`)


    socket.emit("message", { "data": $("#chatMsg").val(), "roomId": RoomId, "user": name })

    $("#chatMsg").val("");
    // var form = $(this);
    // var url = form.attr('action');

    // $.ajax({
    //     type: "POST",
    //     url: url,
    //     data: form.serialize(), // serializes the form's elements.
    //     success: function (data) {
    //         alert(data); // show response from the php script.
    //     }
    // });


});



function connectToNewUser(userId, stream) {
    console.log("connect to new user", userId)
    const call = myPeer.call(userId, stream)
    const video = document.createElement("video")
    video.id = `video-${userId}`
    console.log(video)

    peers[userId] = call

    call.on("stream", userVideoStream => {
        console.log("video")
        console.log(userVideoStream)
        addVideoStream(video, userVideoStream)
    })


}



function rejoinMeet() {
    console.log("rejoin")
    window.location.reload()
}

function goHome() {
    console.log("home")
    window.location.replace("/")
}





//introducing......
socket.on("introduced", data => {
    console.log(data)
    addPeople(data["name"], data["userId"])
})



//user disconnected eventt
socket.on("user-disconnected", userId => {
    console.log("user disconnected", userId)
    if (peers[userId]) peers[userId].close()
    Android.snackBar(`${$(`#${userId}`).children(".userName").html()} has left the meeting`)
    $(`#${userId}`).remove()
    try {
        $(`#video-${userId}`).remove()
    } catch (err) { }

})



//receive incoming text message
socket.on("receiveMessage", data => {
    $(".chatScreen").append(`<div class="msg"> \
                    <div class="msgUser">${data["user"]}</div> \
                    <div class="msgTime">${formatAMPM(new Date)}</div> \
                    <div class="msgContent">${data["message"]}</div> \
                </div>`)
})


//user-connected event
socket.on("user-connected", data => {
    socket.emit("introduce", data["userId"])
    console.log("user conencted", data["userId"])
    setTimeout(() => { connectToNewUser(data["userId"], myStream) }, 5000);
    addPeople(data["name"], data["userId"])
})