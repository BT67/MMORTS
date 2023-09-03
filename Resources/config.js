//Import req. libraries
//Remove first 2 args from the arg list
var args = require('minimist')(process.argv.slice(2));
var extend = require('extend');

//Store env variable
var environment = args.env || "test";
//Output env variable
console.log(timeNow() + "Server started");
console.log(timeNow() + "Loaded environment: " + environment);
//Common config
//Use version to ensure that client requires a specific version in order to play the game
//This helps to avoid exploits and bugs
var common_conf = {
    name: "server",
    version: "0.0.1",
    environment: environment,
    max_players: 16,
    data_paths: {
        items: __dirname + "\\Game Data\\" + "Items\\",
        maps: __dirname + "\\Game Data\\" + "Maps\\",
    },
    attack_step: 1000,
    start_room: "zone1",
    start_x: 0,
    start_y: 0,
    step: 500,
    err_msg_client_error: "Error: Unexpected client error, clientId=",
    err_msg_db: "Error: Database connection lost",
    err_msg_login: "Error: Unable to login",
    err_msg_register: "Error: Unable to register new user",
    err_msg_login_auth: "Error: Unable to login - username or password is invalid",
    err_msg_register_user_exists: "Error: Unable to register new user - username is already taken",
    err_msg_register_invalid_email: "Error: Unable to register new user - email address is invalid",
    err_msg_register_invalid_username: "Error: Unable to register new user - username is invalid",
    err_msg_register_invalid_password: "Error: Unable to register new user - password is invalid",
    err_msg_register_database: "Error: Unable to register new user - database connection lost",
    msg_server_packet: "Sending packet to clientId=",
    msg_packet_data: "Packet data=",
    msg_packet_size: "Packet size=",
    msg_client_disconnect: "Client disconnected, clientId=",
    msg_logout_success: "Successfully logged out",
    msg_enter_room: "Player entered room=",
    msg_clients_in_room: "Clients in room=",
    msg_client_enter_room: "Client entering room=",
    err_msg_client_enter_room: "Error: Problem moving client into room=",
    msg_client_connected: "Client connected, clientId=",
    msg_server_init: "Server initialisation completed, server host=",
    msg_server_db: "Server database=",
    msg_client_data: "Data from ClientId=",
    err_msg_logout_database: "Error: Unable to logout - database connection lost",
    msg_login_success: "Successfully logged in",
    msg_register_success: "Successfully registered new user",
    err_msg_packet_data_unknown: "Error: Unknown data type encountered in packet builder=",
    email_length: 100,
    username_length: 30,
    password_length: 30
};

//Environment Specific Config
var conf = {
    production: {
        ip: args.ip || "127.0.0.1",
        port: args.port || 8081,
        database: "jdbc:postgresql://127.0.0.1:5432/postgres"
    },
    test: {
        ip: args.ip || "127.0.0.1",
        port: args.port || 8082,
        database: "jdbc:postgresql://127.0.0.1:5432/postgres"
    }
}

extend(false, conf.production, common_conf);
extend(false, conf.test, common_conf);

//Globalise config variable to the entire application
module.exports = config = conf[environment];

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}