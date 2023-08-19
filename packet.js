const {data} = require("./client");
const pg = require("pg");
const q = require('q');

//const {toString} = require("underscore/modules/_setup");

var movement = [
    //test_enemy_1:
    // [150, 150], [100, 150], [120, 150], [120, 180], [200, 130], [180, 150]
]
var enemies = [
    //mob_name, x,y,alive, type, targetx, target y,  respawn time, spawn_x, spawn_y
    // ["0", 100, 100, 1, "obj_enemy_test", 100, 100, 500, 100, 100],
    // ["1", 150, 150, 1, "obj_enemy_test", 150, 150, 500, 150, 150],
    // ["2", 100, 170, 1, "obj_enemy_test", 100, 170, 500, 100, 170]
]

var users = [
    //user, x, y, client, health
    // ["pok", 150, 150, 0, 100],
    // ["lok", 150, 150, 0, 100]
]
var pospackets = [];
var tick = 0;
var zeroBuffer = Buffer.from("00", "hex");

module.exports = packet = {
    //params is an array of javascript objects to be turned into buffers to send data to gamemaker
    build: function (params) {
        var packetParts = [];
        var packetSize = 0;
        params.forEach(function (param) {
            var buffer;
            if (typeof param === "string") {
                buffer = Buffer.from(param, "utf8");
                buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1);
            } else if (typeof param === 'number') {
                buffer = Buffer.alloc(2);
                buffer.writeUInt16LE(param, 0);
            } else {
                console.log(timeNow() + "*WARNING* Unknown data type encountered in packet builder: " + typeof (param) + " " + param);
            }
            packetSize += buffer.length;
            packetParts.push(buffer);
        });
        var dataBuffer = Buffer.concat(packetParts, packetSize);
        var size = Buffer.alloc(1);
        size.writeUInt8(dataBuffer.length + 1, 0);
        var finalPacket = Buffer.concat([size, dataBuffer], size.length + dataBuffer.length);
        return finalPacket;
    },
    //Read and separate size, header and data of a packet to be handled for a client by the server
    parse: function (client, data) {
        var idx = 0;
        while (idx < data.length) {
            var packetSize = data.readUInt8(idx);
            var extractedPacket = Buffer.from(packetSize);
            data.copy(extractedPacket, 0, idx, idx + packetSize);
            console.log("Extracted packet: " + extractedPacket);
            //Execute commands based on separated packets:
            this.interpret(client, extractedPacket);
            idx += packetSize;
        }
    },
    //Interpret commands from individual data packets
    interpret: function (client, datapacket) {
        var header = PacketModels.header.parse(datapacket);
        const connection = pg.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
        });
        function login(username, password) {
            connection.connect((error) => {
                if (error) {
                    client.socket.write(packet.build(["LOGIN", "FALSE"]));
                    console.log(error);
                } else {
                    var query = "SELECT * FROM webrpg.users WHERE username = ? AND password = ? AND online_status = 0 LIMIT 1";
                    var values = [username, password];
                    connection.query(query, values, function (error, result) {
                        if (error || (result.length < 1)) {
                            client.socket.write(packet.build(["LOGIN", "FALSE"]));
                            console.log(error);
                        } else {
                            //Obtain other user info from database (room, room pos, inventory, etc)
                            function getLastRecord(username, next) {
                                var query_str = "SELECT current_room, pos_x, pos_y FROM webrpg.users WHERE username = ? LIMIT 1";
                                var query_var = [username];
                                connection.query(query_str, query_var, function (err, rows, fields) {
                                    if (err) {
                                        console.log(err);
                                        next(err);
                                    } else {
                                        next(null, rows);
                                    }
                                });
                            }

                            getLastRecord(username, function (err, data) {
                                if (err) {
                                } else {
                                    var current_room = data[0].current_room;
                                    var pos_x = data[0].pos_x;
                                    var pos_y = data[0].pos_y;
                                    for (let i = 0; i < users.length; i++) {
                                        if (users[i][0] == username) {
                                            users[i][1] = parseInt(pos_x);
                                            users[i][2] = parseInt(pos_y);
                                            break;
                                        }
                                    }
                                    var online_status = 1;
                                    client.socket.write(packet.build(["LOGIN", "TRUE", username, current_room, pos_x, pos_y, online_status]));
                                    maps[current_room].clients.push(client);
                                    //Send network login packet to other clients in the room who are online
                                    maps[current_room].clients.forEach(function (otherClient) {
                                        if (otherClient.id !== client.id) {
                                            otherClient.socket.write(packet.build(["NETLOGIN", username, pos_x, pos_y]));
                                        }
                                    });

                                    //Get list of current enemies in the room, with their positions:
                                    for (let i = 0; i < enemies.length; i++) {
                                        if (enemies[i][3] == 1) {
                                            client.socket.write(packet.build(["POPENEMY", enemies[i][0], enemies[i][4], enemies[i][1].toString(), enemies[i][2].toString(), enemies[i][5].toString(), enemies[i][6].toString()]));
                                        }
                                    }
                                }
                            });
                            var query = "UPDATE webrpg.users SET online_status = 1, current_client = ? WHERE username = ? AND password = ? AND online_status = 0 LIMIT 1";
                            var values = [client.id, username, password];
                            connection.query(query, values, function (error, result) {
                                client.loggedin = 1;
                            });
                            client.user = username;
                            for (let i = 0; i < users.length; i++) {
                                if (users[i][0] == username) {
                                    users[i][3] = client.id;
                                    break;
                                }
                            }
                        }
                    });
                }
            });
        }

        function register(username, password) {
            connection.connect((error) => {
                if (error) {
                    client.socket.write(packet.build(["REGISTER", "FALSE"]));
                    console.log(error);
                } else {
                    //check if username is already taken:
                    var query = "SELECT * FROM webrpg.users WHERE username = ? ";
                    var values = [username];
                    connection.query(query, values, function (error, result) {
                        if (result.length > 1) {
                            client.socket.write(packet.build(["REGISTER", "FALSE"]));
                        } else {
                            //If username is not taken, register the user:
                            var query = "INSERT INTO webrpg.users (username, password, current_room, pos_x, pos_y) VALUES (?,?,0,0,0)";
                            var values = [username, password];
                            connection.query(query, values, function (error, result) {
                                if (error) {
                                    //console.log('Error: Failed to register new user, error adding user to database');
                                    client.socket.write(packet.build(["REGISTER", "FALSE"]));
                                    //console.log("Failed register packet sent");
                                    console.log(error);
                                } else {
                                    client.socket.write(packet.build(["REGISTER", "TRUE"]));
                                }
                            });
                        }
                    });
                }
            });
        }

        //receive pos packet from a client and send info to other clients in the same room:
        //collect packets from all clients, then periodically update all clients at set intervals
        function pos(client_username, target_x, target_y) {
            //get id of origin client:
            var origin_client_id;
            console.log(users);
            console.log(client_username);
            for (let i = 0; i < users.length; i++) {
                if (users[i][0] == client_username) {
                    origin_client_id = users[i][3];
                    users[i][1] = target_x;
                    users[i][2] = target_y;
                    break;
                }
            }
            maps["zone1"].clients.forEach(function (otherClient) {
                if (otherClient.id != origin_client_id) {
                    otherClient.socket.write(packet.build(["POS", client_username, target_x.toString(), target_y.toString()]));
                }
            });
        }

        //receive pop packet from net_user after client_user logs in to populate room, forward packet to client_user:
        function pop(client_username, net_username, current_room, target_x, target_y) {
            connection.connect((error) => {
                if (error) {
                } else {
                    console.log("function, client_user=" + client_username + ", " +
                        "net_user=" + net_username + ", " +
                        "current_room=" + current_room + ", " +
                        "target_x=" + target_x + ", " +
                        "target_y=" + target_y + ", ");

                    //get client id of client_user:
                    function getLastRecord(client_username, current_room, next) {
                        var query_str = "SELECT current_client FROM webrpg.users WHERE username = ? AND current_room = ? LIMIT 1";
                        var query_var = [client_username, current_room];
                        connection.query(query_str, query_var, function (err, rows, fields) {
                            if (err) {
                                console.log(err);
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
                    getLastRecord(user, room, function (err, data) {
                        if (err) {
                        } else {
                            var result = []
                            data.forEach(function (rowPacket) {
                                result.push(rowPacket.current_client);
                            });
                            originclient = maps[current_room].clients[maps[current_room].clients.length - 1];
                            console.log("sending pop packet from user=" + user + " to clientid=" + originclient.id + "(user=" + originclient.user + ") for room=" + current_room);
                            console.log("Sent packet: " + packet.build(["POP", net_user, x, y]).toString());
                            originclient.socket.write(packet.build(["POP", net_user, x, y]));
                        }
                    });
                }
            });
        }

        //With move packets, send target x,y
        function movenemy() {
            for (let i = 0; i < enemies.length; i++) {
                var target_x = users[0][1].toString();
                var target_y = users[0][2].toString();
                if (enemies[i][3] == 1) {
                    maps["zone1"].clients.forEach(function (client) {
                        client.socket.write(packet.build(["MOVENEMY", enemies[i][0], target_x, target_y]));
                    });
                    enemies[i][5] = users[0][1];
                    enemies[i][6] = users[0][2];
                } else if (enemies[i][3] == 0) {
                    //Update respawn timers for dead enemies
                    enemies[i][7] = enemies[i][7] - 1;
                    console.log("Respawn timer: " + enemies[i][7]);
                    //If respawn timer reaches 0, respawn enemy and reset timer
                    if (enemies[i][7] <= 0) {
                        enemies[i][3] = 1;
                        enemies[i][1] = enemies[i][8];
                        enemies[i][2] = enemies[i][9];
                        enemies[i][5] = users[0][1];
                        enemies[i][6] = users[0][2];
                        maps["zone1"].clients.forEach(function (client) {
                            client.socket.write(packet.build(["POPENEMY", enemies[i][0], enemies[i][4], enemies[i][1].toString(), enemies[i][2].toString(), enemies[i][5].toString(), enemies[i][6].toString()]));
                        });
                        enemies[i][7] = 500;
                    }
                }
            }
        }

        //Update enemy current x,y
        function updenemy(enemy_name, current_x, current_y) {
            enemies[enemy_name][5] = current_x;
            enemies[enemy_name][6] = current_y;
            //console.log(enemies);
        }

        //With send player attacks to other clients
        function platk(username, attack, current_x, current_y, target_x, target_y) {
            console.log("platk event");
            console.log(username + "," + attack + "," + current_x + "," + current_y + "," + target_x + "," + target_y)
            maps["zone1"].clients.forEach(function (OtherClient) {
                if (OtherClient.user.toString() != username.toString()) {
                    OtherClient.socket.write(packet.build(["PLATK", username, attack, current_x, current_y, target_x, target_y]));
                }
            });
        }

        //With send enemy attacks to other clients
        function enatk(enemy, attack, current_x, current_y, target_x, target_y) {
            console.log("enatk event");
            console.log(enemy + "," + attack + "," + current_x + "," + current_y + "," + target_x + "," + target_y);
            maps["zone1"].clients.forEach(function (OtherClient) {
                OtherClient.socket.write(packet.build(["ENATK", enemy, attack, current_x, current_y, target_x, target_y]));
            });
        }

        //With send enemy health to other clients
        function enhealth(enemy, health) {
            console.log("enhealth event");
            console.log(enemy + "," + health);
            maps["zone1"].clients.forEach(function (OtherClient) {
                OtherClient.socket.write(packet.build(["ENHEALTH", enemy, health]));
            });
        }

        //With send player health to other clients
        function plhealth(username, health) {
            console.log("plhealth event");
            console.log(username + "," + health);
            for (var i = 0; i < users.length; i++) {
                if (users[i][0] == username) {
                    users[i][4] = health;
                    break;
                }
            }
            console.log(users);
            maps["zone1"].clients.forEach(function (OtherClient) {
                if (OtherClient.user.toString() != username.toString()) {
                    OtherClient.socket.write(packet.build(["PLHEALTH", username, health]));
                }
            });
        }

        //With send logout packet to other clients
        function logout(username) {
            console.log("logout event: " + username);
            for (var i = 0; i < users.length; i++) {
                if (users[i][0] == username) {
                    users[i][3] = null;
                    break;
                }
            }
            maps["zone1"].clients.forEach(function (OtherClient) {
                if (OtherClient.user.toString() != username.toString()) {
                    OtherClient.socket.write(packet.build(["NETLOGOUT", username]));
                }
            });

            var query = "UPDATE webrpg.users SET online_status = 0, current_client = null WHERE username = ? AND online_status = 1 LIMIT 1";
            var values = [username];
            connection.query(query, values, function (error, result) {
                client.loggedin = 1;
            });
        }

        //With send logout packet to other clients
        function endeath(enemy) {
            console.log("endeath event: " + enemy);
            for (var i = 0; i < enemies.length; i++) {
                if (enemies[i][0] == enemy) {
                    enemies[i][3] = 0;
                    break;
                }
            }
            maps["zone1"].clients.forEach(function (OtherClient) {
                OtherClient.socket.write(packet.build(["ENDEATH", enemy]));
            });

            var query = "UPDATE webrpg.zone1 SET alive_status = 0 WHERE enemy_id = ? AND alive_status = 1 LIMIT 1";
            var values = [enemy];
            connection.query(query, values, function (error, result) {
            });
        }

//Interpret commands for client
        switch (header.command.toUpperCase()) {
            case "LOGIN":
                var data = PacketModels.login.parse(datapacket);
                login(data.username, data.password);
                break;
            case "REGISTER":
                var data = PacketModels.register.parse(datapacket);
                register(data.username, data.password);
                break;
            case "POS":
                var data = PacketModels.pos.parse(datapacket);
                pos(data.username, data.target_x, data.target_y);
                break;
            case "POP":
                var data = PacketModels.pop.parse(datapacket);
                pop(data.username, data.net_user, data.current_room, data.target_x, data.target_y);
                break;
            case "MOVENEMY":
                movenemy();
                break;
            case "UPDENEMY":
                var data = PacketModels.updenemy.parse(datapacket);
                updenemy(data.enemy_name, data.current_x, data.current_y);
                break;
            case "PLATK":
                var data = PacketModels.platk.parse(datapacket);
                platk(data.username, data.attack, data.current_x, data.current_y, data.target_x, data.target_y);
                break;
            case "ENATK":
                var data = PacketModels.enatk.parse(datapacket);
                enatk(data.enemy, data.attack, data.current_x, data.current_y, data.target_x, data.target_y);
                break;
            case "ENHEALTH":
                var data = PacketModels.enhealth.parse(datapacket);
                enhealth(data.enemy, data.health);
                break;
            case "PLHEALTH":
                var data = PacketModels.plhealth.parse(datapacket);
                plhealth(data.username, data.health);
                break;
            case "LOGOUT":
                var data = PacketModels.logout.parse(datapacket);
                logout(data.username);
                break;
            case "ENDEATH":
                var data = PacketModels.endeath.parse(datapacket);
                endeath(data.enemy);
                break;
        }
    }
}

//TODO store mob and player positions IN MEMORY, only save to database on logout

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}