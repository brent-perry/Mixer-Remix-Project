const mysql = require('mysql');
const connection = mysql.createConnection(
    {
    host : '127.0.0.1',
    port : "8889",
    user : 'canvas_user',
    password : 'canvas',
    database : 'Canvas'
    });

connection.connect();

module.exports = connection;
// connection.query('SELECT 1 + 1 AS solution',(error,results,fields) =>
//     {
//     if(error)
//         throw error;
//         console.log('The solution is: ', results[0].solution);
//     });

// connection.end();