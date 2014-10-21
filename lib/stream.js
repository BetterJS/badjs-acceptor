var map = require('map-stream');

/**
 * stream
 * @param {Request} req
 * @returns {Stream}
 */
module.exports = function () {

    function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    };

    var stream = map(function (req, fn) {
        req.query.ip = getClientIp(req);
        req.query.userAgent = req.headers['user-agent'];
        fn(null, req.query);
    });
    return stream;
};