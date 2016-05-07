/* global module */
/**
 * 添加服务器参数
 * @param {Request} req
 * @returns {Stream}
 */
module.exports = function() {

    function getClientIp(req) {
        try {
            var xff = (
                req.headers['X-Forwarded-For'] ||
                req.headers['x-forwarded-for'] ||
                ''
            ).split(',')[0].trim();

            return xff ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
        } catch (ex) {

        }
        
        return "0.0.0.0";
    }

    return {
        preProcess: function(data) {

        },

        process: function(data) {
            data.data.forEach(function(value) {
                value.ip = getClientIp(data.req);
                value.userAgent = data.req.headers['user-agent'];
            });

        }
    };
};