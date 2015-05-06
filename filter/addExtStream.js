
/**
 * 添加服务器参数
 * @param {Request} req
 * @returns {Stream}
 */
module.exports = function (nextStream) {

    function getClientIp(req) {
        try{
            return req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
        }catch(e){

        }
        return "0.0.0.0";
    };

    return {
        preProcess : function (data){

        },

        process : function (data){
            data.data.ip = getClientIp(data.req);
            data.data.userAgent = data.req.headers['user-agent'];
        }
    }
};