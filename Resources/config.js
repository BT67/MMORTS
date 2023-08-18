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
    starting_zone: "zone1"
};

//Environment Specific Config
var conf = {
    production: {
        ip: args.ip || "127.0.0.1",
        port: args.port || 8081,
        database: "jdbc:mysql://localhost:3306/prod"
    },

    test: {
        ip: args.ip || "127.0.0.1",
        port: args.port || 8082,
        database: "jdbc:mysql://localhost:3306/test"
    },
}

extend(false, conf.production, common_conf);
extend(false, conf.test, common_conf);

//Globalise config variable to the entire application
module.exports = config = conf[environment];

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}