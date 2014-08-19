var map = require('map-stream');

/**
 * stream
 * @param {Request} req
 * @returns {Stream}
 */
module.exports = function (req) {
  var stream = map(function (req, fn) {
    fn(null, req.query);
  });
  process.nextTick(function () {
    stream.write(req);
  });
  return stream;
};