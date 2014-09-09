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

    // write data
    stream.write(req);

    // response end with 204
    res.writeHead(204, {
      'Content-Type': 'image/jpeg'
    });
    res.statusCode = 204;
    res.end();
  }).listen(8000);