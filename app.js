'use strict';

var connect = require('connect')
    , log4js = require('log4js'),
     logger = log4js.getLogger();

var interceptor = require("c-interceptor")();

var argv = process.argv.slice(2);


if(argv.indexOf('--debug') >= 0){
    logger.setLevel('DEBUG');
    global.debug = true;
}else {
    logger.setLevel('INFO');
}


if(argv.indexOf('--project') >= 0){
    GLOBAL.pjconfig =  require('./project.debug.json')
}else {
    GLOBAL.pjconfig =  require('./project.json');
}


var interceptors = ['./filter/comboPreprocess'  , './filter/addExtStream' , './filter/excludeParam'  , './filter/str2Int' , './dispatcher/zmq'];



interceptors.forEach(function (value ,key){
    var one = require(value)();
    interceptor.add(one);
});

global.projectsId = '';


connect()
  .use('/badjs', connect.query())
  .use('/badjs', function (req, res) {


    logger.debug('===== get a message =====');

    var id ;
    if( isNaN(( id = req.query.id - 0) ) || id <=0 ||id >= 9999 || global.projectsId.indexOf(id)<0){

        res.writeHead(403, {
            'Content-Type': 'image/jpeg'
        });
        res.statusCode = 403;
        res.write("forbidden " );
        logger.debug("forbidden :" + req.query.id);
        res.end();
        return ;
    }

    req.query.id = id;


    try{
        interceptor.invoke({req : req , data : req.query});

    }catch(e) {
        res.writeHead(403, {
            'Content-Type': 'image/jpeg'
        });
        res.statusCode = 403;
        res.write("forbidden" );

        logger.info("parse param  error :" + e);
        res.end();
        return ;
    }

    // response end with 204
    res.writeHead(204, {
      'Content-Type': 'image/jpeg'
    });
    res.statusCode = 204;

    logger.debug("===== complete a message =====");
    res.end();
  })
  .listen(8080);

logger.info('start badjs-accepter , listen 80 ...');


setTimeout(function (){
    require('./service/ProjectService')();
},500)






