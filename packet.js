const {data} = require("./client");
const q = require('q');
const {Client} = require("pg");
const nodemailer = require('nodemailer');
const generator = require('generate-password');
const {generate} = require("generate-password");
const winston = require('winston');
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

const chat_logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [new winston.transports.File({ filename: 'chat.log' })],
});

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
                    client.pos_x = pos_x;
                    client.pos_y = pos_y;
                    client.target_x = client.pos_x;
                    client.target_y = client.pos_y;
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
                try {
                    maps[current_room].clients.push(client);
                } catch(error){
                    client.socket.write(packet.build(["LOGIN", "FALSE", config.err_msg_unable_to_login]));
                    console.log(config.err_msg_client_enter_room + current_room);
                    return;
                }
                client.socket.write(packet.build([
                    "LOGIN", "TRUE", config.msg_login_success, username, current_room, pos_x.toString(), pos_y.toString(), health, sprite
                ], client.id));
                //Send spawn player packet to other clients in the room who are online
                client.current_room = current_room;
                console.log(timeNow() + config.msg_enter_room + current_room + ", clientId=" + client.id);
                clients_str = "";
                maps[current_room].clients.forEach(function (otherClient) {
                    clients_str = clients_str + otherClient.id.toString + " ";
                });
                console.log(timeNow() + config.msg_clients_in_room + current_room + ": " + clients_str);
                maps[current_room].clients.forEach(function (otherClient) {
                    if (otherClient.id !== client.id) {
                        otherClient.socket.write(packet.build([
                            "SPAWN", username, "player", pos_x, pos_y, health, sprite
                        ], otherClient.id));
                    }
                });
                function spawnWalls(client){
                    maps[current_room].walls.forEach(function(wall){
                        params = [];
                        params.push("WALL");
                        params.push(wall.type);
                        params.push(wall.pos_x.toString());
                        params.push(wall.pos_y.toString());
                        client.socket.write(packet.build(params, client.id));
                    });
                }

                function spawnDoors(client){
                    maps[current_room].doors.forEach(function(door){
                        params = [];
                        params.push("DOOR");
                        params.push(door.type);
                        params.push(door.pos_x.toString());
                        params.push(door.pos_y.toString());
                        client.socket.write(packet.build(params, client.id));
                    });
                }

                function spawnEntities(client) {
                    maps[current_room].entities.forEach(function (entity) {
                        if (entity.alive) {
                            params = [];
                            params.push("SPAWN");
                            params.push(entity.name);
                            params.push(entity.type);
                            params.push(entity.pos_x.toString());
                            params.push(entity.pos_y.toString());
                            params.push(entity.health);
                            client.socket.write(packet.build(params, client.id));
                        }
                    });
                }

                function spawnClients(client) {
                    maps[current_room].clients.forEach(function (otherClient) {
                        if(otherClient.username !== client.username) {
                            params = [];
                            params.push("SPAWN");
                            params.push(otherClient.username);
                            params.push("player");
                            params.push(otherClient.pos_x.toString());
                            params.push(otherClient.pos_y.toString());
                            params.push(otherClient.health);
                            client.socket.write(packet.build(params, client.id));
                        }
                    });
                }
                spawnWalls(client);
                spawnDoors(client);
                spawnEntities(client);
                spawnClients(client);
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

        function pos(target_x, target_y) {
            maps[client.current_room].clients.forEach(function (otherClient) {
                if(otherClient.username === client.username){
                    target_x = parseInt((target_x / 32) - 1);
                    target_y = parseInt((target_y / 32) - 1);
                    otherClient.target_entity = null;
                    otherClient.target_x = target_x;
                    otherClient.target_y = target_y;
                }
            });
        }

        function checkAttack(target_entity) {
            return client.target_entity === target_entity;
        }

        //Send entity attacks to other clients
        function attack(target_entity) {
            client.target_x = client.pos_x;
            client.target_y = client.pos_y;
            client.target_entity = target_entity;
        }

        function chat(message) {
            if(message.length > config.chat_max_length){
                message = message.substring(0,36);
            }
            var chat_log_json = {
                "time": timeNow(),
                "user": client.username,
                "message": message
            }
            message = client.username + ": " + message;
            chat_logger.info(chat_log_json);
            maps[client.current_room].clients.forEach(function (otherclient) {
                client.socket.write(packet.build([
                    "CHAT", message
                ], otherclient.id));
            });
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
            //TODO server crashes on line 325 when exiting room
            maps[client.current_room].clients = maps[client.current_room].clients.filter(item => item !== client);
            maps[client.current_room].clients.forEach(function (OtherClient) {
                if (OtherClient.username !== client.username) {
                    OtherClient.socket.write(packet.build(["DESTROY", client.username]));
                }
            });
            client.current_room = null;
        }

        function room(room) {
            query = "UPDATE public.users SET current_room = '" + room + "' WHERE current_client = " + client.id + ";";
            console.log(timeNow() + query);
            try {
                connection.query(query);
                console.log(timeNow() + config.msg_client_enter_room + room + ", clientId=" + client.id);
            } catch (error) {
                console.log(timeNow() + config.err_msg_client_enter_room + room + ", clientId=" + client.id);
                console.log(error.stack);
                return;
            }
            delete maps[client.current_room].clients.client;
            client.current_room = room;
            maps[room].clients.push(client);
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
            case "POS":
                data = PacketModels.entity.parse(datapacket);
                pos(data.target_x, data.target_y);
                break;
            case "ATTACK":
                data = PacketModels.attack.parse(datapacket);
                if (!checkAttack(data.target_entity)) {
                    attack(data.target_entity);
                }
                break;
            case "LOGOUT":
                logout(client.id);
                break;
            case "CHAT":
                data = PacketModels.chat.parse(datapacket);
                chat(data.message);
                break;
            case "ROOM":
                data = PacketModels.room.parse(datapacket);
                room(data.room);
                break;
            case "RESETPASSWORD":
                data = PacketModels.resetpassword.parse(datapacket);
                password_reset(client, data.email);
                break;
        }
    }
}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}

