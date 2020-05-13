var mysql      = require('mysql');
const config   = require('./config');
/*
var connection = mysql.createConnection({
    host     : 'localhost',
    port     : '3306',
    user     : 'admin',
    password : 'minor@1234',
    database : 'food_api'
});
connection.connect(function(err){
    if(err){ throw  err}
    logger.info('[mysql] Connected Success!');
});

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    logger.info('[mysql] The solution is: ', results[0].solution);
});

connection.end();

*/

var pool = mysql.createPool({
    connectionLimit : 1000,
    acquireTimeout : 120000,
    conneectionTimeout : 120000,
    charset  : 'UTF8MB4_UNICODE_CI',
    supportBigNumbers : true,
    bigNumberStrings : true,
    dateStrings: true,
    host     : config.mysql_host, //process.env.DB_HOST, //config.mysql_host, //'172.17.0.1',
    port     : config.mysql_port,
    user     : config.mysql_user,
    password : config.mysql_password,
    database : config.mysql_database
});

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        //console.log("[Start] db connnection")
        callback(err, connection);
    });
};
const poolEnd = () => {
    pool.end(function (err) {
        // all connections in the pool have ended
        logger.info('[Pool] closed '+err)
    });
}

const isPoolConnected = () => {
    if(pool._allConnections.length > 0){
        return true;
    }else{
        return false;
    }
} 

module.exports = {getConnection,poolEnd,isPoolConnected };