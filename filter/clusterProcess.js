
/**
 *
 * 排除 _ 开头的参数
 * @returns {Stream}
 */
module.exports = function () {
    return {
        process : function (data){
            process.send({"msg" : data.data});
        }
    }
};