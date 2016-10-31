var log4js = require('log4js');

var projectsBlacklistTable = {};

process.on('message', function (data) {
    var projectsInfo = JSON.parse(data.projectsInfo);
    if (typeof projectsInfo === "object") {
        // 为所有project初始化blacklistIPRegExpList ｜ blacklistUARegExpList
        for (var id in projectsInfo) {
            if (projectsInfo.hasOwnProperty(id)) {
                var project = projectsInfo[id];
                var one = {
                    blacklistIPRegExpList: [],
                    blacklistUARegExpList: []
                };
                var blacklist = JSON.parse(project['blacklist']);
                if (typeof blacklist === 'object') {
                    var blacklistIP = blacklist.ip;
                    (blacklistIP || []).forEach(function (reg) {
                        one.blacklistIPRegExpList.push(new RegExp(reg));
                    });
                    var blacklistUA = blacklist.ua;
                    (blacklistUA || []).forEach(function (reg) {
                        one.blacklistUARegExpList.push(new RegExp(reg, "i"));
                    });
                }
                projectsBlacklistTable[id] = one;
            }
        }
    }
});

/**
 * 判断是否在黑名单里
 * 黑名单列表支持正则表达式
 */
function inBlacklist(string, regExpList) {
    for (var i = 0; i < regExpList.length; i++) {
        if (regExpList[i].test(string)) {
            return true;
        }
    }
    return false;
}

/**
 * IP黑名单过滤
 */
module.exports = function () {
    return {
        process: function (data) {
            var arr = data.data;
            for (var i = 0; i < arr.length; i++) {
                var id = arr[i].id;
                var projectInfo = projectsBlacklistTable[id];
                var ip = arr[i].ip;
                var ua = arr[i].userAgent;
                if (inBlacklist(ip, projectInfo.blacklistIPRegExpList)) {
                    throw new Error('ignore request ,in Blacklist by Ip:' + id);
                }
                if (inBlacklist(ua, projectInfo.blacklistUARegExpList)) {
                    throw new Error('ignore request ,forbidden in Blacklist by userAgent:' + id);
                }
            }
        }
    };
};
