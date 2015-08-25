
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
  return {
      process : function (data){
          var queryData = data.data;
          data.data = [];

          if(!queryData.count){
              data.data.push( queryData)
          }else {
              var fixedParam = {id : queryData.id , from: queryData.from , uin : queryData.uin , ext : queryData.ext || "{}"};
              var queryArray = [];
              if(_.isArray( fixedParam.ext)){
                  delete fixedParam.ext;
              }
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
                  data.data.push(extend(value , fixedParam));
              })
          }
      }
  }
};