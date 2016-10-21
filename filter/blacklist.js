// 黑名单配置
var blacklist = global.pjconfig['blacklist'] || [];
// 黑名单正则
var blacklistRegExpList = [];
blacklist.forEach(function (reg) {
    blacklistRegExpList.push(new RegExp(reg));
});

/**
 * 判断ip是否在黑名单里
 * 黑名单列表支持正则表达式
 * @param ip 请求的ip
 * @return {boolean} 是否在黑名单里
 */
function inBlacklist(ip) {
    for (var i = 0; i < blacklistRegExpList.length; i++) {
        if (blacklistRegExpList[i].test(ip)) {
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
                if (inBlacklist(ip)) {
                    throw new Error('请求IP ' + ip + ' 在黑名单内，被拦截。');
                }
            }
        }
    };
};
