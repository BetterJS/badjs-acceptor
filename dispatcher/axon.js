var zmq = require('axon')
    , client = zmq.socket('push')
    , port =  GLOBAL.pjconfig.dispatcher.port
    , address =  GLOBAL.pjconfig.dispatcher.address
    , service =  GLOBAL.pjconfig.dispatcher.subscribe;

var log4js = require('log4js'),
    logger = log4js.getLogger();


client.connect("tcp://" + address + ":" + port);


/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {

    return {
        process : function (data){
            data.data.forEach(function (value){
                var str = JSON.stringify(value)
                client.send(service + value.id + '| ' + str );
                logger.debug('dispatcher a message : ' + 'badjs' + ' ' +  str);
            })

        }
    }
};