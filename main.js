var logga = function(testo){
    $('#status').append(testo);
}

$(document).ready(function() {
    //questo il riferimento ai dati in background
    var background = chrome.extension.getBackgroundPage();
    //una volta riesumata l'applicazione verifichiamo la presenza di dati di login
    console.log("main.js");
    logga("Verifico i dati e casomai loggo");
    background.verifyLoginData();
});
