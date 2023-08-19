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
    start_room: "zone1",
    start_x: 0,
    start_y: 0,
    err_msg_client_error: "Error: Unexpected client error, clientId=",
    err_msg_db: "Error: Database connection lost",
    err_msg_login: "Error: Unable to login",
    err_msg_register: "Error: Unable to register new user",
    err_msg_login_auth: "Error: Unable to login - username or password is invalid",
    err_msg_register_user_exists: "Error: Unable to register new user - username is already taken",
    err_msg_register_invalid_username: "Error: Unable to register new user - username is invalid",
    err_msg_register_invalid_password: "Error: Unable to register new user - password is invalid",
    err_msg_register_database: "Error: Unable to register new user - database connection lost",
    msg_client_disconnect: "Client disconnected, clientId=",
    msg_logout_success: "Successfully logged out",
    err_msg_logout_database: "Error: Unable to logout - database connection lost",
    msg_login_success: "Successfully logged in",
    msg_register_success: "Successfully registered new user",
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