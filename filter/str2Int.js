/**
 * Created by chriscai on 2014/12/2.
 * 将某些字符串转非 整数
 * @returns {Stream}
 */
module.exports = function () {
    return {
        process : function (data){

            function parse2Int (str){
                var tmp = parseInt(str);
                if(isNaN(tmp)){
                    return str;
                }else {
                    return tmp;
                }
            }

            data.data.forEach(function (value){

                if(value.level){
                    value.level = parse2Int(value.level);
                }

                if(value.colNum){
                    value.colNum = parse2Int(value.colNum);
                }

                if(value.rowNum){
                    value.rowNum = parse2Int(value.rowNum);
                }

                value.date = new Date - 0;
            });

        }
    };
};
