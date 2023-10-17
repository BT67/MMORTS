var now = require("performance-now");
const {Client} = require("pg");
const connection = new Client({
    host: '127.0.0.1',
    port: '5432',
    user: 'postgres',
    password: 'root',
    database: 'postgres'
});
var query;
var values;
var id;
module.exports = function () {

    var client = this;

    this.initiate = async function () {
        client.socket.write(packet.build(["HANDSHAKE", now().toString()]));
        console.log(timeNow() + config.msg_client_connected + client.id);
        id = client.id;
    };
    this.data = function (data) {
        console.log(timeNow() + config.msg_client_data + client.id + "," + data.toString());
        packet.parse(client, data);
    };
    //Log the user out if client is unexpectedly closed or crashes:
    this.error = function () {
        db_set_logout(client);
        process_logout(client);
        sendDestroyPackets(id);
    }
    this.end = function () {
        db_set_logout(client);
        process_logout(client);
        sendDestroyPackets(id);
    }
}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}

function db_set_logout(client) {
    logout_users.push(client.username);
}

function process_logout(client) {
    clients = clients.filter(item => item !== client);
    client.refresh_cont = false;
    console.log(timeNow() + config.err_msg_client_error + id);
    if (client.current_room !== null) {
        try {
            maps[client.current_room].clients = maps[client.current_room].clients.filter(item => item !== client);
        } catch (error) {
            console.log(timeNow() + config.err_msg_leaving_room + id);
            console.log(error.stack);
        }
    }
}


function sendDestroyPackets(clientId) {
    query = "UPDATE public.rts_users SET online_status = 0 , current_client = null WHERE current_client = ? LIMIT 1";
    values = [clientId];
    connection.query(query, values, function (error) {
        if (error) {
            console.log(timeNow() + config.err_msg_logout_database);
            console.log(error.stack);
        } else {
            console.log(timeNow() + config.msg_logout_success);
        }
    });
    function getLastRecord(clientId, next) {
        query = "SELECT * FROM public.rts_users WHERE current_client = ?";
        values = [clientId];
        connection.query(query, values, function (error, rows) {
            if (error) {
                console.log(timeNow() + config.err_msg_db);
                console.log(error.stack);
            } else {
                next(null, rows);
            }
        });
    }
    var current_room;
    var username;
    getLastRecord(clientId, function (error, data) {
        if (error) {
        } else {
            current_room = data[0].current_room;
            username = data[0].username;
        }
        maps[current_room].clients.remove(client);
        maps[current_room].clients.forEach(function (otherClient) {
            otherClient.socket.write(packet.build([
                "DESTROY", username
            ]));
        });
    });
}

