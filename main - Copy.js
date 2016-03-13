var tokenId,
    username,
    password,
    socket,
    clientId = null;

function logIn(clientId, username, password) {
        alert("DIO22");
	clientId = clientId;
	username = username;
	password = password;

	var url = "http://" + clientId + "-view.4me.it/api/xsso/resources/identitymanager/login";
	$.ajax({
		type : "POST",
		beforeSend : function(request) {
			request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			request.setRequestHeader("X-USERNAME", username);
			request.setRequestHeader("X-PASSWORD", password);
		},
		url : url,
		data : {
			"clientId" : clientId
		},
		success : function(token) {
			tokenId = token;
			connectToNotificationCenter(clientId, username, password, token);
			$('#status').append("Utente riconosciuto!");
		}
	});
}

function connectToNotificationCenter(clientId, username, password, tokenId) {

	var options = {
		resource : "api/chatserver/socket.io",
		'sync disconnect on unload' : true
	};
	var csHost = clientId + "-push.thron.com";
	socket = io.connect(csHost, options);

	socket.on('serverReady', function(data) {
		if (data.resultCode !== "OK") {
			console.log("server startup. resultCode: " + data.resultCode + "; errorDescription: " + data.errorDescription);
			
		} else {
			console.log("Server is ready: version " + data.payload.version);
			$('#status').append("Sono connesso al server di chat!");
			var data = {
				'headers' : {},
				'payload' : {
					'username' : username,
					'clientId' : clientId,
					'tokenId' : tokenId,
					"isApp" : false
				}
			};
			socket.emit('clientReady', data);
		}
	});

	socket.on('recentSessions', function(data) {
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
			console.log("mi risulta" + counter);
			chrome.browserAction.setBadgeText({
				text : "" + counter + ""
			});

		}
	});

	/* sever sent list of recent message upon connection of client */
	socket.on('statusChanged', function(data) {
		if (data.resultCode !== "OK") {
			console.log("<br> Status changed. resultCode: " + data.resultCode + "; errorDescription: " + data.errorDescription);
		} else {
			console.log("<br> Status changed to: " + "username: " + data.payload.username + ", clientId: " + data.payload.clientId + ", online: " + data.payload.online + ", lastSeen: " + data.payload.lastSeen + ", fullName: " + data.payload.fullName + ", status: " + data.payload.status + ", statusMsg: " + data.payload.statusMsg);
		}
	});

	socket.on('userOnline', function(data) {
		if (data.resultCode !== "OK") {
			console.log("<br>User couldn't get online. resultCode: " + data.resultCode + "; errorDescription: " + data.errorDescription);
		} else {
			var output = "User online! " + "Username: " + data.payload.username + ", clientID: " + data.payload.clientId + ", fullName: " + data.payload.fullName + ", avatarURL: " + data.payload.avatarURL + ", lastSeen: " + data.payload.lastSeen + ", status: " + data.payload.status + ", statusMsg: " + data.payload.statusMsg + "<br>";
			console.log(output);

			if (data.payload.username == username && data.payload.clientId == clientId) {
				showNumber();
			} else {
				console.log("non ero io", data);
			}

		}
	});

	socket.on('userAction', function(data) {
		console.log(data);
		if (data.resultCode == "OK") {
			if (data.payload.username = username) {
				showNumber();
			}

		}
	});
	socket.on('chatMsg', function(data) {
		console.log(data);
		if (data.resultCode == "OK") {
			if (data.payload.username = username) {
				showNumber();
			}
		}
	});

}

function logOut() {

}

function showNumber() {
	console.log("sono io! che novita ci sono per me ?");
	//verra intercettata da recentSessions
	socket.emit('getChatSessions', {
		'headers' : {},
		'payload' : {
			'username' : username,
			'clientId' : clientId,
			'offset' : 0,
			'numOfRes' : 50,
			'offsetMsg' : 0,
			'numOfResMsg' : 50
		}
	});
}

//-------------------------------------//

$(document).ready(function() {
	chrome.browserAction.setBadgeText({
		text : "?"
	});

	//verifico se l'applicazione è stata configurata, altrimenti rimando alla configurazione

	var clientId,
	    username,
	    password;

	chrome.storage.sync.get({
		clientId : '',
		username : '',
		password : ''
	}, function(items) {

		clientId = items.clientId;
		username = items.username;
		password = items.password;

		iCanTryLogin = typeof clientId !== 'undefined' && clientId !== '' && typeof username !== 'undefined' && username !== '' && typeof password !== 'undefined' && password !== '';

		if (iCanTryLogin) {
			logIn(clientId, username, password);
		} else {
			chrome.runtime.openOptionsPage();
		}

	});

});
