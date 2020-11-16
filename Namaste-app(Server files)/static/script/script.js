//initialisation starts
console.log("script")
const socket = io()
const videoGrid = document.getElementById("video-grid")
const myPeer = new Peer(undefined, {
    host: "/",
    port: "3001"
})
var screenSharePeer;
let captureStream = null;
console.log("script")
const myVideo = document.createElement("video")
myVideo.muted = true
console.log("script")

const peers = {}

var myStream;
var UserId;
var anonymous = false
//initialisation ends



/** initial starts */
$("#people").hide()
$("#chat").hide()
var moved = true;

$(".sideBar").toggle("slide", { direction: "right" })

setTimeout(function () {
    $("#control_area").slideUp();
    moved = false;
}, 3000)


function showControlArea() {
    if (!moved) {
        console.log("slide up");
        moved = true
        $("#control_area").slideDown();
        setTimeout(function () {
            $("#control_area").slideUp();
            moved = false
        }, 10000);
    }
}
/** initial ends */


/** clock function starts */
function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var am_pm = today.getSeconds();
    m = checkTime(m);
    if (h > 11) s = "PM"
    else s = "AM"
    if (h > 12) h = Math.abs(h - 12);
    document.getElementById('currentTime').innerHTML =
        h + ":" + m + "&nbsp;" + s;
    var t = setTimeout(startTime, 500);
}

function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}

/** clock function ends */





/*Accessing cam and microphone and start the stream */
// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     console.log("stream")

//     //add my video to video grid
//     addVideoStream(myVideo, stream)
//     myStream = stream

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



/*Accessing cam and microphone and start the stream */
console.log("stream")
myStream = mystream
//add my video to video grid
if (!(myStream.getAudioTracks()[0].enabled)) { $("#muteAudioBtn").toggleClass("btn-danger"); $("#muteAudioBtn").children("i").toggleClass("fa-microphone-slash") }
if (!(myStream.getVideoTracks()[0].enabled)) { $("#muteVideoBtn").toggleClass("btn-danger"); $("#muteVideoBtn").children("i").toggleClass("fa-video-camera"); $("#muteVideoBtn").children("i").toggleClass("fa-video-slash") }
addVideoStream(myVideo, myStream)


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

/*Accessing cam and microphone and start the stream block ends*/




//function to add people to the people list
function addPeople(name, id) {
    $("#peoppleBox").append(`<div class="person" id="${id}">\
        <img src = "https://ui-avatars.com/api/?bold=true&size=40&rounded=true&name=${name[0]}&color=fff&background=rgb(0,123,255)" alt = "">\
        <div class="name">${name}</div>\
                </div >`)
}


/* socket connections start */

//introducing......
socket.on("introduced", data => {
    console.log(data)
    addPeople(data["name"], data["userId"])
})


//user disconnected eventt
socket.on("user-disconnected", userId => {
    console.log("user disconnected", userId)
    if (peers[userId]) peers[userId].close()
    showSnackBar(`${$(`#${userId}`).children(".name").html()} has left the meeting`, userId)
    $(`#${userId}`).remove()
    try {
        $(`#video-${userId}`).remove()
    } catch (err) { }

})



//receive incoming text message
socket.on("receiveMessage", data => {
    $("#chatBox").append(`<div class=\"msg\">\
    <div class=\"user\">${data["user"]}</div><div class=\"time\">&nbsp;${$("#currentTime").html()}</div>\
    <div class=\"text\">${data["message"]}</div>\
    </div>`);
})


//user-connected event
socket.on("user-connected", data => {
    socket.emit("introduce", data["userId"])
    console.log("user conencted", data["userId"])
    setTimeout(() => { connectToNewUser(data["userId"], myStream) }, 5000);
    addPeople(data["name"], data["userId"])
})


/* socket connections end */




//seting up peer connection and emit join room event
myPeer.on("open", id => {
    UserId = id
    console.log(id)
    socket.emit("join-room", id, RoomId, name)
})



//function to add video stream to video-grid
function addVideoStream(video, stream) {
    try {
        video.srcObject = stream
        video.addEventListener("loadedmetadata", () => {
            video.play()
        })

        videoGrid.append(video)
    }
    catch (e) {
        console.log("add videostream error", e)
    }
}


//function to conne to new peer when some one joins
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

//end call function
function endCall() {
    // window.location.replace(`/end-${RoomId}`);
    myPeer.destroy();
    socket.off();
    socket.disconnect();
    myStream.getTracks().forEach(function (track) {
        track.stop();
    });
    $(".endcall").toggleClass("endcall-hidden");
    $(".meetScreen").hide();
}


//function to mute audio
function muteAudio(t) {
    try {
        myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);
        $(t).toggleClass("btn-danger")
        $(t).children("i").toggleClass("fa-microphone-slash")
    }
    catch (err) {
        console.log(err)
    }
}


