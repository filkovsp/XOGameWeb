// https://stackoverflow.com/questions/26971026/handling-connection-loss-with-websockets
// var SOCKET_CONNECTING = 0;
// var SOCKET_OPEN = 1;
// var SOCKET_CLOSING = 2;
// var SOCKET_CLOSED = 3;

const WebSocket = require('ws');
const wss = new WebSocket.Server({port : 8001});

// var server = require('ws').Server;
// var ss = new server({port : 8001});

var players=[];

const max_players = 2;
var nowTurn = null;

/*
    matrinx in JS: 
    https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript
*/
const nrows = 3;
const ncols = 3;
const matrix = new Array(nrows).fill(null).map(row => new Array(ncols).fill(null));

wss.broadcast = function broadcast(message) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
};

wss.on("connection", function(ws) {
    /*
        number of connected clients: wss.clients.size
        https://github.com/websockets/ws/issues/1087
    */
    // console.log("# of clients: " + wss.clients.size);
    
    //console.log("somene new is coming...");

    if (players.length < max_players) {
        addPlayer(ws);
    } else {
        var msg = {
            "sender" : "server",
            "connection" : "ERROR",
            "message" : "No more room on the server!"
        };
        msg = JSON.stringify(msg);
        ws.send(msg);
        ws.close();
        return;
    }
    
    /*
    ws.on("open", function () {
        setTimeout(function(){
            //ws.send("Connection Ok!");
            // ws.send("[ConnectionOk," + "{\"id\" : \"" + i + "\"}]");
        }, 1000);
        
    });
    */
    
    ws.on("message", function(message) {

        if (message != '' & message != null) {

            wss.clients.forEach(function e(client) {
                    if(client != ws) {
                        //continue;
                        console.log(message);
                        client.send(message);
                    }
                }
            );

            var response = JSON.parse(message);
            if (response.sender == "player") {
                var playerId = response.playerId;
                var sign = response.sign;
                var move = response.move;

                x = move.toString()[1] - 1;
                y = move.toString()[0] - 1;
                matrix[y][x] = sign;
            }


        }

    // or, alternatively this way:
    /*
        for (var i=0; i < players.length; i++) {
            players[i].ws.send(message);
        }

    */

    });

    // ws.on('upgrade', function(){
    //     connection.log("upgrading....");
    // });

    ws.on('close', function() {
        // console.log("oops... we've lost someone...");
        removePlayer(ws);
    });

    function removePlayer (ws) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].ws === ws) {
                console.log("connection lost with player id " + players[i].uid);
                players.splice(i, 1);
            }
        }
    }

    function addPlayer(ws) {
        
        var player = Object ({
            uid : Math.floor(Math.random() * 1000),
            sign : null,
            color : null,
            jsonstr : null,
            ws: ws
        });        
        
        players.push(player);
        console.log("connected new player, uid: " + player.uid);

        if(players.length == max_players) {
            
            // console.log("we've got full house!");

            if (players[0].uid > players[1].uid) {
                players[0].sign = 'X';
                players[0].color = 'red';
                players[1].sign = 'O';
                players[1].color = 'blue';
            } else {
                players[0].sign = 'O';
                players[0].color = 'blue';
                players[1].sign = 'X';
                players[1].color = 'red';
            }

            players[0].jsonstr = JSON.stringify ({
                "sender" : "server",
                "connection" : "Ok",
                "playerId" : players[0].uid,
                "sign" : players[0].sign,
                "color" : players[0].color
            });

            players[1].jsonstr = JSON.stringify ({
                "sender" : "server",
                "connection" : "Ok",
                "playerId" : players[1].uid,
                "sign" : players[1].sign,
                "color" : players[1].color
            });
            
            players[0].ws.send(players[0].jsonstr);
            players[1].ws.send(players[1].jsonstr);

            nowTurn = (Math.floor(Math.random() * 1000) > Math.floor(Math.random() * 1000)) ? players[0].uid : players[1].uid;
            
            var jsonstr = JSON.stringify ({
                "sender" : "server",
                "nowTurn" : nowTurn
            });

            wss.broadcast(jsonstr);
        }
        
    }

    function getPlayerByUID (uid) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].uid == uid) {
                return players[i];
            }
        }
    }

    function getPlayerBySign (sign) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].sign == sign) {
                return players[i];
            }
        }
    }

});


