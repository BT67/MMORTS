//Import libraries, file system
const fs = require("fs");
const net = require("net");
require("./packet.js");
require(__dirname + '/Resources/config.js');

const {Client} = require("pg");

/*
1. Load the init files
2. Load game models
3. Load game map data
4. Init database
5. Init server and listen to the internet
 */

console.log(timeNow() + "Server startup sequence initiated");

//Load init files
var init_files = fs.readdirSync(__dirname + "/Initialisers");
init_files.forEach(function (initFile) {
    console.log(timeNow() + "Loading initialiser: " + initFile);
    require(__dirname + "/Initialisers/" + initFile);
});

//Load game models
const model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(function (modelFile) {
    console.log(timeNow() + "Loading model file: " + modelFile);
    require(__dirname + "/Models/" + modelFile);
});

//Load game map data
maps = {};
clients = [];
logout_users = [];
const map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function (mapFile) {
    console.log(timeNow() + "Loading map file: " + mapFile);
    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map;
});

//Initialise the database:
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
});

var clientIdNo = 0;

//Initialise the server
net.createServer(function (socket) {
    const c_inst = new require("./client.js");
    let thisClient = new c_inst();
    var server_full = false;
    //Check existing clients and assign unique client id:
    if (clients.length > 0) {
        for (var i = 0; i < clients.length; ++i) {
            if (clients[i].id === clientIdNo) {
                server_full = true;
                clientIdNo += 1;
            } else {
                thisClient.id = clientIdNo;
                server_full = false;
                clientIdNo += 1;
            }
            if (clientIdNo > config.max_clients) {
                clientIdNo = 0;
            }
        }
    } else {
        thisClient.id = clientIdNo;
        clientIdNo += 1;
        if (clientIdNo > config.max_clients) {
            clientIdNo = 0;
        }
    }
    if (!server_full) {
        thisClient.socket = socket;
        thisClient.loggedin = 0;
        thisClient.username = "";
        thisClient.current_room = null;
        thisClient.initiate();
        clients.push(thisClient);
        socket.on("error", thisClient.error);
        socket.on("end", thisClient.end);
        socket.on("data", thisClient.data);
    }
}).listen(config.port);

console.log(timeNow() + config.msg_server_init + config.ip + ":" + config.port + "/" + config.environment)
console.log(timeNow() + config.msg_server_db + config.database);

update_step();

async function update_step() {
    mapList = Object.keys(maps);
    while (true) {
        mapList.forEach(function (map) {
            if (maps[map].clients.length > 0) {
                maps[map].entities.forEach(async function (entity) {
                    if (entity.alive) {
                        if (entity.attack_timer < entity.attack_period) {
                            entity.attack_timer += 1;
                        }
                        if (entity.target_entity === null) {
                            maps[map].entities.forEach(function (otherEntity) {
                                if (otherEntity.alive) {
                                    dist = distance(otherEntity.pos_x, otherEntity.pos_y, entity.pos_x, entity.pos_y);
                                    if (dist < entity.view_range) {
                                        entity.in_combat = true;
                                        entity.target_entity = otherEntity.name;
                                        entity.target_x = otherEntity.pos_x;
                                        entity.target_y = otherEntity.pos_y;
                                        entity.path = [];
                                    }
                                }
                            });
                        } else {
                            //If entity has a target
                            maps[map].entities.forEach(function (otherEntity) {
                                try {
                                    if (otherEntity.name === entity.target_entity) {
                                        //If target entity leaves view range, return to origin
                                        dist = distance(otherEntity.pos_x, otherEntity.pos_y, entity.pos_x, entity.pos_y);
                                        if (dist > entity.view_range) {
                                            entity.in_combat = false;
                                            entity.target_entity = null;
                                            entity.target_x = entity.pos_x;
                                            entity.target_y = entity.pos_y;
                                        } else {
                                            //Else, if target is still in view range, continue pursuit
                                            entity.target_x = otherEntity.pos_x;
                                            entity.target_y = otherEntity.pos_y;
                                            //If target is within attack range, attack the target
                                            if (dist <= entity.attack_range) {
                                                //attack the target
                                                if (entity.attack_timer >= entity.attack_period) {
                                                    maps[map].clients.forEach(function (client) {
                                                        client.socket.write(packet.build([
                                                            "ATTACK", "attack", entity.name, entity.target_entity
                                                        ], client.id));
                                                    });
                                                    otherEntity.health -= entity.attack_damage;
                                                    if (otherEntity.health <= 0) {
                                                        maps[map].grid[otherEntity.pos_x][otherEntity.pos_y] = "empty";
                                                        otherEntity.alive = false;
                                                        send_destroy_packet(otherEntity.username, map);
                                                        entity.in_combat = false;
                                                        entity.target_entity = null;
                                                        entity.target_x = entity.origin_x;
                                                        entity.target_y = entity.origin_y;
                                                    } else if (otherEntity.target_entity === null &&
                                                        otherEntity.target_x === otherEntity.pos_x &&
                                                        otherEntity.target_y === otherEntity.pos_y) {
                                                        //If target entity is not already in combat and is not currently moving,
                                                        //target the entity that just attacked them:
                                                        otherEntity.in_combat = true;
                                                        otherEntity.target_entity = entity.name;
                                                    }
                                                    entity.attack_timer = 0;
                                                }
                                            }
                                        }
                                    }
                                } catch (error) {

                                }
                            });
                        }
                        if (entity.target_x !== entity.pos_x || entity.target_y !== entity.pos_y) {
                            entity.path = createPath(map, entity.pos_x, entity.pos_y, entity.target_x, entity.target_y, entity.target_entity);
                        }
                        if (entity.path.length > 0) {
                            prev_pos_x = entity.pos_x;
                            prev_pos_y = entity.pos_y;
                            moveTowardsTarget(map, entity);
                            maps[map].clients.forEach(function (client) {
                                client.socket.write(packet.build([
                                    "POS", entity.name, prev_pos_x.toString(), prev_pos_y.toString(), entity.pos_x.toString(), entity.pos_y.toString()
                                ], client.id));
                            });
                        }
                    }
                });
            }
        })
        if (logout_users.length > 0) {
            var username = logout_users.shift();
            query = "UPDATE public.rts_users SET online_status = false, current_client = null WHERE username = '" + username + "';";
            console.log(timeNow() + query);
            try {
                await connection.query(query);
                console.log(timeNow() + config.msg_logout_success);
            } catch (error) {
                console.log(timeNow() + config.err_msg_logout_database);
                console.log(error.stack);
            }
        }
        await new Promise(resolve => setTimeout(resolve, config.step));
    }
}

