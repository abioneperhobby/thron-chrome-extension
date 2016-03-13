//Settings
var clientId, username, password;

var verifyLoginData = function () {
    console.log("VerifyLoginData");
    chrome.storage.sync.get({
        clientId: '',
        username: '',
        password: ''
    }, function (items) {
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

}