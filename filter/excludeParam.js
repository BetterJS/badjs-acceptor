var map = require('map-stream');

/**
 *
 * 排除 _ 开头的参数
 * @returns {Stream}
 */
module.exports = function (nextStream) {
  var stream = map(function (data, fn) {

      for(var key in data.data ){
            if(/_.+/.test(key)){
                delete data.data[key];
            }
      }

      fn(null, data);
  });
  return stream;
};