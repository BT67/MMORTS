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
var clientId;
module.exports = function () {
    this.initiate = function () {
        var client = this;
        //send the connection handshake packet to the client
        client.socket.write(packet.build(["HANDSHAKE", now().toString()]));
        console.log(timeNow() + "Client Successfully Initiated, client Id=" + client.id);
    };
    this.data = function (data) {
        var client = this;
        console.log(timeNow() + "Client Data: " + data.toString());
        packet.parse(client, data);
    };
    //Log the user out if client is unexpectedly closed or crashes:
    this.error = function () {
        console.log(timeNow() + config.err_msg_client_error + clientId);
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
    }

    function getLastRecord(clientid, current_room, next) {
        var query_str = "SELECT current_client FROM public.users WHERE current_room = ? AND current_client != ? ";
        var query_var = [current_room, clientid];
        connection.query(query_str, query_var, function (error, rows) {
            if (error) {
                console.log(error);
                next(error);
            } else {
                next(null, rows);
            }
        });
        connection.end();
        //TODO add connection.end() for all sql queries
    }
}

this.end = function () {
}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}