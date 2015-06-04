/**
 * Created by chriscai on 2015/6/4.
 */
var net  = require("net"),
    port =  GLOBAL.pjconfig.dispatcher.port,
    address =  GLOBAL.pjconfig.dispatcher.address,
    service =  GLOBAL.pjconfig.dispatcher.subscribe;


var log4js = require('log4js'),
    logger = log4js.getLogger();


var client = [];

net.createServer(function (c){
    logger.info('one client connected ');

    c.on('end', function() {
        var index = 0;
        for(var i = 0 ; i < client.length ; i++){
            if (client[i]._id == this._id){
                index = i;
                break;
            }
        }
        client.splice(index , 1);
        logger.info('one client closed ');
    });

    c._id= new Date - 0;
    client.push(c);

}).listen(port , address);


/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {

    return {
        process : function (data){
            data.data.forEach(function (value){
                var str = JSON.stringify(value);

                client.forEach(function (value , key ){
                    value.write(service + ' ' + str );
                })

                logger.debug('dispatcher a message : ' + 'badjs' + ' ' +  str)
            })

        }
    }
};