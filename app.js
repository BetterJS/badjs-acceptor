/* global process, global, GLOBAL */
var connect = require('connect'),
    log4js = require('log4js'),
    fs = require("fs"),
    logger = log4js.getLogger();

var path = require("path");

var cluster = require('cluster');
var argv = process.argv.slice(2);

var REG_REFERER = /^https?:\/\/[^\/]+\//i;
var REG_DOMAIN = /^(?:https?:)?(?:\/\/)?([^\/]+\.[^\/]+)\/?/i;

if (argv.indexOf('--debug') >= 0) {
    logger.setLevel('DEBUG');
    global.debug = true;
} else {
    logger.setLevel('INFO');
}

if (argv.indexOf('--project') >= 0) {
    global.pjconfig = require(path.join(__dirname , 'project.debug.json'));
} else {
    global.pjconfig = require(path.join(__dirname , 'project.json'));
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
var interceptors = global.pjconfig.interceptors;

interceptors.forEach(function(value, key) {
    var one = require(value)();
    interceptor.add(one);
});
interceptor.add(require(global.pjconfig.dispatcher.module)());

var forbiddenData = '403 forbidden';

global.projectsInfo = {};
global.offlineAutoInfo = {};

var get_domain = function(url){
    return (url.toString().match(REG_DOMAIN) || ['', ''])[1].replace(/^\*\./, '');
};

var genBlacklistReg = function(data){
    // ip黑名单正则
    var blacklistIPRegExpList = [];
    (data.blacklist &&  data.blacklist.ip ? data.blacklist.ip : []).forEach(function (reg) {
        blacklistIPRegExpList.push(new RegExp("^" + reg.replace(/\./g , "\\.")) );
    });
    data.blacklistIPRegExpList = blacklistIPRegExpList

// ua黑名单正则
    var blacklistUARegExpList = [];
    ( data.blacklist &&   data.blacklist.ua ?  data.blacklist.ua : []).forEach(function (reg) {
        blacklistUARegExpList.push(new RegExp(reg , "i"));
    });
    data.blacklistUARegExpList = blacklistUARegExpList

};

process.on('message', function(data) {
    var json = data ,  info ;
    if(json.projectsInfo){
        info = JSON.parse(json.projectsInfo);
        if (typeof info === "object") {
            for (var k in info) {
                var v = info[k] || {};
                v.domain = get_domain(v.url);
                genBlacklistReg(v  );
            }
            global.projectsInfo = info;
        }
    }else if(json.offlineAutoInfo){
         json = data;
        info = JSON.parse(json.offlineAutoInfo);
        if (typeof info === "object") {
            global.offlineAutoInfo = info;
        }

    }
});


/**
 * 校验来源的url 是否和填写的url相同
 * @param id
 * @param req
 * @returns {boolean}
 */
var referer_match = function(id, req) {
    var referer = (((req || {}).headers || {}).referer || "").toString();

    var projectMatchDomain =  (global.projectsInfo[id.toString()] || {}).domain ;
    // no referer
    if (!referer) {
        // match match is * , no detect referer
        if(!projectMatchDomain){
            return true;
        }
        logger.debug('no referer ,  forbidden :' + req.query.id);
        return false;
    }
    var domain = (referer.match(REG_REFERER) || [""])[0] || "";
    return typeof global.projectsInfo === "object" &&
        domain.indexOf(projectMatchDomain) !== -1;
};

var reponseReject = function (req , res , responseHeader){
    responseHeader['Content-length'] = forbiddenData.length;
    res.writeHead(403, responseHeader);
    res.write(forbiddenData);
    res.end();
}

connect()
    .use('/badjs', connect.query())
    .use('/badjs', connect.bodyParser())
    .use('/badjs', function(req, res) {

        logger.debug('===== get a message =====');

        var responseHeader = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'image/jpeg',
            'Connection': 'close'
        };

        var param = req.query;
        if (req.method === "POST") {
            param = req.body;
        }

        var id = param.id - 0;
        if (isNaN(id) ||
            id <= 0 ||
            id >= 9999 ||
            !global.projectsInfo[id + ""] ||
            !referer_match(id, req)) {

            reponseReject(req , res , responseHeader);
            logger.debug('forbidden :' + param.id);

            return;
        }

        param.id = id;

        try {
            interceptor.invoke({
                req: req,
                data: param
            });
        } catch (err) {
            reponseReject(req , res , responseHeader);
            logger.debug('id ' +  param.id +' , interceptor error :' + err );
            return;
        }

        if(req.throwError){
            reponseReject(req , res , responseHeader);
            logger.debug('id ' +  param.id +' , interceptor reject :' + req.throwError);
            return;
        }

        // responseHeader end with 204
        responseHeader['Content-length'] = 0;
        res.writeHead(204, responseHeader);

        logger.debug('===== complete a message =====');
        res.end();
    })
    .use('/offlineLog', connect.bodyParser())
    .use('/offlineLog', function(req, res) {
        logger.debug('===== get offline log =====');
        var param = req.body;
        if(param.offline_log){
            try{
                var offline_log = JSON.parse(param.offline_log);
                var filePath = path.join(__dirname  , 'offline_log' , offline_log.id +"");
                var fileName = offline_log.uin + "_"+offline_log.startDate + "_" + offline_log.endDate;
                if(!fs.existsSync(filePath)){
                    fs.mkdirSync(filePath)
                }
                fs.writeFile( path.join(filePath , fileName ) , param.offline_log)

                logger.info('get offline log : ' + path.join(filePath , fileName ));
            }catch(e){
                logger.warn(e);
            }
        }

        res.end()

    })
    .use('/offlineAuto', connect.query())
    .use('/offlineAuto', function(req, res) {
        logger.debug('===== getofflineAuto =====');
        var param = req.query, result =false;
        if(param.id && param.uin && global.offlineAutoInfo[param.id + "_" + param.uin]){
            logger.info('reponse auto offline auto  : ' + (param.id + "_" + param.uin));
            result = true;
        }
        res.write("window && window._badjsOfflineAuto && window._badjsOfflineAuto("+result+");")
        res.end()
    })
    .listen(global.pjconfig.port);

logger.info('start badjs-accepter , listen ' + global.pjconfig.port + ' ...');
