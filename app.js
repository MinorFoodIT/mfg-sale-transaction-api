var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var helmet = require('helmet');
var cors = require('cors');
const httpStatus = require('http-status');
var expressValidation = require('express-validation');
var methodOverride = require('method-override');
//Logging                                               //var logger = require('morgan');  //console.log(configEnv.parsed)
const expressWinston = require('express-winston');
const winstonInstance = require('winston');
const moment = require('moment');
//Swagger
var swaggerUi = require('swagger-ui-express'), swaggerDocument = require('./common/swagger.json');
var swStats = require('swagger-stats');
const APIError = require('./common/APIError');
// make bluebird default Promise
Promise = require('bluebird');

var requestId = require('request-id/express');
var config = require('./common/config');    //const configEnv = require('dotenv').config()
var routes = require('./routes/index-route');
var app = express();    //require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
app.use(swStats.getMiddleware({swaggerSpec:swaggerDocument}));      // parse body params and attache them to req.body
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));  //swagger
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());  // secure apps by setting various HTTP headers
app.use(helmet());          // enable CORS - Cross Origin Resource Sharing
app.use(cors());
// enable detailed API logging in dev env
if (config.env === 'development') {
    expressWinston.requestWhitelist.push('body'); // Array of request body to log
    expressWinston.responseWhitelist.push('body');
    app.use(expressWinston.logger({
        transports: [
            /*
            new winstonInstance.transports.File({
                level: 'info',
                filename: __dirname + '/log/access.log',
                format: winston.format.printf(info => `${new Date().toISOString()} | ${info.label} | ${info.level} | ${info.message}`),                handleExceptions: true,
                json: true,
                //json: false,
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                colorize: false,
            }),
            */
            new (winstonInstance.transports.Console)({
                json: true,
                colorize: true,
                format: winstonInstance.format.printf(info => `${moment().format()} | ${info.label} | ${info.level} | ${info.message}`)
            })

        ],
        format: winstonInstance.format.combine(
            winstonInstance.format(function dynamicContent(info, opts) {
                info.message = '' + info.message;
                return info;
            })(),
            winstonInstance.format.simple()
        ),
        meta: true, // optional: log meta data about request (defaults to true)
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorStatus: true , // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
        ignoreRoute: function (req, res) {
             if(String(req.url) === String('/health-check') ){
                return false; 
             }
        } 
    }));
}
app.use(express.static(path.join(__dirname, 'public'))); //put favicon.ico on public
app.disable('etag'); //Cache and 304 not modified ,http header with same request
app.use(requestId());
app.use('/api', routes);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
    if (err instanceof expressValidation.ValidationError) {
        // validation error contains errors which is an array of error each containing message[]
        const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
        const error = new APIError(unifiedErrorMessage, err.status, true);
        return next(error);
    // } else if (!(err instanceof APIError)) {
    //     const apiError = new APIError(err.message, err.status, err.isPublic);
    //     return next(apiError);
    // }
    }
    return next(err);
});
// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new APIError('API not found', httpStatus.NOT_FOUND ,true);
    return next(err);
});
// log error in winston transports except when executing test suite
if (config.env !== 'test') {
    app.use(expressWinston.errorLogger({
        transports: [
            new (winstonInstance.transports.Console)({
                json: true,
                colorize: true,
                format: winstonInstance.format.printf(info => `${moment().format()} | ${info.label} | ${info.level} | ${info.message}`)
            })
        ],
        format: winstonInstance.format.combine(
            winstonInstance.format(function dynamicContent(info, opts) {
                info.message = '' + info.message;
                return info;
            })(),
            winstonInstance.format.simple()
        ),
        meta: true, // optional: log meta data about request (defaults to true)
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    }));

}
// error handler, send stacktrace only during development
app.use((err, req, res, next) => {// eslint-disable-line no-unused-vars
    if(err){
        if(err.status){
            res.status(err.status).json({
                code: err.status,
                message: err.isPublic ? err.message : httpStatus[err.status],
                //stack: config.env === 'development' ? err.stack : {}
                stack: config.env === 'development' ? err.message : {}
            })
        }else{
            res.status(500).json({
                code: 500,
                message: err.message  ,
                stack: config.env === 'development' ? err.message : {} //err.stack
            })
        }
    }
});

module.exports = app;