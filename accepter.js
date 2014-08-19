'use strict';

var connect = require('connect')
  , stream = require('./lib/stream')
  , dispatcher = require('./dispatcher/redis');

connect()
  .use('/badjs', connect.query())
  .use('/badjs', function (req, res) {

    // make a EventStream
    stream(req)
      // use redis to dispatch
      .pipe(dispatcher());

    // response end with 204
    res.writeHead(204, {
      'Content-Type': 'image/jpeg'
    });
    res.statusCode = 204;
    res.end();
  }).listen(8000);