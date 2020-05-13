var express = require('express');
var logger = require('./../common/logging/winston')(__filename)

const APIError = require('./../common/APIError');
const APIResponse = require('./../common/APIResponse');
var serverResp = require('./../common/serverResp');

var mysqldb = require('./../common/mysql-client');

//Routes
var router = express.Router();

// mount bot routes at /bot
//router.use('/v1', sdkRouter);



/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => {
      //logger.info('/api/health-check => OK Server up')
      res.json({
          status: 'UP',
          services: sdkCache
        });
    }
);

router.post('/api/v1/sale-check', (req,res) => {

    res.status(200).json(req.body);
})

module.exports = router;
