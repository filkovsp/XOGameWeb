// var sock = new WebSocket("ws://websockets.localhost:8001");
var sock = new WebSocket("ws://192.168.1.90:8001");

sock.onopen = function (event) {
    console.log(event);				
/*				
    setTimeout(function() {
        // sock.send("Connection Ok!");
    }, 1000);
*/
    
};

sock.onmessage = function (event) {
    console.log(event);
    try {
        var response = JSON.parse(event.data);
        if (response.sender == "server" & response.connection == "Ok") {
            document.getElementById("playerId").value = response.playerId;
            document.getElementById("sign").value = response.sign;
            document.getElementById("color").value = response.color;
        }


        if (response.sender == "player") {
            var playerId = response.playerId;
            var sign = response.sign;
            var color = response.color;
            var move = response.move;

            xoCell = document.getElementById(move);
            xoCell.setAttribute("style", "color:" + color + ";");
            xoCell.innerHTML = sign;

        }
    } catch (ex) {
        console.log(ex.message);
    }
    
};

function playerClick(arg) {
    //document.querySelector("#playerName").
    var playerName = document.getElementById("playerName").value;
    var playerId = document.getElementById("playerId").value

    if(playerId !== "undefined" & playerId != '') {
        if (sock.readyState == 1) {
            // alert(sock.readyState);
            // sock.send(playerId + "|" + arg);
            var sign = document.getElementById("sign").value;
            var color = document.getElementById("color").value;
            var msg = JSON.stringify({
                "sender" : "player",
                "playerId" : playerId,
                "sign" : sign,
                "color" : color,
                "move" : arg
            });

            sock.send(msg);
            
            var xoCell = document.getElementById(arg);
            xoCell.setAttribute("style", "color:" + color + ";");
            xoCell.innerHTML = sign;
        }
    } else {
        alert("Fill in your Name please!");
    }

    

}
//document.querySelector("button").onclick = function() {
//document.querySelector("#btn").onclick = function() {
//	sock.send("hello");
// 	alert("Hi!");
//};