//Import libraries, file system
var fs = require("fs");
var net = require("net");
require("./packet.js");
require((__dirname + '/Resources/config.js'));
const pg = require("pg");
const {Client} = require("pg");

/*
1. Load the init files
2. Load game models
3. Load game map data
4. Init database
5. Init server and listen to the internet
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

//Load mobs into each map:
var entity_inst = new require("./Models/entity.js");
//const {target_entity} = require("./Models/entity");
//const {target_entity} = require("./Models/entity");
var this_entity = new entity_inst();
this_entity.alive = true;
this_entity.health = 100;
this_entity.sprite = "";
this_entity.type = "mob";
this_entity.name = "mob1";
this_entity.pos_x = 150;
this_entity.pos_y = 150;
this_entity.target_x = this_entity.pos_x;
this_entity.target_y = this_entity.pos_y;
this_entity.sprite = "sprite";
maps["zone1"].entities.push(this_entity);

this_entity = new entity_inst();
this_entity.alive = true;
this_entity.health = 100;
this_entity.sprite = "";
this_entity.type = "mob";
this_entity.name = "mob2";
this_entity.pos_x = 150;
this_entity.pos_y = 210;
this_entity.target_x = this_entity.pos_x;
this_entity.target_y = this_entity.pos_y;
this_entity.sprite = "sprite";
maps["zone1"].entities.push(this_entity);

this_entity = new entity_inst();
this_entity.alive = true;
this_entity.health = 100;
this_entity.sprite = "";
this_entity.type = "mob";
this_entity.name = "mob3";
this_entity.pos_x = 300;
this_entity.pos_y = 80;
this_entity.target_x = this_entity.pos_x;
this_entity.target_y = this_entity.pos_y;
this_entity.sprite = "sprite";
maps["zone1"].entities.push(this_entity);

//Initialise the database:
var query_str = "";
const connection = new Client({
    host: '127.0.0.1',
    port: '5432',
    user: 'postgres',
    password: 'root',
    database: 'postgres'
});

console.log(timeNow() + "Initialising database...");
connection.connect();
query_str = "CREATE TABLE IF NOT EXISTS users(" +
    "username VARCHAR(30), " +
    "password VARCHAR(30), " +
    "email VARCHAR(100), " +
    "current_room VARCHAR(100), " +
    "current_client VARCHAR(30), " +
    "pos_x INTEGER, " +
    "pos_y INTEGER, " +
    "sprite VARCHAR(100), " +
    "online_status boolean);" +
    "UPDATE public.users SET online_status = false, current_client = null;";
connection.query(query_str, function (err) {
    if (err) {
        console.log(timeNow() + err);
    } else {
        console.log(timeNow() + "Users table created in database");
    }
    connection.end();
});

//Initialise the server
net.createServer(function (socket) {
    var c_inst = new require("./client.js");
    var thisClient = new c_inst();
    thisClient.socket = socket;
    thisClient.id = clientIdNo;
    thisClient.loggedin = 0;
    thisClient.username = "";
    thisClient.current_room = "";
    thisClient.pos_x = 0;
    thisClient.pos_y = 0;
    thisClient.target_x = thisClient.pos_x;
    thisClient.target_y = thisClient.pos_y;
    thisClient.target_entity = "";
    thisClient.move_speed = 1;
    thisClient.health = 100;
    clientIdNo += 1;
    //TODO create clientId allocation system
    thisClient.initiate();
    socket.on("error", thisClient.error);
    socket.on("end", thisClient.end);
    socket.on("data", thisClient.data);
}).listen(config.port);

console.log(timeNow() + config.msg_server_init + config.ip + ":" + config.port + "/" + config.environment)
console.log(timeNow() + config.msg_server_db + config.database);

updateEntities();

async function updateEntities() {

    mapList = Object.keys(maps);
    while (true) {
        mapList.forEach(function (map) {
            maps[map].entities.forEach(function (entity) {
                if(entity.in_combat){
                    dist = distance(entity.pos_x, entity.pos_y, entity.origin_x, entity.origin_y);
                    if(dist > entity.roam_range) {
                        entity.in_combat = false;
                        target_entity = "";
                        entity.target_x = entity.origin_x;
                        entity.target_y = entity.origin_y;
                    }
                }
                moveTowardsTarget(entity);
                maps[map].clients.forEach(function (client) {
                    client.socket.write(packet.build([
                        "POS", entity.name, entity.pos_x.toString(), entity.pos_y.toString(), entity.target_x.toString(), entity.target_y.toString()
                    ], client.id));
                });

                if (entity.aggressive && entity.target_x !== entity.origin_x && entity.target_y !== entity.origin_y) {
                    maps[map].clients.forEach(function (client) {
                        dist = distance(client.pos_x, client.pos_y, entity.pos_x, entity.pos_y);
                        if (dist < entity.view_range) {
                            entity.in_combat = true;
                            entity.target_entity = client.username;
                            maps[map].clients.forEach(function (client) {
                                client.socket .write(packet.build([
                                    "PURSUE", entity.name, entity.target_entity
                                ], client.id));
                            });
                        }
                    })
                }
            });
            //Update client pos
            // maps[map].clients.forEach(function (client) {
            //     moveTowardsTarget(client);
            //     maps[map].clients.forEach(function (otherClient) {
            //         otherClient.socket.write(packet.build([
            //             "POS", client.username, client.pos_x.toString(), client.pos_y.toString(), client.target_x.toString(), client.target_y.toString()
            //         ], otherClient.id));
            //     });
            // });
        });
        await new Promise(resolve => setTimeout(resolve, config.step));
    }
}

function moveTowardsTarget(entity) {

    if (entity.target_x < entity.pos_x) {
        entity.pos_x -= entity.move_speed;
    } else if (entity.target_x > entity.pos_x) {
        entity.pos_y += entity.move_speed;
    }

    if (entity.target_y < entity.pos_y) {
        entity.pos_y -= entity.move_speed;
    } else if (entity.target_y > entity.pos_y) {
        entity.pos_y += entity.move_speed;
    }

}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}

//Calculate the distance between two points
function distance(x1, y1, x2, y2) {
    return parseInt(Math.pow(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 0.5));
}





