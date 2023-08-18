// var mqsql = require("mysql");
// const mysql = require("mysql");
//
// var userSchema = {
//     username: {type: String, unique: true},
//     password: String,
//     sprite: String,
//     current_room: String,
//     pos_x: Number,
//     pox_y: Number,
// };
//
// userSchema.register = function(username, password){
//     const connection = mysql.createConnection({
//         host: 'localhost',
//         user: 'mysql',
//         password: 'mysql',
//     });
//     connection.connect((error) => {
//         if(error){
//             console.log('Error: Failed to register new user, error connecting to user database');
//             return;
//         }
//         console.log('Connection with user database established sucessfully');
//     });
//     var query = "INSERT INTO users (username, password, current_room, pos_x, pos_y) VALUES (" + username + ", " +
//         password + ", 0, 0, 0)";
//     connection.query(query, function (error, result) {
//         if(error){
//             console.log('Error: Failed to register new user, error adding user to database');
//             return;
//         }
//         console.log('New user registered successfully');
//     });
//     connection.end();
// };
//
//
// login = function(username, password){
//     const connection = mysql.createConnection({
//         host: 'localhost',
//         user: 'mysql',
//         password: 'mysql',
//     });
//     connection.connect((error) => {
//         if(error){
//             console.log('Error: Failed to login, error connecting to user database');
//             return;
//         }
//         console.log('Connection with user database established sucessfully');
//     });
//     var query = "SELECT * FROM users WHERE username = " + username + " AND password = " + password;
//     connection.query(query, function (error, result) {
//         if(error){
//             console.log('Error: Failed to login, error retrieving data from user database');
//             return;
//         }
//         console.log('login successful');
//     });
//     connection.end();
// };

//module.exports = User = gamedb.model("User", userSchema);