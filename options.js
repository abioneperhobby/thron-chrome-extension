function dimenticami() {

	$('#clientId')[0].value = items.clientId;
	$('#username')[0].value = items.username;
	$('#password')[0].value = items.password;

	chrome.storage.sync.set({
		clientId : '',
		username : '',
		password : ''
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'I tuoi dati sono stati eliminati';
	});
}

function save_options() {

	clientId = $('#clientId')[0].value;
	username = $('#username')[0].value;
	password = $('#password')[0].value;

	chrome.storage.sync.set({
		clientId : clientId,
		username : username,
		password : password
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Grazie. Ora puoi cliccare l\'icona dell\'estensione : se riuscirò a connettermi, non tornerai più qui.';
                window.close();
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	// Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get({
		clientId : '',
		username : '',
		password : ''
	}, function(items) {
		$('#clientId')[0].value = items.clientId;
		$('#username')[0].value = items.username;
		$('#password')[0].value = items.password;
	});
}


$(document).ready(function() {
    //si è costretti a richiamare l'autorizzazione della telecamera su options
    navigator.webkitGetUserMedia({audio: false, video: true}, function (stream) {
        console.log("webkitGetUserMedia ok");
    }, function (err) {
        console.log(err);
    });

    restore_options();
    $('#save').click(save_options);
    $('#dimenticami').click(dimenticami);


});

