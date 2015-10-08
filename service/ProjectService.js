/* global module */
/**
 * Created by chriscai on 2015/1/23.
 */

var fs = require('fs');
var connect = require('connect'),
    log4js = require('log4js'),
    logger = log4js.getLogger();


var ProjectService = function(clusters) {

    var dispatchCluster = function(data) {
        for (var i = 0; i < clusters.length; i++) {
            clusters[i].send(data);
        }
    };

    connect()
        .use('/getProjects', connect.query())
        .use('/getProjects', connect.bodyParser())
        .use('/getProjects', function(req, res) {
            var param = req.query;
            if (req.method === "POST") {
                param = req.body;
            }

            if (param.auth != "badjsAccepter" || !param.projectsId) {

            } else {
                dispatchCluster({
                    projectsId: param.projectsId,
                    projectsInfo: param.projectsInfo
                });

                fs.writeFile("./project.db", param.projectsId, function() {
                    logger.info('update project.db :' + param.projectsId);
                });

                fs.writeFile("./project.info", param.projectsInfo || "", function() {
                    logger.info('update project.info :' + param.projectsInfo);
                });
            }

            res.writeHead(200);
            res.end();

        })
        .listen(9001);

    var data = fs.readFileSync("./project.db", "utf-8");
    var info = fs.readFileSync("./project.info", "utf-8");


    dispatchCluster({
        projectsId: data,
        projectsInfo: info
    });

    logger.info('load project.db :' + data);
    logger.info('load project.info :' + info);
};


module.exports = ProjectService;