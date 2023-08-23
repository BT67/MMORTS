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
connection.connect((error) => {
    if (error) {
        console.log(timeNow() + config.err_msg_db);
        console.log(error.stack);
    }
});
var zeroBuffer = Buffer.from("00", "hex");
module.exports = packet = {
    //params is an array of javascript objects to be turned into buffers to send data to gamemaker
    build: function (params, clientId) {
        if (clientId == null) {
            clientId = "unknown";
        }
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
                console.log(timeNow() + config.err_msg_packet_data_unknown + typeof (param) + " " + param);
            }
            packetSize += buffer.length;
            packetParts.push(buffer);
        });
        var dataBuffer = Buffer.concat(packetParts, packetSize);
        var size = Buffer.alloc(1);
        size.writeUInt8(dataBuffer.length + 1, 0);
        console.log(timeNow() + config.msg_server_packet + clientId.toString() + "," + dataBuffer.toString());
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
            function setLogin(username, password) {
                query = "UPDATE public.users SET online_status = true, current_client = " + client.id +
                    " WHERE username = '" + username + "' AND password = '" + password + "' AND online_status = false" +
                    " AND current_client is null;";
                console.log(timeNow() + query);
                try {
                    connection.query(query);
                } catch (error) {
                    console.log(timeNow() + config.err_msg_login + client.id);
                    console.log(error.stack);
                }
            }

            async function loginQuery(username, password) {
                var data;
                query = "SELECT * FROM public.users WHERE username = '" +
                    username + "' AND password = '" + password + "' AND online_status = false LIMIT 1;";
                console.log(timeNow() + query);
                try {
                    data = await connection.query(query);
                } catch (error) {
                    console.log(error.stack);
                }
                return data;
            }

            async function processLogin(username, password) {
                data = await loginQuery(username, password);
                var current_room, pos_x, pos_y, health, sprite;
                if (data.length < 1) {
                    client.socket.write(packet.build(["LOGIN", "FALSE", config.err_msg_login_auth]));
                    console.log(timeNow() + config.err_msg_login_auth);
                    return;
                }
                client.username = username;
                try {
                    current_room = data.rows[0].current_room;
                    pos_x = parseInt(data.rows[0].pos_x);
                    pos_y = parseInt(data.rows[0].pos_y);
                    health = parseInt(data.rows[0].health);
                    sprite = data.rows[0].sprite;
                } catch (error) {
                    console.log(error.stack);
                    return;
                }
                if (
                    username == null ||
                    current_room == null ||
                    pos_x == null ||
                    pos_y == null ||
                    health == null ||
                    sprite == null
                ) {
                    console.log(timeNow() + config.err_msg_db);
                    return;
                }
                client.socket.write(packet.build([
                    "LOGIN", "TRUE", config.msg_login_success, username, current_room, pos_x.toString(), pos_y.toString(), health, sprite
                ], client.id));
                //Send spawn player packet to other clients in the room who are online
                maps[current_room].clients.push(client)
                var entity_inst = require(__dirname + "/Models/entity.js");
                var entity = new entity_inst();
                entity.name = username;
                entity.type = "player";
                entity.pos_x = pos_x;
                entity.pos_y = pos_y;
                client.pos_x = pos_x;
                client.pos_y = pos_y;
                maps[current_room].entities.push(entity);
                client.current_room = current_room;
                console.log(timeNow() + config.msg_enter_room + current_room + ", clientId=" + client.id);
                clients_str = "";
                maps[current_room].clients.forEach(function(otherClient){
                    clients_str = clients_str + otherClient.id.toString + " ";
                });
                console.log(timeNow() + config.msg_clients_in_room + current_room + ": " + clients_str);
                //TODO add spawn packet to other clients in the same room
                maps[current_room].clients.forEach(function (otherClient) {
                    if (otherClient.id !== client.id) {
                        otherClient.socket.write(packet.build([
                            "SPAWN", username, "player", pos_x, pos_y, health, sprite
                        ], otherClient.id));
                    }
                });
                //TODO send all spawn data in a single packet to the client
                function spawnEntities(client) {
                    params = [];
                    params.push("SPAWN");
                    for(var i = 0; i < maps[current_room].entities.length; i++) {
                        console.log("entity_name: " + maps[current_room].entities[i].name);
                        console.log("username: " + client.username);
                        if (maps[current_room].entities[i].name !== client.username) {
                            console.log("here");
                            params.push(maps[current_room].entities[i].name);
                            params.push(maps[current_room].entities[i].type);
                            params.push(maps[current_room].entities[i].pos_x.toString());
                            params.push(maps[current_room].entities[i].pos_y.toString());
                            params.push(maps[current_room].entities[i].health);
                            params.push(maps[current_room].entities[i].sprite);
                        }
                    }
                    params.push("end");
                    console.log(params.toString());
                    client.socket.write(packet.build(params, client.id));
                }

                spawnEntities(client);

            }
            try {
                processLogin(username, password);
                setLogin(username, password);
                //TODO login success message appears in log even when client does not acknowledge login
                console.log(timeNow() + config.msg_login_success + ", clientId=" + client.id);
            } catch (error) {
                console.log(error.stack);
            }
        }

        function register(email, username, password) {
            //Check email, username and password format:
            if (email.length > config.email_length || email.length === 0) {
                client.socket.write(packet.build([
                    "REGISTER", "FALSE", config.err_msg_register_invalid_email
                ], client.id));
                console.log(timeNow() + config.err_msg_register_invalid_email);
                return;
            }
            if (username.length > config.username_length || username.length === 0) {
                client.socket.write(packet.build([
                    "REGISTER", "FALSE", config.err_msg_register_invalid_username
                ], client.id));
                console.log(timeNow() + config.err_msg_register_invalid_username);
                return;
            }
            if (password.length > config.password_length || password.length === 0) {
                client.socket.write(packet.build([
                    "REGISTER", "FALSE", config.err_msg_register_invalid_password
                ], client.id));
                console.log(timeNow() + config.err_msg_register_invalid_password);
                return;
            }
            //If username is not taken, register the user:
            var start_room = config.start_room;
            var start_x = config.start_x;
            var start_y = config.start_y;
            query = "INSERT INTO public.users" +
                "(email, username, password, current_room, pos_x, pos_y, online_status, current_client) " +
                "VALUES ('" + email + "', '" + username + "', '" + password + "', '" + start_room + "', " +
                start_x + ", " + start_y + ", false, null);";
            console.log(timeNow() + query);
            connection.query(query, function (error) {
                if (error) {
                    client.socket.write(packet.build([
                        "REGISTER", "FALSE", config.err_msg_register
                    ], client.id));
                    console.log(timeNow() + config.err_msg_register);
                    console.log(error.stack)
                } else {
                    client.socket.write(packet.build([
                        "REGISTER", "TRUE", config.msg_register_success
                    ], client.id));
                    console.log(timeNow() + config.msg_register_success);
                }
            });
        }

        //TODO redo entity function to use entity_name instead of client.username
        function entity(target_x, target_y) {
            client.pos_x = target_x;
            client.pos_y = target_y;
            maps[client.current_room].clients.forEach(function (client) {
                client.socket.write(packet.build([
                    "ENTITY", client.username, target_x.toString(), target_y.toString(), "100", "sprite"
                ], client.id));
            });
        }

        //Send entity attacks to other clients
        function attack(attack_name, attack_type, target_entity, origin_entity, damage, sprite) {
            // maps[origin_entity.current_room].clients.forEach(function (otherClient) {
            //     otherClient.socket.write(packet.build([
            //         "ATTACK", attack_name, attack_type, target_entity, origin_entity, damage, sprite
            //     ], otherClient.id));
            // });
        }

        function chat(message) {
            async function getClients() {
                query = "SELECT current_room FROM public.users WHERE current_client = " + client.id + ");";
                console.log(timeNow() + query);
                try {
                    connection.query(query);
                } catch (error) {
                    console.log(error.stack);
                }
            }

            async function sendMessage(message) {
                var current_room = await getClients();
                maps[current_room].clients.forEach(function (client) {
                    client.socket.write(packet.build([
                        "CHAT", client.username, message
                    ], client.id));
                });
            }

            sendMessage(message);
        }

        function logout(clientId) {
            query = "UPDATE public.users SET online_status = false, current_client = null, " +
                "pos_x = " + client.pos_x + ", pos_y = " + client.pos_y +
                " WHERE current_client = '" + clientId.toString() + "' AND online_status = true";
            console.log(timeNow() + query);
            try {
                connection.query(query);
                console.log(timeNow() + config.msg_logout_success + client.id);
            } catch (error) {
                console.log(timeNow() + config.err_msg_logout_database + client.id)
                console.log(error.stack);
                return;
            }
            delete maps[client.current_room].clients.client;
            delete maps[client.current_room].entities[client.username];
            maps[client.current_room].clients.forEach(function (OtherClient) {
                if (OtherClient.username !== client.username) {
                    OtherClient.socket.write(packet.build(["DESTROY", client.username]));
                }
            });
            client.current_room = null;
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
                entity(data.target_x, data.target_y);
                break;
            case "ATTACK":
                data = PacketModels.attack.parse(datapacket);
                attack(data.attack_name, data.attack_type, data.target_entity, data.origin_entity, data.damage, data.sprite);
                break;
            case "LOGOUT":
                data = PacketModels.logout.parse(datapacket);
                logout(client.id);
                break;
            case "CHAT":
                data = PacketModels.chat.parse(datapacket);
                chat(message);
        }

        //TODO store mob and player positions IN MEMORY in jsons, only save to database on logout/server downtime
    }
}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}