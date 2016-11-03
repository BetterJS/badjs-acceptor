

var log4js = require('log4js'),
    logger = log4js.getLogger();


// 黑名单配置
var blacklistIP = global.pjconfig['blackList'] ? global.pjconfig['blackList'].ip : [] ;
var blacklistUA = global.pjconfig['blackList'] ? global.pjconfig['blackList'].ua  : [];

// ip黑名单正则
var blacklistIPRegExpList = [];
(blacklistIP || []).forEach(function (reg) {
    blacklistIPRegExpList.push( new RegExp("^" + reg.replace(/\./g , "\\.")) );
});

// ua黑名单正则
var blacklistUARegExpList = [];
(blacklistUA || []).forEach(function (reg) {
    blacklistUARegExpList.push(new RegExp(reg , "i"));
});

/**
 * 判断是否在黑名单里
 * 黑名单列表支持正则表达式
 * @param ip 请求的ip
 * @return {boolean} 是否在黑名单里
 */
function inBlacklist(ip , regExpList) {
    for (var i = 0; i < regExpList.length; i++) {
        if (regExpList[i].test(ip)) {
            return true;
        }
    }
    return false;
}

/**
 * Created by halwu
 * IP黑名单过滤
 */
module.exports = function () {
    return {
        process: function (data) {
            var arr = data.data;
            for (var i = 0; i < arr.length; i++) {
                var ip = arr[i].ip;
                var ua = arr[i].userAgent;
                if (inBlacklist(ip , blacklistIPRegExpList)) {
                    logger.debug('ignore request ,  in Blacklist by Ip:' + ip);
                    data.req.throwError = "global_blackList_ip"
                    return false;
                }
                if (inBlacklist(ua , blacklistUARegExpList)) {
                    logger.debug('ignore request ,forbidden in Blacklist by userAgent :' + ua);
                    data.req.throwError = "global_blackList_ua"
                     return false;
                }

                var pBlacklistIPRegExpList = global.projectsInfo[arr[i].id].blacklistIPRegExpList;
                if(pBlacklistIPRegExpList && pBlacklistIPRegExpList.length && inBlacklist(ip , pBlacklistIPRegExpList)){
                    logger.debug('ignore request ,  in pBlacklist by Ip:' + ip);
                    data.req.throwError = "project_blackList_ip"
                    return false;
                }

                var pBlacklistUARegExpList = global.projectsInfo[arr[i].id].blacklistUARegExpList;
                if(pBlacklistUARegExpList && pBlacklistUARegExpList.length && inBlacklist(ua , pBlacklistUARegExpList)){
                    logger.debug('ignore request ,  in pBlacklist by ua:' + ua);
                    data.req.throwError = "project_blackList_ua"
                    return false;
                }

            }
        }
    };
};
