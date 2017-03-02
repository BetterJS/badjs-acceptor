var _ = require("underscore");

var has = function(obj, key) {
    return obj !== null && hasOwnProperty.call(obj, key);
};

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
module.exports = function() {
    return {
        process: function(data) {
            var queryData = data.data;
            var newData = data.data = [];

            if (!queryData.count) { // without combo
                newData.push(queryData);
            } else { // with combo

                // default param
                var fixedParam = {
                    id: queryData.id,
                    uin: queryData.uin,
                };

                if(_.isString(queryData.from)){
                    fixedParam.from = queryData.from
                }

                //delete queryData.id;
                //delete queryData.uin;
                // delete queryData.from;
                //delete queryData.count;

                var queryArray = [];
                for (var key in queryData) {
                    _.isArray(queryData[key]) && queryData[key].forEach(function(value, index) {
                        queryArray[index] = queryArray[index] || {};
                        queryArray[index][key] = value;
                    });
                }

                // extend default params
                queryArray.forEach(function(value, index) {
                    newData.push(extend(value, fixedParam));
                });
            }
        }
    };
};
