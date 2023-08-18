//TODO implement a server-side function that periodically updates the position of all enemies in certain rooms to clients
/*
All enemy movement is handled by the server.
All enemy health/damage to player is also handled by the server
Player sends attack packets to the server, server handles damage logic, server sends packet to client to update player and enemy health
All player/enemy collisions should also be handled by the server.
Client handles no game logic, and is there only to receive player input and give visual representation of the server state.
 */

function start() {
    const mysql = require("mysql");
    var movement = [];
    var num_enemies = 3;
    for (let i = 0; i < num_enemies; i++) {
        movement.push(require((__dirname + '/Resources/Game Data/Enemies/Paths/test_enemy_' + (i + 1))));
    }
//Continuosly update enemy movement:
    while (true) {
        console.log(Date.now());
        if (Date.now() % 5 == 0) {
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
            });

            function getLastRecord(room, next) {
                //Update movement for all enemies not in combat/pursuit
                var query_str = "SELECT enemy_id, pos_x, pos_y, enemy_name from webrpg.zone1 WHERE alive_status = 1 AND pursuing = 0";
                var query_var = [];
                connection.query(query_str, query_var, function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        logger.info(err);
                        next(err);
                    } else {
                        console.log(err);
                    }
                });
            }

            var current_room = "zone1";

            getLastRecord(current_room, function (err, data) {
                if (err) {
                } else {
                    console.log("Pop enemy query results" + data);
                    data.forEach(function (rowpacket) {
                        console.log(rowpacket.enemy_id + " position: " + movement[rowpacket.enemy_id][0][0].toString() + "," + movement[rowpacket.enemy_id][0][1].toString());
                        console.log(rowpacket.enemy_id + " movement path: " + movement[rowpacket.enemy_id].toString());
                        if ((rowpacket.pos_x == movement[rowpacket.enemy_id][0][0]) && (rowpacket.pos_y == movement[rowpacket.enemy_id][0][1])) {
                            var temp = movement[rowpacket.enemy_id].shift();
                            movement[rowpacket.enemy_id].push(temp);
                            console.log(rowpacket.enemy_id + " movement path updated: " + movement[rowpacket.enemy_id].toString());
                        }
                        var delta_x = (movement[rowpacket.enemy_id][0][0] - rowpacket.pos_x) / Math.abs(movement[rowpacket.enemy_id][0][0] - rowpacket.pos_x);
                        var delta_y = (movement[rowpacket.enemy_id][0][1] - rowpacket.pos_y) / Math.abs(movement[rowpacket.enemy_id][0][1] - rowpacket.pos_y);
                        maps[current_room].clients.forEach(function (client) {
                            console.log("Sending movenemy packet to clientid=" + client.id + ": " + rowpacket.enemy_id + "," + delta_x + "," + delta_y);
                            console.log(packet.build(["MOVENEMY", rowpacket.enemy_id, delta_x.toString(), delta_y.toString()]));
                            client.socket.write(packet.build(["MOVENEMY", rowpacket.enemy_id, delta_x.toString(), delta_y.toString()]));
                        });
                        var query = "UPDATE webrpg.zone1 SET pos_x = ?, pos_y = ? WHERE enemy_id = ? AND alive_status = 1";
                        var pos_x = rowpacket.pos_x + delta_x;
                        var pos_y = rowpacket.pos_y + delta_y;
                        var values = [pos_x, pos_y, enemy_id];
                        connection.query(query, values, function (err, result) {
                            if (err) {
                                console.log(err);
                                logger.info(err);
                            } else {
                                console.log(result);
                            }
                        });
                    })
                }
            });
        }
    }
}

start();


