var map = require('map-stream')
  , zmq = require('zmq')
  , client = zmq.socket('pub')
  , port =  GLOBAL.pjconfig.zmq.url
  , service =  GLOBAL.pjconfig.zmq.subscribe;

var log4js = require('log4js'),
    logger = log4js.getLogger();

client.bind(port, function (err) {
  if (err) throw err;
});


/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (data, fn) {
    client.send(service + ' ' +  JSON.stringify(data.data));

      logger.debug('dispatcher a message : ' + 'badjs' + ' ' +  JSON.stringify(data.data))
  });
  return stream;
};