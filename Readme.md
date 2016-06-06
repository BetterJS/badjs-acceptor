#badjs-accpeter

> Accept log by client report, filter log and dispatch to message-queue


# 启动参数
--debug  log 采用debug 级别 , 默认使用info 

--project 使用测试环境（ project.debug.json ）配置 ， 默认使用 project.json

# 配置说明
```
{
    "port" : 80,  // 启动端口
    "dispatcher": {   //推送日志给那台机器，这里配置推送给 badjs-mq
        "port": 10001,   
        "address": "127.0.0.1",
        "subscribe": "badjs",       //数据分发采用 pub/sub 模块，这个是 subscriber 需要 subscribe 的 key 
        "module" : "./dispatcher/axon"  // 指定 mq 模块
    },
    "interceptors" : 
            [
            "./filter/comboPreprocess"  ,
            "./filter/addExtStream" ,
            "./filter/excludeParam"  ,
            "./filter/str2Int"  
            ]
}
```


