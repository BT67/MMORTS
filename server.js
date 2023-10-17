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

updateEntities();

async function updateEntities() {
    mapList = Object.keys(maps);
    while (true) {
        mapList.forEach(function (map) {
            if (maps[map].clients.length > 0) {
                console.log("client detected in room=" + map.toString());
                maps[map].entities.forEach(async function (entity) {
                    console.log("updating entity=" + entity.name);
                    if (entity.alive) {
                        console.log(entity.alive.toString());
                        entity.attack_timer += 1;
                        if (entity.target_entity === null) {
                            maps[map].entities.forEach(function (client) {
                                if (client.alive) {
                                    dist = distance(client.pos_x, client.pos_y, entity.pos_x, entity.pos_y);
                                    if (dist < entity.view_range) {
                                        entity.in_combat = true;
                                        entity.target_entity = client.username;
                                        entity.target_x = client.pos_x;
                                        entity.target_y = client.pos_y;
                                        entity.path = [];
                                    }
                                }
                            });
                        } else {
                            //If entity has a target
                            maps[map].entities.forEach(function (client) {
                                try {
                                    if (entity.username === entity.target_entity) {
                                        //If target entity leaves view range, return to origin
                                        dist = distance(client.pos_x, client.pos_y, entity.pos_x, entity.pos_y);
                                        if (dist > entity.view_range) {
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
                                                if (entity.attack_timer >= entity.attack_period) {
                                                    maps[map].clients.forEach(function (otherClient) {
                                                        otherClient.socket.write(packet.build([
                                                            "ATTACK", "attack", client.username, entity.name
                                                        ], otherClient.id));
                                                    });
                                                    client.health -= entity.attack_damage;
                                                    maps[map].clients.forEach(function (otherClient) {
                                                        otherClient.socket.write(packet.build([
                                                            "HEALTH", client.username, client.health.toString()
                                                        ], otherClient.id));
                                                    });
                                                    if (client.health <= 0) {
                                                        maps[map].grid[client.pos_x][client.pos_y] = "empty";
                                                        client.alive = false;
                                                        entity.patrol_point = 0;
                                                        client.health = client.max_health;
                                                        client.path = [];
                                                        client.target_entity = null;
                                                        client.pos_x = maps[map].start_x;
                                                        client.pos_y = maps[map].start_y;
                                                        client.target_x = client.pos_x;
                                                        client.target_y = client.pos_y;
                                                        send_destroy_packet(client.username, map);
                                                        entity.in_combat = false;
                                                        entity.target_entity = null;
                                                        entity.target_x = entity.origin_x;
                                                        entity.target_y = entity.origin_y;
                                                    } else if (client.target_entity === null &&
                                                        client.target_x === client.pos_x &&
                                                        client.target_y === client.pos_y) {
                                                        //If client is not already in combat and is not currently moving,
                                                        //target the mob that just attacked them:
                                                        client.in_combat = true;
                                                        client.target_entity = entity.name;
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
                        var dist = distance(entity.pos_x, entity.pos_y, entity.origin_x, entity.origin_y);
                        if (dist <= entity.roam_range) {
                            console.log("entity is within its roam range");
                            if (entity.target_x !== entity.pos_x || entity.target_y !== entity.pos_y) {
                                console.log("entity creating path to point...");
                                entity.path = createPath(map, entity.pos_x, entity.pos_y, entity.target_x, entity.target_y, entity.target_entity);
                                console.log("entity finished creating path");
                            }
                        }
                        dist = distance(entity.target_x, entity.target_y, entity.origin_x, entity.origin_y);
                        if (entity.path.length > 0 && dist <= entity.roam_range) {
                            prev_pos_x = entity.pos_x;
                            prev_pos_y = entity.pos_y;
                            console.log("moving towards target point");
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
                maps[map].clients.forEach(async function (client) {
                    try {
                        if (client.alive) {
                            client.attack_timer += 1;
                            if (client.target_x !== client.pos_x || client.target_y !== client.pos_y) {
                                console.log("client creating path to point...");
                                client.path = createPath(map, client.pos_x, client.pos_y, client.target_x, client.target_y, client.target_entity);
                                console.log("client finished creating path");
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
                            if (client.target_entity !== null) {
                                var target_entity = null;
                                maps[map].entities.forEach(function (entity) {
                                    if (entity.name === client.target_entity) {
                                        target_entity = entity;
                                    }
                                });
                                if (target_entity.alive) {
                                    dist = distance(client.pos_x, client.pos_y, target_entity.pos_x, target_entity.pos_y);
                                    if (dist <= client.attack_range) {
                                        if (client.attack_timer >= client.attack_period) {
                                            maps[map].clients.forEach(function (otherClient) {
                                                otherClient.socket.write(packet.build([
                                                    "ATTACK", "attack", target_entity.name, client.username
                                                ], otherClient.id));
                                            });
                                            client.attack_timer = 0;
                                            maps[map].entities.forEach(function (entity) {
                                                if (entity.name === client.target_entity && entity.alive) {
                                                    entity.health -= client.attack_damage;
                                                    maps[map].clients.forEach(function (OtherClient) {
                                                        OtherClient.socket.write(packet.build([
                                                            "HEALTH", entity.name, entity.health.toString()
                                                        ], client.id));
                                                    });
                                                    if (entity.target_entity === null) {
                                                        //If target_entity is not already in combat, target the client that just attacked them:
                                                        entity.in_combat = true;
                                                        entity.target_entity = client.username;
                                                        entity.target_x = client.pos_x;
                                                        entity.target_y = client.pos_y;
                                                    }
                                                    if (entity.health <= 0) {
                                                        maps[map].grid[entity.pos_x][entity.pos_y] = "empty";
                                                        send_destroy_packet(target_entity.name, map);
                                                        entity.alive = false;
                                                        alive = entity.alive;
                                                        client.target_entity = null;
                                                    }
                                                }
                                            });
                                        }
                                    } else {
                                        client.target_x = target_entity.pos_x;
                                        client.target_y = target_entity.pos_y;
                                    }
                                }
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
                    } catch (error) {

                    }
                });
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
            }
        })
        if (logout_users.length > 0) {
            var username = logout_users.shift();
            query = "UPDATE public.users SET online_status = false, current_client = null WHERE username = '" + username + "';";
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
            //} else if (grid_copy[new_point.x][new_point.y] === "wall" || grid_copy[new_point.x][new_point.y] === "checked") {
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
                console.log("removed final_point because it was occupied");
            } catch {
                console.log("unable to remove last element from path");
            }
        } else {
            break;
        }
    }
    grid_copy = [];
    //console.log("path length=" + final_path.length.toString());
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
    maps[client.current_room].rooms.forEach(function (room) {
        params = [];
        params.push("FLOOR");
        params.push(room.floor_type);
        params.push(room.origin_x.toString());
        params.push(room.origin_y.toString());
        params.push(room.width.toString());
        params.push(room.height.toString());
        client.socket.write(packet.build(params, client.id));
    });
    maps[client.current_room].connections.forEach(function (connection) {
        params = [];
        params.push("FLOOR");
        params.push(connection.floor_type);
        params.push(connection.origin_x.toString());
        params.push(connection.origin_y.toString());
        params.push(connection.width.toString());
        params.push(connection.height.toString());
        client.socket.write(packet.build(params, client.id));
    });
}

function spawnWalls(client) {
    var packet_count = 1;
    for (var i = 0; i < maps[client.current_room].walls.length; ++i) {
        params = [];
        params.push("WALL");
        params.push(maps[client.current_room].walls[i].type);
        params.push(maps[client.current_room].walls[i].pos_x.toString());
        params.push(maps[client.current_room].walls[i].pos_y.toString());
        params.push(i.toString());
        client.socket.write(packet.build(params, client.id));
        packet_count++;
    }
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

function spawnClients(client) {
    maps[client.current_room].clients.forEach(function (otherClient) {
        params = [];
        params.push("SPAWN");
        params.push(otherClient.username);
        params.push("player");
        params.push(otherClient.pos_x.toString());
        params.push(otherClient.pos_y.toString());
        params.push(otherClient.health.toString());
        params.push(otherClient.max_health.toString());
        client.socket.write(packet.build(params, client.id));
    });
}









