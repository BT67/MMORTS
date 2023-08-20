const {data} = require("./client");
const q = require('q');
const {Client} = require("pg");
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
            var extractedPacket = Buffer.alloc(packetSize);
            data.copy(extractedPacket, 0, idx, idx + packetSize);
            console.log(timeNow() + config.msg_packet_size + packetSize);
            console.log(timeNow() + config.msg_packet_data + extractedPacket);
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
            const connection = new Client({
                host: '127.0.0.1',
                port: '5432',
                user: 'postgres',
                password: 'root',
                database: 'postgres'
            });
            connection.connect((error) => {
                if (error) {
                    client.socket.write(packet.build(["LOGIN", "FALSE", config.err_msg_db]));
                    console.log(timeNow() + config.err_msg_db);
                    console.log(error.stack);
                }
            });
            query = "UPDATE public.users SET online_status = 1, current_client = ? WHERE username = ? AND password = ? AND online_status = 0 AND current_client is null LIMIT 1";
            values = [client.id, username, password];
            connection.query(query, values, function (error) {
                if (error) {
                    console.log(timeNow() + config.err_msg_login_auth);
                    console.log(error.stack);
                }
                console.log(timeNow() + config.msg_login_success);
            });
            var current_room;
            var pos_x;
            var pos_y;
            var health;
            var sprite;

            function getLastRecord(username, next) {
                query = "SELECT * FROM public.users WHERE username = ? AND password = ? AND online_status = 0 LIMIT 1";
                values = [username, password];
                connection.query(query, values, function (error, result) {
                    if (error || (result.length < 1)) {
                        client.socket.write(packet.build(["LOGIN", "FALSE", config.err_msg_login_auth]));
                        console.log(timeNow() + config.err_msg_login_auth);
                        console.log(error.stack);
                    } else {
                        next(null, rows);
                    }
                });
            }

            getLastRecord(username, function (error, data) {
                if (error) {
                } else {
                    console.log(timeNow() + data);
                    client.username = username;
                    current_room = data[0].current_room;
                    pos_x = parseInt(data[0].pos_x);
                    pos_y = parseInt(data[0].pos_y);
                    health = parseInt(data[0].health);
                    sprite = data[0].sprite;
                }
            });
            client.socket.write(packet.build([
                "LOGIN", "TRUE", username, current_room, pos_x, pos_y, health, sprite
            ]));
            //Send spawn player packet to other clients in the room who are online
            maps[current_room].clients.push(client);
            maps[current_room].clients.forEach(function (otherClient) {
                if (otherClient.id !== client.id) {
                    otherClient.socket.write(packet.build([
                        "SPAWN", username, "player", pos_x, pos_y, health, sprite
                    ]));
                }
            });
            //Get list of current entities in the room with their positions, and send to player:
            maps[current_room].entities.forEach(function (entity) {
                if (entity.name !== username) {
                    client.socket.write(packet.build([
                        "SPAWN", entity.name, entity.type, entity.pos_x, entity.pos_y, entity.health, entity.sprite
                    ]));
                }
            });
        }

        function register(email, username, password) {
            //Check email, username and password format:
            if (email.length > config.email_length || email.length === 0) {
                client.socket.write(packet.build([
                    "REGISTER", "FALSE", config.err_msg_register_invalid_email
                ]));
                console.log(timeNow() + config.err_msg_register_invalid_email);
                return;
            }
            if (username.length > config.username_length || username.length === 0) {
                client.socket.write(packet.build([
                    "REGISTER", "FALSE", config.err_msg_register_invalid_username
                ]));
                console.log(timeNow() + config.err_msg_register_invalid_username);
                return;
            }
            if (password.length > config.password_length || password.length === 0) {
                client.socket.write(packet.build([
                    "REGISTER", "FALSE", config.err_msg_register_invalid_password
                ]));
                console.log(timeNow() + config.err_msg_register_invalid_password);
                return;
            }
            const connection = new Client({
                host: '127.0.0.1',
                port: '5432',
                user: 'postgres',
                password: 'root',
                database: 'postgres'
            });
            connection.connect((error) => {
                if (error) {
                    client.socket.write(packet.build([
                        "REGISTER", "FALSE", config.err_msg_register_database
                    ]));
                    console.log(timeNow() + config.err_msg_register_database);
                    console.log(error.stack);
                }
            });
            //If username is not taken, register the user:
            var start_room = config.start_room;
            var start_x = config.start_x;
            var start_y = config.start_y;
            query = "INSERT INTO public.users" +
                "(email, username, password, current_room, pos_x, pos_y, online_status, current_client) " +
                "VALUES ('" + email + "', '" + username + "', '" + password + "', '" + start_room + "', " +
                start_x + ", " + start_y + ", false, null);";
            //TODO fix all sql query methods
            console.log(timeNow() + query);
            connection.query(query, function (error) {
                if (error) {
                    client.socket.write(packet.build([
                        "REGISTER", "FALSE", config.err_msg_register
                    ]));
                    console.log(timeNow() + config.err_msg_register);
                    console.log(error.stack)
                } else {
                    client.socket.write(packet.build([
                        "REGISTER", "TRUE", config.msg_register_success
                    ]));
                    console.log(timeNow() + config.msg_register_success);
                }
            });
        }

        function entity(entity_name, entity_type, target_x, target_y, health, sprite) {
            maps.forEach(function (map) {
                map.clients.forEach(function (otherClient) {
                    otherClient.socket.write(packet.build([
                        "ENTITY", name, target_x.toString(), target_y.toString(), health, sprite
                    ]));
                });
            });
        }

        //Send entity attacks to other clients
        function attack(attack_name, attack_type, target_entity, origin_entity, damage, sprite) {
            maps[current_room].clients.forEach(function (OtherClient) {
                OtherClient.socket.write(packet.build([
                    "ATTACK", attack_name, attack_type, target_entity, origin_entity, damage, sprite
                ]));
            });
        }

        //TODO console log for login/logout should show username and clientId
        function logout(username) {
            query = "UPDATE public.users SET online_status = 0, current_client = null WHERE username = ? AND online_status = 1 LIMIT 1";
            values = [username];
            const connection = new Client({
                host: '127.0.0.1',
                port: '5432',
                user: 'postgres',
                password: 'root',
                database: 'postgres'
            });
            connection.connect((error) => {
                if (error) {
                    client.socket.write(packet.build([
                        "LOGOUT", "FALSE", config.err_msg_db
                    ]));
                    console.log(timeNow() + config.err_msg_db);
                    console.log(error.stack);
                }
            });
            connection.query(query, values, function (error) {
                if (error) {
                    console.log(timeNow() + config.err_msg_logout)
                    console.log(error.stack);
                }
                console.log(timeNow() + config.msg_logout_success);
            });
            // maps[current_room].clients.forEach(function (OtherClient) {
            //     if (OtherClient.user.toString() !== username.toString()) {
            //         OtherClient.socket.write(packet.build(["DESTROY", username]));
            //     }
            // });
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
                register(data.email, data.username, data.password);
                break;
            case "ENTITY":
                data = PacketModels.entity.parse(datapacket);
                entity(data.entity_name, data.entity_type, data.target_x, data.target_y, data.health, data.sprite);
                break;
            case "ATTACK":
                data = PacketModels.attack.parse(datapacket);
                attack(data.attack_name, data.attack_type, data.target_entity, data.origin_entity, data.damage, data.sprite);
                break;
            case "LOGOUT":
                data = PacketModels.logout.parse(datapacket);
                logout(data.username);
                break;
        }

        //TODO store mob and player positions IN MEMORY in jsons, only save to database on logout/server downtime
    }
}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}

//TODO add unique key to user table