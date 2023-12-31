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
        connection = {
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
                new_map.connections.push(connection);
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

function createWalls(map){
    //To generate wall objects, iterate over every square in the ASCII grid
    //Any "|" square adjacent to a "_" room square becomes a wall object
    for (var i = 0; i < map.ascii_grid.length; i++) {
        for (var k = 0; k < map.ascii_grid[i].length; k++) {
            if(map.ascii_grid[i][k] === "|"){
                var wall_x = i;
                var wall_y = k;
                var wall_type = "wall_default";
                var is_wall = false;
                //Check up
                if(k >= 1) {
                    if(map.ascii_grid[i][k - 1] === "_"){
                        is_wall = true;
                    }
                }
                //Check down
                if(k + 1 < map.height){
                    if(map.ascii_grid[i][k + 1] === "_"){
                        is_wall = true;
                    }
                }
                //Check left
                if(i >= 1){
                    if(map.ascii_grid[i - 1][k] === "_"){
                        is_wall = true;
                    }
                }
                //Check right
                if(i + 1 < map.width){
                    if(map.ascii_grid[i + 1][k] === "_"){
                        is_wall = true;
                    }
                }
                //Check up-left
                if(i >= 1 && k >= 1){
                    if(map.ascii_grid[i - 1][k - 1] === "_"){
                        is_wall = true;
                    }
                }
                //Check up-right
                if(i + 1 < map.width && k >= 1){
                    if(map.ascii_grid[i + 1][k - 1] === "_"){
                        is_wall = true;
                    }
                }
                //Check down-left
                if(i >= 1 && k + 1 < map.height){
                    if(map.ascii_grid[i + 1][k - 1] === "_"){
                        is_wall = true;
                    }
                }
                //Check down-right
                if(i + 1 < map.width && k + 1 < map.height){
                    if(map.ascii_grid[i + 1][k + 1] === "_"){
                        is_wall = true;
                    }
                }
                if(is_wall){
                    wall = {
                        x: wall_x,
                        y: wall_y,
                        type: wall_type
                    }
                    map.walls.push(wall);
                }
            }
        }
    }
    return map;
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

generateDungeon("MEDIUM", "EASY");
