var mysql = require("mysql");

module.exports = gamedb = mysql.createConnection(config.database);