function password_reset(client, email){

    password = generate_password();

    query = "UPDATE public.users SET password = '" + password + "' WHERE email = '" + email + "';";
    console.log(timeNow() + query);
    try {
        connection.query(query);
    } catch (error) {
        console.log(timeNow() + config.err_msg_password_reset_error + client.id);
        console.log(error.stack);
        return;
    }

    var transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: 'passwordreset1905@outlook.com',
            pass: 'kpy333Xseries10'
        }
    });

    var mailOptions = {
        from: 'passwordreset1905@outlook.com',
        to: email,
        subject: 'PASSWORD RESET EMAIL',
        text: password
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log(timeNow() + 'Email sent: ' + info.response);
        }
    });
}

function generate_password(){
    return generator.generate({
        length: 16,
        numbers: true
    });
}

function generateDungeon(dungeon_size, dungeon_difficulty) {
    var room_min_width = 0;
    var room_max_width = 0;
    var room_min_height = 0;
    var room_max_height = 0;
    var connection_min_width = 0;
    var connection_max_width = 0;
    var connection_min_height = 0;
    var connection_max_height = 0;
    var new_map_width = 0;
    var new_map_height = 0;
    var num_rooms = 0;
    switch (dungeon_size) {
        case "SMALL":
            num_rooms = 8;
            new_map_width = 80;
            new_map_height = 40;
            room_min_width = 5;
            room_max_width = 15;
            room_min_height = 5;
            room_max_height = 15;
            connection_min_width = 3;
            connection_max_width = 3;
            connection_min_height = 3;
            connection_max_height = 3;
            break;
        case "MEDIUM":
            num_rooms = 16;
            new_map_width = 100;
            new_map_height = 50;
            room_min_width = 5;
            room_max_width = 15;
            room_min_height = 5;
            room_max_height = 15;
            connection_min_width = 3;
            connection_max_width = 3;
            connection_min_height = 3;
            connection_max_height = 3;
            break;
        case "LARGE":
            num_rooms = 30;
            new_map_width = 120;
            new_map_height = 60;
            room_min_width = 5;
            room_max_width = 15;
            room_min_height = 5;
            room_max_height = 15;
            connection_min_width = 3;
            connection_max_width = 3;
            connection_min_height = 3;
            connection_max_height = 3;
            break;
        case "HUGE":
            num_rooms = 8;
            new_map_width = 80;
            new_map_height = 40;
            room_min_width = 8;
            room_max_width = 15;
            room_min_height = 8;
            room_max_height = 15;
            connection_min_width = 3;
            connection_max_width = 3;
            connection_min_height = 3;
            connection_max_height = 3;
            break;
    }
    //Init new map object:
    var new_map = {
        name: "new_map",
        room: "new_map",
        start_x: 0,
        start_y: 0,
        clients: [],
        entities: [],
        doors: [],
        walls: [],
        grid: [],
        rooms: [],
        connections: [],
        grid_width: new_map_width,
        grid_height: new_map_height,
        ascii_grid: []
    }
    //Init room grid:
    new_map.grid = initMapGrid(new_map);
    new_map.ascii_grid = initMapGrid(new_map);
    var num_connections = [];
    //Init origin points for each room
    //origin_x, origin_y for room refers to the top-left floor tile of the room
    var i = 0;
    var tries = 0;
    while (i < num_rooms) {
        var new_room_origin_x = 0;
        var new_room_origin_y = 0;
        var new_room_width = randomInt(room_min_width, room_max_width + 1);
        var new_room_height = randomInt(room_min_height, room_max_height + 1);
        if (new_map.rooms.length < 1) {
            var start = Math.random();
            if (0 < start <= 0.25) {
                new_room_origin_x = 1;
                new_room_origin_y = 1;
            } else if (0.25 < start <= 0.5) {
                new_room_origin_x = new_map_width - 1 - new_room_width;
                new_room_origin_y = 2;
            } else if (0.5 < start <= 0.75) {
                new_room_origin_x = 2;
                new_room_origin_y = new_map_height - 1 - new_room_height;
            } else if (0.75 < start <= 1) {
                new_room_origin_x = new_map_width - 1 - new_room_width;
                new_room_origin_y = new_map_height - 1 - new_room_height;
            }
        } else {
            var connection_origin_x = 0;
            var connection_origin_y = 0;
            var connection_width = 0;
            var connection_height = 0;
            var prev_room_origin_x = new_map.rooms[new_map.rooms.length - 1].origin_x;
            var prev_room_origin_y = new_map.rooms[new_map.rooms.length - 1].origin_y;
            var prev_room_width = new_map.rooms[new_map.rooms.length - 1].width;
            var prev_room_height = new_map.rooms[new_map.rooms.length - 1].height;
            if (Math.random() > 0.5) {
                if (prev_room_origin_y < new_map.grid_height / 2) {
                    //Create new_room below prev_room
                    new_room_origin_x = randomInt(prev_room_origin_x + room_min_width - new_room_width,
                        prev_room_origin_x + prev_room_width - room_min_width);
                    new_room_origin_y = randomInt(prev_room_origin_y + prev_room_height + 2, new_map.grid_height - 1);
                    connection_origin_y = prev_room_origin_y;
                    connection_height = Math.abs(new_room_origin_y + new_room_height - prev_room_origin_y);
                } else {
                    //Create new_room above prev_room
                    new_room_origin_x = randomInt(prev_room_origin_x + room_min_width - new_room_width,
                        prev_room_origin_x + prev_room_width - room_min_width);
                    new_room_origin_y = randomInt(2, prev_room_origin_y - 1 - room_min_height);
                    connection_origin_y = new_room_origin_y;
                    connection_height = Math.abs(prev_room_origin_y + prev_room_height - new_room_origin_y);
                    if (new_room_origin_y + new_room_height > prev_room_origin_y) {
                        new_room_height = prev_room_origin_y - new_room_origin_y - 2;
                    }
                }
                //Connection dimensions:
                connection_width = connection_min_width;
                if (new_room_origin_x < prev_room_origin_x) {
                    connection_origin_x = prev_room_origin_x;
                } else if (new_room_origin_x >= prev_room_origin_x) {
                    connection_origin_x = new_room_origin_x;
                }
            } else {
                //Make horizontal connection
                if (prev_room_origin_x < new_map.grid_width / 2) {
                    //Create new_room to the right of prev_room
                    new_room_origin_y = randomInt(prev_room_origin_y + room_min_height - new_room_height,
                        prev_room_origin_y + prev_room_height - room_min_height);
                    new_room_origin_x = randomInt(prev_room_origin_x + prev_room_width + 2, new_map.grid_width - 1);
                    connection_origin_x = prev_room_origin_x;
                    connection_width = Math.abs(new_room_origin_x + new_room_width - prev_room_origin_x);
                } else {
                    //Create new_room to the left of prev_room
                    new_room_origin_y = randomInt(prev_room_origin_y + room_min_height - new_room_height,
                        prev_room_origin_y + prev_room_height - room_min_height);
                    new_room_origin_x = randomInt(2, prev_room_origin_x - 2);
                    connection_origin_x = new_room_origin_x;
                    connection_width = Math.abs(prev_room_origin_x + prev_room_width - new_room_origin_x);
                    if (new_room_origin_x + new_room_width > prev_room_origin_x) {
                        new_room_width = prev_room_origin_x - new_room_origin_x - 2;
                    }
                }
                //Connection dimensions:
                connection_height = connection_min_height;
                if (new_room_origin_y < prev_room_origin_y) {
                    connection_origin_y = prev_room_origin_y;
                } else if (new_room_origin_y >= prev_room_origin_y) {
                    connection_origin_y = new_room_origin_y;
                }
            }
        }
        connection_room = {
            name: "hallway" + num_connections.toString(),
            origin_x: connection_origin_x,
            origin_y: connection_origin_y,
            width: connection_width,
            height: connection_height
        }
        new_room = {
            name: "room" + i.toString(),
            origin_x: new_room_origin_x,
            origin_y: new_room_origin_y,
            width: new_room_width,
            height: new_room_height
        };
        var valid_room = true;
        if (
            new_room_origin_x < 1 ||
            new_room_origin_x + new_room_width >= new_map.grid_width ||
            new_room_origin_y < 1 ||
            new_room_origin_y + new_room_height >= new_map.grid_height ||
            new_room_width < room_min_width ||
            new_room_height < room_min_height
        ) {
            valid_room = false;
        }
        new_map.rooms.forEach(function (room) {
            if (
                room.origin_x - 2 < new_room_origin_x &&
                new_room_origin_x <= room.origin_x + room.width + 2 &&
                room.origin_y - 2 < new_room_origin_y &&
                new_room_origin_y <= room.origin_y + room.height + 2
            ) {
                valid_room = false;
            } else if (
                new_room_origin_x - 2 < room.origin_x &&
                room.origin_x <= new_room_origin_x + new_room_width + 2 &&
                new_room_origin_y - 2 < room.origin_y &&
                room.origin_y <= new_room_origin_y + new_room_height + 2
            ) {
                valid_room = false;
            }
        });
        if (valid_room) {
            new_map.rooms.push(new_room);
            if (new_map.rooms.length > 0) {
                new_map.connections.push(connection_room);
                num_connections++;
            }
            i++;
        } else {
            tries++;
        }
        if (tries > 50) {
            i++
            tries = 0;
        }
    }
    outputASCIIgrid(new_map);
    return new_map;
}

