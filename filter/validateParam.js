/**
 * 过滤 不正确的数据
 * @returns {{process: Function}}
 */

var _ = require("underscore");

module.exports = function () {
    return {
        process : function (data){

            if(!data.data.msg){
                return false;
            }

        }
    }
};