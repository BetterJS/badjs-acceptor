'use strict';

var connect = require('connect')
    , firstSteam = null
    , log4js = require('log4js'),
     logger = log4js.getLogger();

var argv = process.argv.slice(2);


if(argv.indexOf('--debug')){
    logger.setLevel('DEBUG');
}




var filters = ['./filter/comboPreprocess'  , './filter/addExtStream' , './filter/excludeParam'  , './filter/str2Int' , './dispatcher/zmq'];



filters.forEach(function (value ,key){
    var curStream = require(value)();
    if(!firstSteam){
        firstSteam = curStream;
    }else {
        firstSteam.pipe( curStream);
    }
});




connect()
  .use('/badjs', connect.query())
  .use('/badjs', function (req, res) {
    logger.debug('===== get a message =====');
    if(req.query.id <=0){
        res.writeHead(403, {
            'Content-Type': 'text/html'
        });
        res.statusCode = 403;
        res.write("id is required");
        logger.debug("id is required");
        return ;
    }


    try{
        firstSteam.write({req : req , data : req.query});

    }catch(e) {
        res.writeHead(403, {
            'Content-Type': 'text/html'
        });
        res.statusCode = 403;
        res.write("parse param  error :" + e);

        logger.debug("parse param  error :" + e);
        return ;
    }
    // write data

    // response end with 204
    res.writeHead(204, {
      'Content-Type': 'image/jpeg'
    });
    res.statusCode = 204;

    logger.debug("===== complete a message =====");
    res.end();
  }).listen(80);


logger.info('start badjs-accepter , listen 80 ...');
