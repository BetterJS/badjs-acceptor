'use strict';

var connect = require('connect')
    // make a EventStream
  , stream = require('./lib/stream')()
  , dispatcher = require('./dispatcher/zmq');

// use zmq to dispatch
stream.pipe(dispatcher());

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
    // write data
    stream.write(req);

    // response end with 204
    res.writeHead(204, {
      'Content-Type': 'image/jpeg'
    });
    res.statusCode = 204;
    res.end();
  }).listen(8000);