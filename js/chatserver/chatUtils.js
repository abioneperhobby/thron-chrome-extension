var unreadNotify;
var clientId, username, password;

function logIn(clientId, username, password) {
    console.log("login");

    clientId = clientId;
    username = username;
    password = password;

    var url = "http://" + clientId + "-view.4me.it/api/xsso/resources/identitymanager/login";

    $.ajax({
        type: "POST",
        beforeSend: function (request) {
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.setRequestHeader("X-USERNAME", username);
            request.setRequestHeader("X-PASSWORD", password);
        },
        url: url,
        data: {
            "clientId": clientId
        },
        success: function (token) {
            tokenId = token;
            
            connectToNotificationCenter(clientId, username, password, token);

        }, failure: function (a, b, c) {
            chrome.browserAction.setBadgeText({
                text: ":("
            });

            chrome.storage.sync.set({
                clientId: '',
                username: '',
                password: ''
            }, function () {
                console.log("login failed, data deleted");
            });

        }
    });
}


function connectToNotificationCenter(clientId, username, password, tokenId) {
    console.log("connectToNotificationCenter");
    var options = {
        resource: "api/chatserver/socket.io",
        'sync disconnect on unload': true
    };
    var csHost = clientId + "-push.thron.com";
    socket = io.connect(csHost, options);

    socket.on('serverReady', function (data) {
        if (data.resultCode == "OK") {
            console.log("Server is ready: version " + data.payload.version);
            logga("ciccio");
            //notifico che sono online cosi arrivera uno User Online (io)
            //se non lo faccio mi dice che non sono autenticato!
            var data = {
                'headers': {},
                'payload': {
                    'username': username,
                    'clientId': clientId,
                    'tokenId': tokenId,
                    "isApp": false
                }
            };
            socket.emit('clientReady', data);

        } else {
            console.log("server startup. resultCode: " + data.resultCode + "; errorDescription: " + data.errorDescription);
        }
    });

    socket.on('recentSessions', function (data) {
        if (data.resultCode !== "OK") {
            console.log("Recent sessions with unread count. resultCode: " + data.resultCode + "; errorDescription: " + data.errorDescription);
        } else {
            console.log("sessions count:" + data.payload.count);
            console.log("Recent Sessions ", data);

            var sessions = data.payload.sessions;
            var counter = 0;
            for (var i = 0; i < sessions.length; i++) {
                session = sessions[i];
                if (session.unreadCount > 0) {
                    counter = counter + session.unreadCount;
                }
            }

            unreadNotify = counter;

            updateBadge(unreadNotify);

        }
    });

    /* sever sent list of recent message upon connection of client */
    socket.on('statusChanged', function (data) {
        if (data.resultCode == "OK") {
            if (data.payload.username == username && data.payload.clientId == clientId) {
                console.log("statusChanged");
                socket.emit('getChatSessions', {
                    'headers': {},
                    'payload': {
                        'username': username,
                        'clientId': clientId,
                        'offset': 0,
                        'numOfRes': 50,
                        'offsetMsg': 0,
                        'numOfResMsg': 50
                    }
                });
            }
        } else {
            console.log("<br> Status changed. resultCode: " + data.resultCode + "; errorDescription: " + data.errorDescription);
        }
    });

    socket.on('userOnline', function (data) {
        console.log("userOnline", data);
        if (data.resultCode == "OK") {
            if (data.payload.username == username && data.payload.clientId == clientId) {
                console.log("ero io", data);
                //chiedo se ci sono 
                socket.emit('getChatSessions', {
                    'headers': {},
                    'payload': {
                        'username': username,
                        'clientId': clientId,
                        'offset': 0,
                        'numOfRes': 50,
                        'offsetMsg': 0,
                        'numOfResMsg': 50
                    }
                });

            } else {
                console.log("non ero io", data);
            }
        } else {
            console.log("<br>User couldn't get online. resultCode: " + data.resultCode + "; errorDescription: " + data.errorDescription);
        }

    });
    //tipo ha smesso di scrivere
    socket.on('userAction', function (data) {
        if (data.resultCode == "OK") {
            if (data.payload.username = username) {
                console.log("userAction", data);
            }
        }
    });
    //tipo ho un nuovo messaggio di chat
    socket.on('chatMsg', function (data) {
        if (data.resultCode == "OK") {
            if (data.payload.username = username) {
                console.log("chatMsg", data);
                socket.emit('getChatSessions', {
                    'headers': {},
                    'payload': {
                        'username': username,
                        'clientId': clientId,
                        'offset': 0,
                        'numOfRes': 50,
                        'offsetMsg': 0,
                        'numOfResMsg': 50
                    }
                });
            }
        }
    });

}

updateBadge = function (what) {
    chrome.browserAction.setBadgeText({
        text: "" + what + ""
    });
}