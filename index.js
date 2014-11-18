'use strict';

var connect = require('connect')
    // make a EventStream
  , stream = require('./lib/stream')()
  , dispatcher = require('./dispatcher/zmq');

// use zmq to dispatch
stream.pipe(dispatcher());



var has = function (obj , key){
    return obj != null && hasOwnProperty.call(obj, key);
}

var extend = function(obj) {

    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            if (hasOwnProperty.call(source, prop)) {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};

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
        if(!req.query.count){
            stream.write(req);
        }else {
            var fixedParam = {id : req.query.id , from: req.query.from , uin : req.query.uin};
            var queryArray = [];
            delete req.query.id;
            delete req.query.from;
            delete req.query.uin;
            delete req.query.count;
            for(var key in req.query){
                req.query[key].forEach(function (value , index ){
                 if(!queryArray[index]){
                     queryArray[index] = {};
                 }
                    queryArray[index][key] = value;
                })
            }

            queryArray.forEach(function (value , index){
                stream.write(extend(value , fixedParam));
            })
        }
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
  }).listen(8000);