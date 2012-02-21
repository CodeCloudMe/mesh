(function() {
  var fs, mergeDirs, mkdirp, npm, path, step, walkr, _;

  _ = require("underscore");

  fs = require("fs");

  path = require("path");

  mkdirp = require("mkdirp");

  step = require("stepc");

  npm = require("npm");

  mergeDirs = require("../../utils/mergeDirs");

  walkr = require("walkr");

  exports.plugin = function(router, params) {
    var bootstrapDir, bootstrapSrcDir;
    bootstrapDir = params.dir;
    bootstrapSrcDir = bootstrapDir + "/src";
    return router.on({
      /*
      		 bootstraps a program by copying the target platform
      		 over to a new directory
      */
      "pull \		copy/platforms -> \				bootstrap": function(req, res) {
        return console.log("bootstrapped!");
      },
      /*
      		 copies the target platforms from the scaffolding directory
      		 over to the output dir
      */
      "pull v/output -> copy/platforms": function(req, res, mw) {
        var data, output, platforms;
        output = mw.data('output');
        platforms = req.query.platforms || [];
        console.log("copying target platforms");
        data = _.defaults(mw.data(), {
          defaultPlatform: "node"
        });
        return step.async(function() {
          return mergeDirs(bootstrapSrcDir, platforms).filterFile(mergeDirs.parseTemplate(data)).copyEach(output + "/src").complete(this);
        }, function() {
          return walkr(bootstrapDir, output).filter(function(options, next) {
            return next(options.source === bootstrapDir || !options.stat.isDirectory());
          }).filterFile(walkr.parseTemplate(data)).filter(walkr.copy).start(this);
        }, function(e) {
          if (!mw.next()) return res.end(true);
        });
      }
    });
  };

}).call(this);
