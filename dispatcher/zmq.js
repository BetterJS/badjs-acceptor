var zmq = require('zmq')
  , client = zmq.socket('pub')
  , port =  GLOBAL.pjconfig.zmq.url
  , service =  GLOBAL.pjconfig.zmq.subscribe;

var log4js = require('log4js'),
    logger = log4js.getLogger();

client.bind(port, function (err) {
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
              client.send(service + ' ' + str );

              logger.debug('dispatcher a message : ' + 'badjs' + ' ' +  str)
          })

      }
  }
};