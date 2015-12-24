/* global module */
/**
 * Created by chriscai on 2015/1/23.
 */

var fs = require('fs');
var connect = require('connect'),
    log4js = require('log4js'),
    logger = log4js.getLogger();

var path = require("path");

var dbPath = path.join(__dirname  , ".." , "project.db");


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

            if (param.auth != "badjsAccepter" || !param.projectsInfo) {

            } else {
                dispatchCluster({
                    projectsInfo: param.projectsInfo
                });

                fs.writeFile(dbPath, param.projectsInfo || "", function() {
                    logger.info('update project.db :' + param.projectsInfo);
                });
            }

            res.writeHead(200);
            res.end();

        })
        .listen(9001);

    var info = fs.readFileSync(dbPath, "utf-8");


    dispatchCluster({
        projectsInfo: info
    });

    logger.info('load project.db :' + info);
};


module.exports = ProjectService;