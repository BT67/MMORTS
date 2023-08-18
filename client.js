var now = require("performance-now");
var _ = require("underscore");
const mysql = require("mysql");

module.exports = function () {
    //Below objects are added to client by the server at runtime:
    //this.socket = {}
    //this.user = {}
    this.initiate = function () {
        var client = this;
        //send the connection handshake packet to the client
        client.socket.write(packet.build(["HANDSHAKE", now().toString()]));
        console.log(timeNow() + "Client Successfully Initiated, client Id=" + client.id);
    };

    this.data = function (data) {
        var client = this;
        var clientid = client.id;
        console.log(data);
        console.log(timeNow() + "Client Data: " + data.toString());
        packet.parse(client, data);
    };

    //Log the user out if client is unexpectedly closed or crashes:
    this.error = function (err) {
        var client = this;
        var clientid = client.id;
        console.log(timeNow() + "Client Error: " + err.toString());
        console.log(timeNow() + "Client Connection Closed");
        const connection = mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
        });
        function getLastRecord(clientid, next) {
            var query_str = "SELECT username, current_room FROM webrpg.users WHERE current_client = ? LIMIT 1";
            var query_var = [clientid];
            connection.query(query_str, query_var, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                    next(null, rows);
                }
            });
        }
        getLastRecord(clientid, function (err, data) {
            if (err) {
            } else {
                var result = []
                data.forEach(function (rowPacket) {
                    result.push(rowPacket.username);
                    result.push(rowPacket.current_room);
                })
                var user = result[0];
                if(user != undefined) {
                    console.log(timeNow() + "received logout packet from clientid=" + client.id + " logged in as user=" + user);
                }
                var query = "UPDATE webrpg.users SET online_status = 0 , current_client = null WHERE username = ? AND online_status = 1 LIMIT 1";
                var values = [user];
                if(user != undefined) {
                    connection.query(query, values, function (error, result) {
                        if (error) {
                            console.log(timeNow() + "Error: Failed to logout user=" + user + " from clientid=" + client.id);
                        } else {
                            console.log(timeNow() + "logout successful, clientid=" + client.id + " logged out as user=" + user);
                        }
                    });
                } else {
                    console.log(timeNow() + "Client Disconnected, clientid=" + client.id);
                }
                //Get list of other clients in the same room:
                var clientid = client.id;
                var current_room = result[1];
                function getLastRecord(clientid, current_room, next) {
                    var query_str = "SELECT current_client FROM webrpg.users WHERE current_room = ? AND current_client != ? ";
                    var query_var = [current_room, clientid];
                    connection.query(query_str, query_var, function (err, rows, fields) {
                        if (err) {
                            console.log(err);
                            next(err);
                        }
                        else {
                            next(null, rows);
                        }
                    });
                    connection.end();
                }
                getLastRecord(clientid, current_room,function(err, data) {
                    if(err) {
                    } else {
                        var result = []
                        data.forEach(function(rowPacket){
                            result.push(rowPacket.current_client);
                        })
                        if(current_room != undefined) {
                            maps[current_room].clients.forEach(function (otherClient) {
                                otherClient.socket.write(packet.build(["NETLOGOUT", user]));
                            });
                        }
                    }
                });
                if(current_room != undefined) {
                    delete maps[current_room].clients[maps[current_room].clients.indexOf(client)];
                }
            }
        });
    };
    this.end = function () {
    };

};

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}