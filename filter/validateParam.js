/**
 * 过滤 不正确的数据
 * @returns {{process: Function}}
 */

module.exports = function () {
    return {
        process : function (data){

            if(!data.data.msg){
                return false;
            }

        }
    }
};