function moveTowardsTarget(map, entity) {
    try {
        next_point = entity.path.shift();
        maps[map].grid[entity.pos_x][entity.pos_y] = "empty"
        entity.pos_x = next_point.x;
        entity.pos_y = next_point.y;
    } catch (error) {
        entity.path = [];
    }
    entity.pos_x = parseInt(entity.pos_x);
    entity.pos_y = parseInt(entity.pos_y);
    maps[map].grid[entity.pos_x][entity.pos_y] = entity.name;
}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}

//Calculate the distance between two points
function distance(x1, y1, x2, y2) {
    return parseInt(Math.pow(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 0.5));
}

function initMapGrid(map) {
    var grid = [];
    for (var i = 0; i < map.grid_width; i++) {
        grid.push([])
        for (var k = 0; k < map.grid_height; k++) {
            grid[i][k] = "empty";
        }
    }
    map.walls.forEach(function (wall) {
        grid[wall.pos_x][wall.pos_y] = "wall";
    });
    return grid;
}

function createPath(map, x1, y1, x2, y2) {
    if (x1 === x2 && y1 === y2) {
        return [];
    }
    var grid_copy = [];
    for (var i = 0; i < maps[map].grid.length; ++i) {
        grid_copy[i] = maps[map].grid[i].slice();
    }

    function check_point(current_point, direction, grid_copy) {
        var new_path = current_point.path.slice();
        var pos_x = current_point.x;
        var pos_y = current_point.y;
        switch (direction) {
            case "up":
                pos_y -= 1;
                break;
            case "down":
                pos_y += 1;
                break;
            case "left":
                pos_x -= 1;
                break;
            case "right":
                pos_x += 1;
                break;
            case "up-left":
                pos_x -= 1;
                pos_y -= 1;
                break;
            case "up-right":
                pos_x += 1;
                pos_y -= 1;
                break;
            case "down-left":
                pos_x -= 1;
                pos_y += 1;
                break;
            case "down-right":
                pos_x += 1;
                pos_y += 1;
                break;
        }
        var new_point = {
            x: pos_x,
            y: pos_y,
            path: new_path,
            status: "unknown"
        }
        new_path.push(new_point);
        new_point.path = new_path;
        if (new_point.x < 0 ||
            new_point.x >= maps[map].grid_width ||
            new_point.y < 0 ||
            new_point.y >= maps[map].grid_height
        ) {
            new_point.status = "invalid";
        } else if (new_point.x === x2 && new_point.y === y2) {
            new_point.status = "end";
        } else if (grid_copy[new_point.x][new_point.y] !== "empty") {
            new_point.status = "blocked";
        } else {
            new_point.status = "valid";
            grid_copy[new_point.x][new_point.y] = "checked";
        }
        return new_point;
    }

    var start_point = {x: x1, y: y1, path: [], status: "start"};
    var points = [start_point]; //Init array of points, beginning with the start point
    var final_path = [];
    final = false;
    while (points.length > 0 && !final && points.length < 1000) {
        var current_point = points.shift(); //remove and return the first point from the array
        var new_point;
        var directions = ["up", "down", "left", "right", "up-left", "up-right", "down-left", "down-right"];
        directions.forEach(function (direction) {
            new_point = check_point(current_point, direction, grid_copy);
            if (new_point.status === "end") {
                if (!final) {
                    final_path = new_point.path;
                    final = true;
                }
            } else if (new_point.status === "valid") {
                points.push(new_point);
            }
        });
    }
    if (!final) {
        final_path = []
        return final_path;
    }
    while (final_path.length > 0) {
        if (maps[map].grid[final_path[final_path.length - 1].x][final_path[final_path.length - 1].y] !== "checked" &&
            maps[map].grid[final_path[final_path.length - 1].x][final_path[final_path.length - 1].y] !== "empty"
        ) {
            try {
                final_path.pop();
            } catch {
            }
        } else {
            break;
        }
    }
    grid_copy = [];
    return final_path;
}

async function send_destroy_packet(entity_name, map) {
    await new Promise(resolve => setTimeout(resolve, config.step));
    maps[map].clients.forEach(function (client) {
        //Send player death packet to all clients in the room
        client.socket.write(packet.build(["DESTROY", entity_name], client.id));
    });
}

//minimum is inclusive, maximum is exclusive
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function drawFloors(client) {
    //TODO update drawFloors function to cover whole map
}

function spawnWalls(client) {
    //TODO update spawnwalls function
}

function spawnEntities(client) {
    maps[client.current_room].entities.forEach(function (entity) {
        if (entity.alive) {
            params = [];
            params.push("SPAWN");
            params.push(entity.name);
            params.push(entity.type);
            params.push(entity.pos_x.toString());
            params.push(entity.pos_y.toString());
            params.push(entity.health.toString());
            params.push(entity.max_health.toString())
            client.socket.write(packet.build(params, client.id));
        }
    });
}









