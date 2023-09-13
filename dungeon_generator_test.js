function generateDungeon(dungeon_size, dungeon_difficulty) {

    var room_min_width = 0;
    var room_max_width = 0;
    var room_min_height = 0;
    var room_max_height = 0;
    var ROOM_MIN_SIZE = 25;
    var ROOM_MAX_SIZE = 100;

    var new_map_width = 0;
    var new_map_height = 0;
    var num_rooms = 0;

    switch(dungeon_size) {
        case "SMALL":
            num_rooms = 8;
            new_map_width = 40;
            new_map_height = 20;
            room_min_width = 3;
            room_max_width = 10;
            room_min_height = 3;
            room_max_height = 10;
            break;
        case "MEDIUM":
            num_rooms = 16;
            new_map_width = 60;
            new_map_height = 30;
            break;
        case "LARGE":
            num_rooms = 32
            new_map_width = 80;
            new_map_height = 40;
            break;
        case "HUGE":
            num_rooms = 50
            new_map_width = 100;
            new_map_height = 50;
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
        grid_width: new_map_width,
        grid_height: new_map_height,
        ascii_grid: []
    }

    //Init room grid:
    new_map.grid = initMapGrid(new_map);
    new_map.ascii_grid = initMapGrid(new_map);

    //Init origin points for each room
    //origin_x, origin_y for room refers to the top-left floor tile of the room
    for (var i = 0; i < num_rooms; ++i) {

        var new_room_origin_x = randomInt(2, new_map.grid_width - 1);
        var new_room_origin_y = randomInt(2, new_map.grid_height - 1);
        var new_room_width = randomInt(room_min_width, room_max_width - 1);
        var new_room_height = randomInt(room_min_height, room_max_height - 1);

        var room_origin_valid = true;
        var room_dimensions_valid = true;
        var tries = 0;

        //Check room origin
        // for (var j = 0; j < new_map.rooms.length; ++j) {
        //     room_origin_valid = true;
        //     if (distance(new_room.origin_x, new_room.origin_y, new_map.rooms[j].origin_x, new_map.rooms[j].origin_y) < 7.1){
        //         room_origin_valid = false;
        //         new_room.origin_x = randomInt(2, new_map.grid_width - 1);
        //         new_room.origin_y = randomInt(2, new_map.grid_height - 1);
        //         j = 0;
        //         tries++;
        //         if(tries > 50){
        //             j = new_map.rooms.length;
        //         }
        //     }
        // }

        //Adjust dimensions of rooms:


        //Check room width
        // for (var j = 0; j < new_map.rooms.length; ++j) {
        //     room_dimensions_valid = true;
        //     if (
        //         Math.abs(new_room.origin_x + new_room.width >= new_map.rooms[j].origin_x - 1) &&
        //         Math.abs(new_room.origin_y + new_room.height >= new_map.rooms[j].origin_y - 1)
        //     ) {
        //         room_dimensions_valid = false;
        //         tries++;
        //         if (tries > 50) {
        //             break;
        //         }
        //         new_room.width = randomInt(room_min_width, room_max_width - 1);
        //         new_room.height = randomInt(room_min_height, room_max_height - 1);
        //         j = 0;
        //     }
        // }

        new_room = {
            origin_x: new_room_origin_x,
            origin_y: new_room_origin_y,
            width: new_room_width,
            height: new_room_height
        };

        new_map.rooms.push(new_room);
        console.log("added new_room to new_map");
    }

    //Write dungeon layout to ASCII
    new_map.rooms.forEach(function(room){
       for(var h = 0; h < room.width; ++h){
           if(room.origin_x + h < new_map.grid_width) {
               for (var v = 0; v < room.height; ++v) {
                   if (room.origin_y + v < new_map.grid_height) {
                       if(
                           room.origin_x + h > 0 &&
                           room.origin_x + h < new_map.grid_width - 1 &&
                           room.origin_y+ v > 0 &&
                           room.origin_y + v < new_map.grid_height - 1) {
                           new_map.ascii_grid[room.origin_x + h][room.origin_y + v] = "__";
                       }
                   }
               }
           }
       }
    });

    //Output dungeon layout to ASCII:
    for(var i = 0; i < new_map.grid_width; ++i){
        var line = "";
        for(var k = 0; k < new_map.grid_height; ++k){
            line += new_map.ascii_grid[i][k];
        }
        console.log(line);
    }
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function distance(x1, y1, x2, y2) {
    return parseInt(Math.pow(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 0.5));
}

function initMapGrid(map) {
    var grid = [];
    for (var i = 0; i < map.grid_width; i++) {
        grid.push([])
        for (var k = 0; k < map.grid_height; k++) {
            grid[i][k] = "||";
        }
    }
    return grid;
}

generateDungeon("SMALL", "EASY");
