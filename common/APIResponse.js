// status = httpstatus //httpStatus[err.status]
var APIResponse = function( message ,status,results) {
    return {
        code: status,
        message: message,
        results: results
    };
}
module.exports = APIResponse;
/*
function convertToClient(results) {
    if(results && results.toClient) {
      results = results.toClient();
    }
    else if(util.isArray(results)) {    
      results = results.map(function(result) {
        if(result.toClient) {
          result = result.toClient();
        }
        return result;
      });
    }
    else if (results instanceof Object) {
      for(var prop in results) {
        if(results[prop] instanceof Object) {
          results[prop] = convertToClient(results[prop]);
        }
      }
    }
    return results;
  }
  */