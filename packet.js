const {data} = require("./client");
const q = require('q');
const {Client} = require("pg");
const connection = new Client({
    host: '127.0.0.1',
    port: '5432',
    user: 'postgres',
    password: 'root',
    database: 'postgres'
});
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
        return Buffer.concat([size, dataBuffer], size.length + dataBuffer.length);
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
        var query;
        var values;
        var header = PacketModels.header.parse(datapacket);
        function login(username, password) {
            connection.connect((err) => {
                if (err) {
                    client.socket.write(packet.build(["DB", "FALSE"]));
                    console.log(timeNow() + conf.err_msg_db);
                    throw err;
                }
            });
            var current_room;
            var pos_x;
            var pos_y;
            function getLastRecord(username, next) {
                query = "SELECT * FROM public.users WHERE username = ? AND password = ? AND online_status = 0 LIMIT 1";
                values = [username, password];
                connection.query(query, values, function (error, result) {
                    if (error || (result.length < 1)) {
                        client.socket.write(packet.build(["LOGIN", "FALSE"]));
                        console.log(timeNow() + conf.err_msg_login);
                    } else {
                        next(null, rows);
                    }
                });
            }
            getLastRecord(username, function (err, data) {
                if (err) {
                    throw err;
                } else {
                    console.log(data);
                    client.username = username;
                    current_room = data[0].current_room;
                    pos_x = parseInt(data[0].pos_x);
                    pos_y = parseInt(data[0].pos_y);
                }
            });
            query = "UPDATE public.users SET online_status = 1, current_client = ? WHERE username = ? AND password = ? AND online_status = 0 LIMIT 1";
            values = [client.id, username, password];
            connection.query(query, values, function (error, result) {
                if (error) {
                    console.log(timeNow() + config.err_msg_login);
                    throw error;
                }
                console.log(timeNow() + config.msg_login_success);
            });
            client.socket.write(packet.build([
                "LOGIN",
                "TRUE",
                username,
                current_room,
                pos_x,
                pos_y,
                1
            ]));
            maps[current_room].clients.push(client);
            //Send spawn player packet to other clients in the room who are online
            maps[current_room].clients.forEach(function (otherClient) {
                if (otherClient.id !== client.id) {
                    otherClient.socket.write(packet.build(["SPAWN", username, pos_x, pos_y]));
                }
            });
            //Get list of current entities in the room with their positions, and send to player:
            for (let i = 0; i < maps[current_room].entities.length; i++) {
                //client.socket.write(packet.build(["SPAWN", username, pos_x, pos_y]));
            }
        }
        function register(username, password) {
            connection.connect((error) => {
                if (error) {
                    client.socket.write(packet.build(["REGISTER", "FALSE"]));
                    console.log(error);

                }
            });
            query = "SELECT * FROM public.users WHERE username = ? ";
            values = [username];
            connection.query(query, values, function (error, result) {
                if (result.length > 0) {
                    console.log(timeNow() + result);
                    client.socket.write(packet.build(["REGISTER", "FALSE"]));
                } else {
                    //If username is not taken, register the user:
                    query = "INSERT INTO public.users (username, password, current_room, pos_x, pos_y) VALUES (?,?,?,?,?)";
                    values = [username, password, config.start_room, config.start_x, config.start_y];
                    connection.query(query, values, function (error, result) {
                        if (error) {
                            //console.log('Error: Failed to register new user, error adding user to database');
                            client.socket.write(packet.build(["REGISTER", "FALSE"]));
                            //console.log("Failed register packet sent");
                            console.log(timeNow() + error);
                        } else {
                            client.socket.write(packet.build(["REGISTER", "TRUE"]));
                        }
                    });
                }
            });
            function entity(name, target_x, target_y, health) {
                maps.forEach(function (map) {
                    map.clients.forEach(function (otherClient) {
                            otherClient.socket.write(packet.build([
                                "ENTITY",
                                name,
                                target_x.toString(),
                                target_y.toString(),
                                health
                            ]));
                    });
                });
            }
            //Send entity attacks to other clients
            function attack(enemy, attack, current_x, current_y, target_x, target_y) {
                 maps["zone1"].clients.forEach(function (OtherClient) {
                    OtherClient.socket.write(packet.build(["ENATK", enemy, attack, current_x, current_y, target_x, target_y]));
                });
            }
            //Send logout packet to other clients
            function logout(username) {
                console.log("logout event: " + username);
                for (var i = 0; i < users.length; i++) {
                    if (users[i][0] === username) {
                        users[i][3] = null;
                        break;
                    }
                }
                maps["zone1"].clients.forEach(function (OtherClient) {
                    if (OtherClient.user.toString() !== username.toString()) {
                        OtherClient.socket.write(packet.build(["NETLOGOUT", username]));
                    }
                });

                query = "UPDATE public.users SET online_status = 0, current_client = null WHERE username = ? AND online_status = 1 LIMIT 1";
                values = [username];
                connection.query(query, values, function (error) {
                    if(error) {
                        console.log(time)
                        throw error;
                    }
                    client.loggedin = 1;
                });
            }

            var data;
            //Interpret commands for client
            switch (header.command.toUpperCase()) {
                case "LOGIN":
                    data = PacketModels.login.parse(datapacket);
                    login(data.username, data.password);
                    break;
                case "REGISTER":
                    data = PacketModels.register.parse(datapacket);
                    register(data.username, data.password);
                    break;
                case "ENTITY":
                    data = PacketModels.pos.parse(datapacket);
                    entity(data.username, data.target_x, data.target_y);
                    break;
                case "ATTACK":
                    data = PacketModels.platk.parse(datapacket);
                    attack(data.username, data.attack, data.current_x, data.current_y, data.target_x, data.target_y);
                    break;
                case "LOGOUT":
                    data = PacketModels.logout.parse(datapacket);
                    logout(data.username);
                    break;
                case "DEATH":
                    data = PacketModels.endeath.parse(datapacket);
                    break;
            }
        }
        //TODO store mob and player positions IN MEMORY, only save to database on logout
        //Store in jsons, not arrays
        function timeNow() {
            var timeStamp = new Date().toISOString();
            return "[" + timeStamp + "] ";
        }
    }
}