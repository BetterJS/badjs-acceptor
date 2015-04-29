var map = require('map-stream');

var _ = require("underscore");

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

/**
 *
 * 合并预处理
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (data, fn) {

      var queryData = data.data;

      if(!queryData.count){
          fn(null, data);
      }else {
          var fixedParam = {id : queryData.id , from: queryData.from , uin : queryData.uin};
          var queryArray = [];
          delete queryData.id;
          delete queryData.from;
          delete queryData.uin;
          delete queryData.count;
          for(var key in queryData){
              if (!_.isArray(queryData[key])) {
                  continue;
              }
              queryData[key].forEach(function (value , index ){
                  if(!queryArray[index]){
                      queryArray[index] = {};
                  }
                  queryArray[index][key] = value;
              })
          }

          queryArray.forEach(function (value , index){
              data.data =   extend(value , fixedParam);
              fn(null, data);
//              stream.write(extend(value , fixedParam));
          })
      }

  });
  return stream;
};