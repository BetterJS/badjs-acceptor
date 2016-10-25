// 黑名单配置
var blacklistIP = global.pjconfig['blackList'] ? global.pjconfig['blackList'].ip : [] ;
var blacklistUA = global.pjconfig['blackList'] ? global.pjconfig['blackList'].ua  : [];

// ip黑名单正则
var blacklistIPRegExpList = [];
(blacklistIP || []).forEach(function (reg) {
    blacklistIPRegExpList.push(new RegExp(reg));
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
                    throw new Error(ip + ' in blacklist  , forbidden。');
                }
                if (inBlacklist(ua , blacklistUARegExpList)) {
                    throw new Error(ua + ' in blacklist  , forbidden。');
                }
            }
        }
    };
};