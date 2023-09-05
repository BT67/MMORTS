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

maps["zone1"].grid = initMapGrid(maps["zone1"]);

//Load mobs into each map:
var entity_inst = new require("./Models/entity.js");
const {grid_height, grid_width} = require("./Resources/Game Data/Maps/zone1");
var this_entity = new entity_inst();
this_entity.alive = true;
this_entity.health = 100;
this_entity.sprite = "";
this_entity.type = "mob";
this_entity.name = "mob1";
this_entity.pos_x = 15;
this_entity.pos_y = 15;
this_entity.target_x = this_entity.pos_x;
this_entity.target_y = this_entity.pos_y;
this_entity.origin_x = this_entity.pos_x;
this_entity.origin_y = this_entity.pos_y;
this_entity.target_entity = null;
this_entity.roam_range = 10;
this_entity.view_range = 5;
this_entity.attack_range = 3;
this_entity.in_combat = false;
this_entity.aggressive = true;
this_entity.move_speed = 1;
this_entity.sprite = "sprite";
this_entity.max_health = 100;
this_entity.respawn_period = 100;
this_entity.respawn_timer = this_entity.respawn_period;
this_entity.path = [];
this_entity.attack_period = 5;
this_entity.attack_timer = this_entity.attack_period;
maps["zone1"].entities.push(this_entity);

this_entity = new entity_inst();
this_entity.alive = true;
this_entity.health = 100;
this_entity.sprite = "";
this_entity.type = "mob";
this_entity.name = "mob2";
this_entity.pos_x = 15;
this_entity.pos_y = 21;
this_entity.target_x = this_entity.pos_x;
this_entity.target_y = this_entity.pos_y;
this_entity.origin_x = this_entity.pos_x;
this_entity.origin_y = this_entity.pos_y;
this_entity.target_entity = null;
this_entity.roam_range = 10;
this_entity.view_range = 5;
this_entity.attack_range = 3;
this_entity.in_combat = false;
this_entity.aggressive = true;
this_entity.move_speed = 1;
this_entity.sprite = "sprite";
this_entity.max_health = 100;
this_entity.respawn_period = 100;
this_entity.respawn_timer = this_entity.respawn_period;
this_entity.path = [];
this_entity.attack_period = 5;
this_entity.attack_timer = this_entity.attack_period;
maps["zone1"].entities.push(this_entity);

