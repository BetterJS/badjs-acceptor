/**
 *
 * 排除 _ 开头的参数
 * @returns {Stream}
 */
module.exports = function () {
    return {
        process : function (data){
            data.data.forEach(function (value){
                for(var key in value ){
                    if(/^_.+/.test(key)){
                        delete value[key];
                    }
                }
            })
        }
    }
};