function outputASCIIgrid(map) {
    //Write dungeon layout to ASCII
    map.rooms.forEach(function (room) {
        for (var h = 0; h < room.width; ++h) {
            if (room.origin_x + h < map.grid_width) {
                for (var v = 0; v < room.height; ++v) {
                    if (room.origin_y + v < map.grid_height) {
                        if (
                            room.origin_x + h > 0 &&
                            room.origin_x + h < map.grid_width - 1 &&
                            room.origin_y + v > 0 &&
                            room.origin_y + v < map.grid_height - 1) {
                            map.ascii_grid[room.origin_x + h][room.origin_y + v] = "_";
                        }
                    }
                }
            }
        }
    });
    map.connections.forEach(function (connection) {
        for (var h = 0; h < connection.width; ++h) {
            if (connection.origin_x + h < map.grid_width) {
                for (var v = 0; v < connection.height; ++v) {
                    if (connection.origin_y + v < map.grid_height) {
                        if (
                            connection.origin_x + h > 0 &&
                            connection.origin_x + h < map.grid_width - 1 &&
                            connection.origin_y + v > 0 &&
                            connection.origin_y + v < map.grid_height - 1) {
                            map.ascii_grid[connection.origin_x + h][connection.origin_y + v] = "_";
                        }
                    }
                }
            }
        }
    });
    //Output dungeon layout to ASCII:
    for (var i = 0; i < map.grid_height; ++i) {
        var line = "";
        for (var k = 0; k < map.grid_width; ++k) {
            line += map.ascii_grid[k][i];
        }
        console.log(line);
    }
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function initMapGrid(map) {
    var grid = [];
    for (var i = 0; i < map.grid_width; i++) {
        grid.push([])
        for (var k = 0; k < map.grid_height; k++) {
            grid[i][k] = "|";
        }
    }
    return grid;
}
