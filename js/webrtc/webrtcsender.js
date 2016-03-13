var getId = "sender";
var toID = "receiver";
            

var peer = new Peer(getId, {key: 'j1az7w18hbf39pb9', debug: 3});

peer.on('open', function (id) {
    console.log("open", id);
});

peer.on('connection', function (dataConnection) {
    console.log("connection", id);
});

peer.on('call', function (mediaConnection) {
    console.log("call", mediaConnection);
});

peer.on('close', function () {
    console.log("close");
});

peer.on('disconnect', function () {
    console.log("disconnect");
});

peer.on('error', function (err) {
    console.log("error", err);
});

dataConnection = peer.connect(toID);

dataConnection.on('data', function (data) {
    console.log("Data Connection, data obtained : ", data);
});

dataConnection.on('open', function () {
    console.log("data connection opened, ready to use");
    dataConnection.send('ciao');

    //parte telecamera
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    

    navigator.getUserMedia({audio: false, video: true}, function (stream) {
        // Set your video displays
        $('#my-video').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;

        var call = peer.call(toID, window.localStream);


    }, function (err) {
        console.log("errore!",err);
    });

});

dataConnection.on('close', function () {
    console.log("Data connection closed");
});

dataConnection.on('error', function (err) {
    console.log("Data Connection error", err);
});