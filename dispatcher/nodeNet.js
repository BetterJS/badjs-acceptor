/**
 * Created by chriscai on 2015/6/4.
 */
var net  = require("net"),
    port =  GLOBAL.pjconfig.dispatcher.port,
    address =  GLOBAL.pjconfig.dispatcher.address,
    service =  GLOBAL.pjconfig.dispatcher.subscribe;


var log4js = require('log4js'),
    logger = log4js.getLogger();


var clients = [];

var close = function (){
    var index = 0;
    for(var i = 0 ; i < clients.length ; i++){
        if (clients[i]._id == this._id){
            index = i;
            break;
        }
    }
    var closedClient = clients.splice(index , 1);
    if(closedClient && closedClient.length >= 0 ){
        closedClient[0].end();
    }
    logger.info('one client closed ');
}

net.createServer(function (c){
    logger.info('one client connected ');


    c.on('end', function() {
        close.apply(this);

    });

    c.on("error" , function (e){
        close.apply(this);
    });



    c._id= new Date - 0;
    clients.push(c);

}).listen(port , address);

logger.info('dispatcher of  server starting... , listen ' + port);

/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {



    return {
        process : function (data){
            data.data.forEach(function (value){
                var str = JSON.stringify(value);

                clients.forEach(function (value , key ){
                    value.write(service + ' ' + str  + String.fromCharCode(0x03) ) ;
                });

                logger.debug('dispatcher a message : ' + 'badjs' + ' ' +  str)
            })

        }
    }
};