const {Client} = require("pg");
const nodemailer = require('nodemailer');
const generator = require('generate-password');
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
    defaultMeta: {service: 'user-service'},
    transports: [new winston.transports.File({filename: 'chat.log'})],
});

module.exports = packet = {
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
                query = "UPDATE public.rts_users SET online_status = true, current_client = " + client.id +
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
                query = "SELECT * FROM public.rts_users WHERE username = '" +
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
                if (data.length < 1) {
                    client.socket.write(packet.build(["LOGIN", "FALSE", config.err_msg_login_auth]));
                    console.log(timeNow() + config.err_msg_login_auth);
                    return;
                }
                client.socket.write(packet.build([
                    "LOGIN",
                    "TRUE",
                    config.msg_login_success,
                    username
                ], client.id));
            }

            try {
                processLogin(username, password);
                setLogin(username, password);
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
            query = "INSERT INTO public.rts_users" +
                "(email, username, password, current_room, online_status, current_client) " +
                "VALUES ('" + email + "', '" + username + "', '" + password + "', null, false, null);";
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
                if (otherClient.username === client.username) {
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
        function attack(attacking_entity, target_entity) {
            maps[client.current_room].entities.every(function (entity) {
                if (entity.name === attacking_entity) {
                    entity.target_entity = target_entity;
                    return false;
                }
                return true;
            })
        }

        function chat(message) {
            if (message.length > config.chat_max_length) {
                message = message.substring(0, 36);
            }
            var chat_log_json = {
                "time": timeNow(),
                "user": client.username,
                "message": message
            }
            message = client.username + ": " + message;
            chat_logger.info(chat_log_json);
            maps[client.current_room].clients.forEach(function (otherClient) {
                client.socket.write(packet.build([
                    "CHAT", message
                ], otherClient.id));
            });
        }

        function logout(clientId) {
            query = "UPDATE public.rts_users SET online_status = false, current_client = null, WHERE current_client = '" + clientId.toString() + "' AND online_status = true";
            console.log(timeNow() + query);
            try {
                connection.query(query);
                console.log(timeNow() + config.msg_logout_success + client.id);
            } catch (error) {
                console.log(timeNow() + config.err_msg_logout_database + client.id)
                console.log(error.stack);
                return;
            }
            try {
                maps[client.current_room].clients = maps[client.current_room].clients.filter(item => item !== client);
                maps[client.current_room].clients.forEach(function (OtherClient) {
                    if (OtherClient.username !== client.username) {
                        OtherClient.socket.write(packet.build(["DESTROY", client.username]));
                    }
                });
            } catch (error) {
                console.log(timeNow() + config.err_msg_leaving_room + client.current_room);
                console.log(error.stack);
            }
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
            case "POS":
                data = PacketModels.entity.parse(datapacket);
                pos(data.target_x, data.target_y);
                break;
            case "ATTACK":
                data = PacketModels.attack.parse(datapacket);
                attack(data.attacking_entity, data.target_entity);
                break;
            case "LOGOUT":
                logout(client.id);
                break;
            case "CHAT":
                data = PacketModels.chat.parse(datapacket);
                chat(data.message);
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

function password_reset(client, email) {

    password = generate_password();

    query = "UPDATE public.rts_users SET password = '" + password + "' WHERE email = '" + email + "';";
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
            user: 'user@example.com',
            pass: '********'
        }
    });

    var mailOptions = {
        from: 'user@example.com',
        to: email,
        subject: 'PASSWORD RESET EMAIL',
        text: password
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(timeNow() + 'Email sent: ' + info.response);
        }
    });
}

function generate_password() {
    return generator.generate({
        length: 16,
        numbers: true
    });
}