'use strict';

var connect = require('connect')
    , firstSteam = null;


var filters = ['./filter/comboPreprocess'  , './filter/addExtStream' , './filter/excludeParam' , './dispatcher/zmq'];



//var aa  = require('./filter/comboPreprocess')();
//var bb =  require('./filter/addExtStream')();
//var cc =  require('./filter/excludeParam')();
//aa.pipe(bb);
//bb.pipe)_
//firstSteam = aa;
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
    console.log('get a request')
    if(req.query.id <=0){
        res.writeHead(403, {
            'Content-Type': 'text/html'
        });
        res.statusCode = 403;
        res.write("id is required");
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
        return ;
    }
    // write data

    // response end with 204
    res.writeHead(204, {
      'Content-Type': 'image/jpeg'
    });
    res.statusCode = 204;
    res.end();
  }).listen(80);