/**
 * 过滤 不正确的数据
 * @returns {{process: Function}}
 */



var log4js = require('log4js'),
    logger = log4js.getLogger();

var _ = require("underscore");

module.exports = function () {
    return {
        process : function (data){

            if(!data.data.msg){
                logger.debug('ignore request  not msg  :' + data.data.id);
                data.req.throwError = "msg_is_null"
                return false;
            }

        }
    }
};