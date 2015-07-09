var zmq = require('zmq')
  , client = zmq.socket('pub')
  , port =  GLOBAL.pjconfig.dispatcher.port
  , address =  GLOBAL.pjconfig.dispatcher.address
  , service =  GLOBAL.pjconfig.dispatcher.subscribe;

var log4js = require('log4js'),
    logger = log4js.getLogger();

client.bind("tcp://" + address + ":" + port, function (err) {
  if (err) throw err;
});


/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {

  return {
      process : function (data){
          data.data.forEach(function (value){
              var str = JSON.stringify(value)
              client.send(service + value.id + ' ' + str );

              logger.debug('dispatcher a message : ' + 'badjs' + ' ' +  str);
          })

      }
  }
};