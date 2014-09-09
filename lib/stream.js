var map = require('map-stream');

/**
 * stream
 * @param {Request} req
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (req, fn) {
    fn(null, req.query);
  });
  return stream;
};