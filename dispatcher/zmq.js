var map = require('map-stream')
  , zmq = require('zmq')
  , client = zmq.socket('pub')
  , port = 'tcp://127.0.0.1:10000';

client.bind(port, function (err) {
  if (err) throw err;
});


/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (data, fn) {
    client.send('badjs' + ' ' +  JSON.stringify(data.data));
  });
  return stream;
};