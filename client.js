var now = require("performance-now");
var underscore = require("underscore");
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
module.exports = function () {
    this.initiate = function () {
        var client = this;
        //send the connection handshake packet to the client
        client.socket.write(packet.build(["HANDSHAKE", now().toString()]));
        console.log(timeNow() + config.msg_client_connected + client.id);
    };
    this.data = function (data) {
        var client = this;
        console.log(timeNow() + config.msg_client_data + client.id + "," + data.toString());
        packet.parse(client, data);
    };
    //Log the user out if client is unexpectedly closed or crashes:
    this.error = function () {
        var client = this;
        console.log(timeNow() + config.err_msg_client_error + client.id);
        client.socket.write(packet.build(["LOGOUT"]));
        sendDestroyPackets(client.id);
    }
    this.end = function () {
        var client = this;
        sendDestroyPackets(client.id);
    }
}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}

function sendDestroyPackets(clientId) {
    query = "UPDATE public.users SET online_status = 0 , current_client = null WHERE current_client = ? LIMIT 1";
    values = [clientId];
    connection.query(query, values, function (error) {
        if (error) {
            console.log(timeNow() + config.err_msg_logout_database);
            throw error;
        } else {
            console.log(timeNow() + config.msg_logout_success);
        }
    });
    function getLastRecord(clientId, next) {
        query = "SELECT * FROM public.users WHERE current_client = ?";
        values = [clientId];
        connection.query(query, values, function (error, rows) {
            if (error) {
                console.log(timeNow() + config.err_msg_db);
                throw error;
            } else {
                next(null, rows);
            }
        });
    }
    var current_room;
    var username;
    getLastRecord(clientId, function (error, data) {
        if (error) {
            throw error;
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