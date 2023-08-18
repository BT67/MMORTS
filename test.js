const mysql = require("mysql");
const q = require("q");
var clientid = 0;
var current_room = "zone1";
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
});
var client_username = "lok";
var net_username = "pok";
var current_room = "zone1";
var target_x = 200;
var target_y = 200;
function pop(client_username, net_username, current_room, target_x, target_y) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
    });
    //get client id of client_user:
    function getLastRecord(client_username, current_room, next) {
        var query_str = "SELECT current_client FROM webrpg.users WHERE username = ? AND online_status = 1 AND current_room = ? LIMIT 1";
        var query_var = [client_username, current_room];
        var query = connection.query(query_str, query_var, function (err, rows, fields) {
            if (err) {
                console.log(err);
                logger.info(err);
                next(err);
            } else {
                next(null, rows);
            }
        });
        connection.end();
    }
    var user = client_username;
    var net_user = net_username;
    var room = current_room;
    var originclient = null;
    var x = target_x;
    var y = target_y;
    getLastRecord(user, room,function (err, data) {
        if (err) {
            console.log("ERROR");
        } else {
            console.log("Querying database...");
            var result = []
            data.forEach(function (rowPacket) {
                result.push(rowPacket.current_client);
            })
            originclient = result[0];
            console.log("Received pop packet from clientid=" + originclient + " logged in as user=" + user + " in room=" + room);
            console.log("Origin client: " + originclient);
            maps[current_room].clients.forEach(function (otherClient) {
                if(otherClient.id == originclient) {
                    console.log("sending pop packet from user=" + user + " to clientid=" + otherClient.id + "(user=" + otherClient.user + ") for room=" + current_room);
                    console.log("Sent packet: " + packet.build(["POP", net_user, x, y]).toString());
                    otherClient.socket.write(packet.build(["POP", net_user, x, y]));
                }
            });
        }
    });
}
pop(client_username, net_username, current_room, target_x, target_y);