/* global process, global, GLOBAL */
var connect = require('connect'),
    log4js = require('log4js'),
    logger = log4js.getLogger();

var cluster = require('cluster');
var argv = process.argv.slice(2);

var REG_REFERER = /^https?:\/\/[^\/]+\//i;

if (argv.indexOf('--debug') >= 0) {
    logger.setLevel('DEBUG');
    global.debug = true;
} else {
    logger.setLevel('INFO');
}

if (argv.indexOf('--project') >= 0) {
    GLOBAL.pjconfig = require('./project.debug.json');
} else {
    GLOBAL.pjconfig = require('./project.json');
}

if (cluster.isMaster) {

    var clusters = [];
    // Fork workers.
    for (var i = 0; i < 4; i++) {
        var forkCluster = cluster.fork();
        clusters.push(forkCluster);
    }

    setTimeout(function() {
        require('./service/ProjectService')(clusters);
    }, 3000);

    return;
}

var interceptor = require('c-interceptor')();
var interceptors = GLOBAL.pjconfig.interceptors;

interceptors.forEach(function(value, key) {
    var one = require(value)();
    interceptor.add(one);
});
interceptor.add(require(GLOBAL.pjconfig.dispatcher.module)());

var forbiddenData = '403 forbidden';

global.projectsId = '';
global.projectsInfo = {};

process.on('message', function(data) {
    var json = data;
    if (json.projectsId) {
        var map = {};
        var pids = [];
        json.projectsId.split("_").forEach(function(value) {
            var pid_appkey = value.split("|");
            var pid = pid_appkey[0] + "";
            var appkey = pid_appkey[1] + "";
            if (pid && appkey) {
                pids.push(pid);
                map[pid] = appkey;
            }
        });
        global.projectsId = map;
    }
    if (json.projectsInfo) {
        try {
            var info = JSON.parse(json.projectsInfo);
            if (typeof info === "object") {
                for (var k in info) {
                    var v = info[k] || {};
                    v.referer = (v.url.toString().match(REG_REFERER) || [])[0];
                }
                global.projectsInfo = info;
            }
        } catch (error) {}
    }
});

var referer_match = function(id, req) {
    var referer = ((req || {}).headers || {}).referer.toString().match(REG_REFERER) || "";
    return typeof global.projectsInfo === "object" &&
        referer[0] === (global.projectsInfo[id.toString()] || {}).referer;
};

connect()
    .use('/badjs', connect.query())
    .use('/badjs', function(req, res) {

        logger.debug('===== get a message =====');

        var responseHeader = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'image/jpeg',
            'Connection': 'close'
        };

        var id = req.query.id - 0;
        if (isNaN(id) ||
            id <= 0 ||
            id >= 9999 ||
            !global.projectsId[id + ""] ||
            !referer_match(id, req)) {

            responseHeader['Content-length'] = forbiddenData.length;
            res.writeHead(403, responseHeader);
            res.write(forbiddenData);
            logger.debug('forbidden :' + req.query.id);
            res.end();
            return;
        }

        req.query.id = id;

        try {
            interceptor.invoke({
                req: req,
                data: req.query
            });
        } catch (err) {
            responseHeader['Content-length'] = forbiddenData.length;
            res.writeHead(403, responseHeader);
            res.write(forbiddenData);
            logger.info('parse param  error :' + err);
            res.end();
            return;
        }

        // responseHeader end with 204
        responseHeader['Content-length'] = 0;
        res.writeHead(204, responseHeader);

        logger.debug('===== complete a message =====');
        res.end();
    })
    .listen(GLOBAL.pjconfig.port);

logger.info('start badjs-accepter , listen ' + GLOBAL.pjconfig.port + ' ...');