//Import libraries, file system
var fs = require("fs");
var net = require("net");
require("./packet.js");
require((__dirname + '/Resources/config.js'));
const mysql = require("mysql");

/*
1. Load the init files
2. Load game models
3. Load game map data
4. Init server and listen to the internet
 */

var timeStamp = new Date();
console.log(timeNow() + "Startup sequence initiated");

//Load init files
var init_files = fs.readdirSync(__dirname + "/Initialisers");
init_files.forEach(function (initFile) {
    console.log(timeNow() + "Loading initialiser: " + initFile);
    require(__dirname + "/Initialisers/" + initFile);
});

//Load game models
var model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(function (modelFile) {
    console.log(timeNow() + "Loading model file: " + modelFile);
    require(__dirname + "/Models/" + modelFile);
});

var clientIdNo = 0;

//Load game map data
maps = {};
var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function (mapFile) {
    console.log(timeNow() + "Loading map file: " + mapFile);
    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map;
});

//Initialise the server
net.createServer(function (socket) {
    console.log(timeNow() + "Socket Connected");
    var c_inst = new require("./client.js");
    var thisClient = new c_inst();
    thisClient.socket = socket;
    thisClient.id = clientIdNo;
    thisClient.loggedin = 0;
    clientIdNo += 1;
    thisClient.initiate();
    socket.on("error", thisClient.error);
    socket.on("end", thisClient.end);
    socket.on("data", thisClient.data);
}).listen(config.port);

console.log(timeNow() + "Server initialisation completed, server running on " + config.ip + ":" + config.port + " on environment=" + config.environment)

console.log(timeNow() + "Server using database=" + config.database);

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}






