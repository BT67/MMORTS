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
    this.error = function (username) {
        query = "UPDATE public.users SET online_status = 0 , current_client = null WHERE username = ? AND online_status = 1 LIMIT 1";
        values = [username];
        if (username === undefined || username.length === 0) {
            console.log(timeNow() + config.msg_client_disconnect + clientId);
        } else {
            connection.query(query, values, function (error) {
                if (error) {
                    console.log(timeNow() + "Error: Failed to logout user=" + user + " from clientid=" + client.id);
                    throw error;
                } else {
                    console.log(timeNow() + "logout successful, clientid=" + client.id + " logged out as user=" + user);
                }
            });
        }
        function getLastRecord(clientid, current_room, next) {
            var query_str = "SELECT current_client FROM public.users WHERE current_room = ? AND current_client != ? ";
            var query_var = [current_room, clientid];
            connection.query(query_str, query_var, function (error, rows) {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                    next(null, rows);
                }
            });
            connection.end();
        }
    }
};
this.end = function () {
}

function timeNow() {
    var timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] ";
}