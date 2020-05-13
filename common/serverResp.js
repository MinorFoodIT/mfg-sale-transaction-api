
var mysqldb = require('./mysql-client');
var logger = require('./logging/winston')(__filename);

module.exports = function requestId(status,jsonReturn,res) {
    mysqldb((err,connection) => {
        if(err){
            logger.info('[Connection database error] '+err)
        }else{
            connection.query('UPDATE requests SET resp = ? where requestID = ?', [JSON.stringify(jsonReturn),res.getHeaders()["x-request-id"]] ,function (error, results, fields){
                if (error) {
                    logger.info('[Update request error] '+error);
                };
                connection.release()
            });
        }        
    });
  
    return res.status(status).json(jsonReturn);
  };
  