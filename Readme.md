#badjs-accpeter

> Accept log by client report, filter log and dispatch to message-queue
```
{
    "port" : 80,  // 启动端口
    "dispatcher": {   //推送日志给那台机器，这里配置推送给 badjs-mq
        "port": 10001,   
        "address": "127.0.0.1",
        "subscribe": "badjs",           //数据分发采用 pub/sub 模块，这个是 subscriber 需要 subscribe 的 key 
        "module" : "./dispatcher/zmq"  // 使用什么模块进行推送
    },
    "interceptors" : ["./filter/comboPreprocess"  , "./filter/addExtStream" , "./filter/excludeParam"  , "./filter/str2Int"  ]
}
```
