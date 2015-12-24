var map = require('map-stream')
  , redis = require('redis')
  , client = redis.createClient();

/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (data, fn) {
    client.publish('badjs', JSON.stringify(data));
  });
  return stream;
};