this_entity = new entity_inst();
this_entity.alive = true;
this_entity.health = 100;
this_entity.sprite = "";
this_entity.type = "mob";
this_entity.name = "mob3";
this_entity.pos_x = 20;
this_entity.pos_y = 2;
this_entity.target_x = this_entity.pos_x;
this_entity.target_y = this_entity.pos_y;
this_entity.origin_x = this_entity.pos_x;
this_entity.origin_y = this_entity.pos_y;
this_entity.target_entity = null;
this_entity.roam_range = 10;
this_entity.view_range = 5;
this_entity.attack_range = 3;
this_entity.in_combat = false;
this_entity.aggressive = true;
this_entity.move_speed = 1;
this_entity.sprite = "sprite";
this_entity.max_health = 100;
this_entity.respawn_period = 100;
this_entity.respawn_timer = this_entity.respawn_period;
this_entity.path = [];
this_entity.attack_period = 5;
this_entity.attack_timer = this_entity.attack_period;
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
    thisClient.current_room = null;
    thisClient.pos_x = 0;
    thisClient.pos_y = 0;
    thisClient.target_x = thisClient.pos_x;
    thisClient.target_y = thisClient.pos_y;
    thisClient.target_entity = null;
    thisClient.move_speed = 1;
    thisClient.max_health = 100;
    thisClient.health = thisClient.max_health;
    thisClient.path = [];
    thisClient.alive = true;
    thisClient.respawn_period = 10;
    thisClient.respawn_timer = thisClient.respawn_period;
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
            if (maps[map].clients.length > 0) {
                maps[map].entities.forEach(function (entity) {
                    if (entity.alive) {
                        if (entity.aggressive) {
                            if (entity.target_entity === null) {
                                maps[map].clients.forEach(function (client) {
                                    if (client.alive) {
                                        dist = distance(client.pos_x, client.pos_y, entity.pos_x, entity.pos_y);
                                        if (dist < entity.view_range) {
                                            console.log(timeNow() + "Mob aggro triggered");
                                            entity.in_combat = true;
                                            entity.target_entity = client.username;
                                            entity.target_x = client.pos_x;
                                            entity.target_y = client.pos_y;
                                        }
                                    }
                                });
                            } else {
                                //If entity has a target
                                dist = distance(entity.pos_x, entity.pos_y, entity.origin_x, entity.origin_y);
                                //If entity goes beyond roam range, return to origin
                                if (dist >= entity.roam_range) {
                                    entity.in_combat = false;
                                    entity.target_entity = null;
                                    entity.target_x = entity.origin_x;
                                    entity.target_y = entity.origin_y;
                                } else {
                                    maps[map].clients.forEach(function (client) {
                                        if (client.username === entity.target_entity) {
                                            //If target entity leaves view range, return to origin
                                            dist = distance(client.pos_x, client.pos_y, entity.pos_x, entity.pos_y);
                                            if (dist >= entity.view_range) {
                                                entity.in_combat = false;
                                                entity.target_entity = null;
                                                entity.target_x = entity.origin_x;
                                                entity.target_y = entity.origin_y;
                                            } else {
                                                //Else, if target is still in view range, continue pursuit
                                                entity.target_x = client.pos_x;
                                                entity.target_y = client.pos_y;
                                                //If target is within attack range, attack the target
                                                if (dist <= entity.attack_range) {
                                                    //attack the target
                                                    if (entity.attack_timer === entity.attack_period) {
                                                        maps[map].clients.forEach(function (otherClient) {
                                                            otherClient.socket.write(packet.build([
                                                                "ATTACK", "attack", client.username, entity.name
                                                            ], otherClient.id));
                                                        });
                                                        client.health -= 1;
                                                        maps[map].clients.forEach(function (otherClient) {
                                                            otherClient.socket.write(packet.build([
                                                                "HEALTH", client.username, client.health.toString()
                                                            ], otherClient.id));
                                                        });
                                                        if (client.health <= 0) {
                                                            client.alive = false;
                                                            client.health = client.max_health;
                                                            client.path = [];
                                                            client.target_entity = null;
                                                            client.pos_x = maps[map].start_x;
                                                            client.pos_y = maps[map].start_y;
                                                            client.target_x = client.pos_x;
                                                            client.target_y = client.pos_y;
                                                            maps[map].clients.forEach(function (otherClient) {
                                                                //Send player death packet to all clients in the room
                                                                otherClient.socket.write(packet.build(["DESTROY", client.username], otherClient.id));
                                                            });
                                                            entity.in_combat = false;
                                                            entity.target_entity = null;
                                                            entity.target_x = entity.origin_x;
                                                            entity.target_y = entity.origin_y;
                                                        }
                                                        entity.attack_timer = 0;
                                                    }
                                                    entity.attack_timer += 1;
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        if (entity.target_x !== entity.pos_x || entity.target_y !== entity.pos_y) {
                            entity.path = createPath(map, entity.pos_x, entity.pos_y, entity.target_x, entity.target_y);
                            if (entity.target_entity !== null) {
                                if (entity.path.length === 1) {
                                    entity.path = [];
                                } else {
                                    entity.path = entity.path.slice(0, -1);
                                }
                            }
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
                    } else if (!entity.alive) {
                        entity.respawn_timer -= 10;
                        if (entity.respawn_timer <= 0) {
                            entity.alive = true;
                            entity.health = entity.max_health;
                            entity.respawn_timer = entity.respawn_period;
                            entity.pos_x = entity.origin_x;
                            entity.pos_y = entity.origin_y;
                            entity.target_x = entity.origin_x;
                            entity.target_y = entity.origin_y;
                            entity.target_entity = null;
                            maps[map].clients.forEach(function (client) {
                                params = [];
                                params.push("SPAWN");
                                params.push(entity.name);
                                params.push(entity.type);
                                params.push(entity.pos_x.toString());
                                params.push(entity.pos_y.toString());
                                params.push(entity.health);
                                client.socket.write(packet.build(params, client.id));
                            });
                        }
                    }
                });
                //Update client pos
                maps[map].clients.forEach(function (client) {
                    if (client.alive) {
                        if (client.target_x !== client.pos_x || client.target_y !== client.pos_y) {
                            client.path = createPath(map, client.pos_x, client.pos_y, client.target_x, client.target_y);
                            if (client.target_entity !== null) {
                                client.path = client.path.slice(0, -1);
                                if (client.path.length === 1) {
                                    client.path = [];
                                } else {
                                    client.path = client.path.slice(0, -1);
                                }
                            }
                        }
                        if (client.path.length > 0) {
                            prev_pos_x = client.pos_x;
                            prev_pos_y = client.pos_y;
                            moveTowardsTarget(map, client);
                            maps[map].clients.forEach(function (otherClient) {
                                params = [];
                                params.push("POS");
                                params.push(client.username);
                                params.push(prev_pos_x.toString());
                                params.push(prev_pos_y.toString());
                                params.push(client.pos_x.toString());
                                params.push(client.pos_y.toString());
                                otherClient.socket.write(packet.build(params, otherClient.id));
                            });
                        }
                    } else {
                        //If client is not alive, update client spawn timer:
                        client.respawn_timer -= 1;
                        if (client.respawn_timer <= 0) {
                            client.alive = true;
                            client.respawn_timer = client.respawn_period;
                            maps[map].clients.forEach(function (otherClient) {
                                params = [];
                                params.push("SPAWN");
                                params.push(client.username);
                                params.push("player");
                                params.push(client.pos_x.toString());
                                params.push(client.pos_y.toString());
                                params.push(client.health);
                                otherClient.socket.write(packet.build(params, otherClient.id));
                            });
                        }
                    }
                });
            }
            //At end of each step, check if any mobs occupy the same square as any players, move mobs out of the square
            //If no square available to move to, stay in place
            maps[map].entities.forEach(function (entity) {
                if (entity.alive) {
                    maps[map].clients.forEach(function (client) {
                        if (client.pos_x === entity.pos_x && client.pos_y === entity.pos_y) {
                            check_surrounding(maps[map].grid, entity);
                            if (entity.path.length > 0) {
                                prev_pos_x = entity.pos_x;
                                prev_pos_y = entity.pos_y;
                                moveTowardsTarget(map, entity);
                                maps[map].clients.forEach(function (otherClient) {
                                    params = [];
                                    params.push("POS");
                                    params.push(entity.name);
                                    params.push(prev_pos_x.toString());
                                    params.push(prev_pos_y.toString());
                                    params.push(entity.pos_x.toString());
                                    params.push(entity.pos_y.toString());
                                    otherClient.socket.write(packet.build(params, otherClient.id));
                                });
                            }
                        }
                    });
                }
            });
        });
        await new Promise(resolve => setTimeout(resolve, config.step));
    }
}

function check_surrounding(grid, entity) {
    var directions = ["up", "down", "left", "right", "up-left", "up-right", "down-left", "down-right"];
    var new_point = {
        x: entity.pos_x,
        y: entity.pos_y,
    }
    directions.forEach(function (direction) {
        switch (direction) {
            case "up":
                if (grid[entity.pos_x][entity.pos_y - 1] === "empty") {
                    new_point.x = entity.pos_x;
                    new_point.x = entity.pos_y - 1;
                    entity.path.push(new_point);
                    return;
                }
                break;
            case "down":
                if (grid[entity.pos_x][entity.pos_y + 1] === "empty") {
                    new_point.x = entity.pos_x;
                    new_point.x = entity.pos_y + 1;
                    entity.path.push(new_point);
                    return;
                }
                break;
            case "left":
                if (grid[entity.pos_x - 1][entity.pos_y] === "empty") {
                    new_point.x = entity.pos_x - 1;
                    new_point.y = entity.pos_y;
                    entity.path.push(new_point);
                    return;
                }
                break;
            case "right":
                if (grid[entity.pos_x + 1][entity.pos_y] === "empty") {
                    new_point.x = entity.pos_x + 1;
                    new_point.y = entity.pos_y;
                    entity.path.push(new_point);
                    return;
                }
                break;
            case "up-left":
                if (grid[entity.pos_x - 1][entity.pos_y - 1] === "empty") {
                    new_point.x = entity.pos_x - 1;
                    new_point.y = entity.pos_y - 1;
                    entity.path.push(new_point);
                    return;
                }
                break;
            case "up-right":
                if (grid[entity.pos_x + 1][entity.pos_y - 1] === "empty") {
                    new_point.x = entity.pos_x + 1;
                    new_point.y = entity.pos_y - 1;
                    entity.path.push(new_point);
                    return;
                }
                break;
            case "down-left":
                if (grid[entity.pos_x - 1][entity.pos_y + 1] === "empty") {
                    new_point.x = entity.pos_x - 1;
                    new_point.y = entity.pos_y + 1;
                    entity.path.push(new_point);
                    return;
                }
                break;
            case "down-right":
                if (grid[entity.pos_x + 1][entity.pos_y + 1] === "empty") {
                    new_point.x = entity.pos_x + 1;
                    new_point.y = entity.pos_y + 1;
                    entity.path.push(new_point);
                    return;
                }
                break;
        }
    });
}

function moveTowardsTarget(map, entity) {
    try {
        next_point = entity.path.shift();
        entity.pos_x = next_point.x;
        entity.pos_y = next_point.y;
    } catch (error) {
        entity.path = [];
    }
    entity.pos_x = parseInt(entity.pos_x);
    entity.pos_y = parseInt(entity.pos_y);
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
    return grid;
}

function createPath(map, x1, y1, x2, y2) {
    if (x1 === x2 && y1 === y2) {
        return [];
    }
    var grid_copy = [];
    for (var i = 0; i < maps[map].grid.length; i++) {
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
            new_point.x >= grid_width ||
            new_point.y < 0 ||
            new_point.y >= grid_height
        ) {
            new_point.status = "invalid";
        } else if (grid_copy.at(new_point.x).at(new_point.y) !== "empty") {
            new_point.status = "blocked";
        } else if (new_point.x === x2 && new_point.y === y2) {
            new_point.status = "end";
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
    while (points.length > 0) {
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
    grid_copy = [];
    return final_path;
}





