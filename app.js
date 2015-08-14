/* global process, global, GLOBAL */
var connect = require('connect'),
    log4js = require('log4js'),
    logger = log4js.getLogger();

var cluster = require('cluster');
var argv = process.argv.slice(2);

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
    }, 1000);

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

process.on('message', function(data) {
    var json = data;
    if (json.projectsId) {
        global.projectsId = json.projectsId;
    }
});

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
            global.projectsId.split('_').indexOf(id) < 0) {

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