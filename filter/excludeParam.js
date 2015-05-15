
/**
 *
 * 排除 _ 开头的参数
 * @returns {Stream}
 */
module.exports = function (nextStream) {
    return {
        process : function (data){
            for(var key in data.data ){
                if(/^_.+/.test(key)){
                    delete data.data[key];
                }
            }

        }
    }
};