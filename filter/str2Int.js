/**
 * Created by chriscai on 2014/12/2.
 */

var map = require('map-stream');

/**
 *
 * 将某些字符串转非 整数
 * @returns {Stream}
 */
module.exports = function (nextStream) {
    var stream = map(function (data, fn) {


        var json = data.data;


        function parse2Int (str){
            var tmp = parseInt(str);
            if(isNaN(tmp)){
                return str;
            }else {
                return tmp;
            }
        }

        if(json.level){
            json.level = parse2Int(json.level)
        }

        if(json.uin){
            json.uin = parse2Int(json.uin)
        }

        if(json.colNum){
            json.colNum = parse2Int(json.colNum)
        }

        if(json.rowNum){
            json.rowNum = parse2Int(json.rowNum)
        }

        json.date = new Date - 0;

        fn(null, data);
    });
    return stream;
};
