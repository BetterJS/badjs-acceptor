'use strict';

var connect = require('connect')
    , firstSteam = null
    , log4js = require('log4js'),
     logger = log4js.getLogger();

var argv = process.argv.slice(2);


if(argv.indexOf('--debug') >= 0){
    logger.setLevel('DEBUG');
    logger.debug("running in debug");
}else {
    logger.setLevel('INFO');
}

global.logger = logger;

if(argv.indexOf('--project') >= 0){
    GLOBAL.pjconfig =  require('./project.debug.json')
}else {
    logger.setLevel('INFO');
    GLOBAL.pjconfig =  require('./project.json');
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

global.projectsId = '';


connect()
  .use('/badjs', connect.query())
  .use('/badjs', function (req, res) {
    global.logger.debug('===== get a message =====');

    var id ;
    if( isNaN(( id = req.query.id - 0) ) || id <=0 ||id >= 9999 || global.projectsId.indexOf(id)<0){

        res.writeHead(403, {
            'Content-Type': 'image/jpeg'
        });
        res.statusCode = 403;
        res.write("forbidden " );
        global.logger.debug("forbidden :" + req.query.id);
        res.end();
        return ;
    }

    req.query.id = id;


    try{
        firstSteam.write({req : req , data : req.query});

    }catch(e) {
        res.writeHead(403, {
            'Content-Type': 'image/jpeg'
        });
        res.statusCode = 403;
        res.write("forbidden" );

        global.logger.info("parse param  error :" + e);
        res.end();
        return ;
    }

    // response end with 204
    res.writeHead(204, {
      'Content-Type': 'image/jpeg'
    });
    res.statusCode = 204;

    global.logger.debug("===== complete a message =====");
    res.end();
  })
  .listen(80);

global.logger.info('start badjs-accepter , listen 80 ...');


setTimeout(function (){
    require('./service/ProjectService')();
},500)