//function to mute video
async function muteVideo(t) {
    try {
        myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
        // if (myStream.getVideoTracks()[0].readyState != "ended") {
        //     myStream.getVideoTracks()[0].stop()
        //     console.log(myStream.getVideoTracks()[0])
        // }
        // else {
        //     let newVideo = await navigator.mediaDevices.getUserMedia({
        //         video: true
        //     })

        //     myStream.removeTrack(myStream.getVideoTracks()[0])
        //     myStream.addTrack(newVideo.getVideoTracks()[0])
        //     console.log(myStream.getVideoTracks()[0])
        // }
        $(t).toggleClass("btn-danger")
        $(t).children("i").toggleClass("fa-video-camera");
        $(t).children("i").toggleClass("fa-video-slash")
    }
    catch (err) {
        console.log(err)
    }
}


//function to toggle drawer with participants
function toggleSideBar(option) {
    if (option == 'chat') toggleSideChat()
    if (option == 'people') toggleSidePeople()
    $(".navbar").slideUp()
    $(".sideBar").toggleClass("sideBar-active")
    // $(".content").width("calc(100% - 350px)");
}


//function to close drawer
function closeSideBar() {
    $(".navbar").slideDown()
    $(".sideBar").toggleClass("sideBar-active")
    // $(".content").width("100%");
}


//function that opens side bar with chat
function toggleSideChat() {
    console.log("chat")
    $("#people").hide()
    if (!$("#chat-btn").hasClass("btn-active")) {
        $("#chat-btn").addClass("btn-active");
        $("#chat-icon").addClass("fa")
        $("#chat").show()
    }

    if ($("#people-btn").hasClass("btn-active")) {
        $("#people-btn").removeClass("btn-active")
        $("#people-icon").removeClass("fa")
    }
}


//function that opens side bar with participants
function toggleSidePeople() {
    $("#chat").hide()
    console.log("people")
    if (!$("#people-btn").hasClass("btn-active")) {
        $("#people-btn").addClass("btn-active");
        $("#people-icon").addClass("fa")
        $("#people").show()
    }

    if ($("#chat-btn").hasClass("btn-active")) {
        $("#chat-btn").removeClass("btn-active")
        $("#chat-icon").removeClass("fa")
    }
}



//function to present screen (not working)
async function presentScreen() {

    if (captureStream == null) {
        try {
            captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: false
            });



            screenSharePeer = new Peer(undefined, {
                host: "/",
                port: "3001"
            })

            screenSharePeer.on("open", id => {
                socket.emit("join-room", id, RoomId, name)
            })


            screenSharePeer.on("call", call => {
                call.answer(captureStream)
            })
            peerkeys = Object.keys(peers)
            for (var i = 0; i < peers.length; i++) {
                screenSharePeer.call(peerkeys[i], captureStream)
            }


        } catch (err) {
            console.error("Error: " + err);
        }
    }
    else {
        captureStream = null
        // screenSharePeer.disconnect()
    }
}



//functin to send text message
$("#chatForm").submit(function (e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    if ($("#chatText").val().length == 0) return

    $("#chatBox").append(`<div class=\"msg\">\
    <div class=\"user\">You${anonymous ? "&nbsp;&nbsp;(Anonymously)" : ""}</div><div class=\"time\">&emsp;${$("#currentTime").html()}</div>\
    <div class=\"text\">${$("#chatText").val()}</div>\
    </div>`);

    socket.emit("message", { "data": $("#chatText").val(), "roomId": RoomId, "user": anonymous ? "Anonymous" : name })

    $("#chatText").val('')
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


// snack bar function
function showSnackBar(text, id) {
    $(".meetScreen").append(`<div id="snackbar" class="snackbar-${id}">${text}</div>`)
    $(`.snackbar-${id}`).toggleClass("show")
    setTimeout(function () { $(`.snackbar-${id}`).remove() }, 2900);
}


//enable or disable anonymous messaging mode.
function anonymous_fn() {
    anonymous = !anonymous
    $(".fa-user-secret").toggleClass("active")
    $(".input-group-text").toggleClass("active")
    $(".modal-body").html(`Anonymous Messaging ${anonymous ? "Enabled" : "Disabled"} `)
    $("#incognitoModal").modal("show")
}



function rejoin() {
    window.location.reload();
}

function goHome() {
    window.location.replace("/")
}
