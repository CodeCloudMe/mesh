(function() {
  var async, fs, ncp, path, _;

  ncp = require("ncp").ncp;

  _ = require("underscore");

  fs = require("fs");

  async = require("asyncjs");

  path = require("path");

  module.exports = function(router, params) {
    var bootstrapDir, bootstrapSrcDir;
    bootstrapDir = params.dir;
    bootstrapSrcDir = bootstrapDir + "/src";
    return router.on({
      /*
      		 bootstraps a program by copying the target platform
      		 over to a new directory
      */
      "pull \		copy/platforms -> \		fill/templates -> \			build/makefile -> \				bootstrap": function(req, res) {
        return console.log("bootstrapped!");
      },
      /*
      		 copies the target platforms from the scaffolding directory
      		 over to the output dir
      */
      "pull v/output -> platform/dirs -> copy/platforms": function(req, res, mw) {
        var dir, output, platforms, toCopy, _i, _len, _ref;
        platforms = mw.data('platforms') || [];
        output = mw.data('output') + "/src";
        toCopy = [];
        _ref = req.sanitized.platformDirs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dir = _ref[_i];
          if (_.intersection(platforms, dir.split(" ")).length) {
            toCopy.push("" + bootstrapSrcDir + "/" + dir);
          }
        }
        async.list(toCopy).each(function(dir, next) {
          return ncp(dir, "" + output + "/" + (path.basename(dir)), next);
        }).end(res.success(function() {
          return console.log("COPIED");
        }));
        console.log("copying target platforms");
        return mw.next();
      },
      /*
      		 builds a makefile for the target platforms located in the output directory
      */
      "pull build/makefile": function(req, res, mw) {
        console.log("building makefile");
        return mw.next();
      },
      /*
      		 returns the platform directories
      */
      "pull platform/dirs": function(req, res, mw) {
        var allDirs;
        allDirs = [];
        return fs.readdir(bootstrapSrcDir, res.success(function(dirs) {
          var dir, _i, _len;
          for (_i = 0, _len = dirs.length; _i < _len; _i++) {
            dir = dirs[_i];
            if (dir.substr(0, 1) === ".") continue;
            allDirs.push(dir);
          }
          req.sanitized.platformDirs = allDirs;
          if (!mw.next()) return res.end(allDirs);
        }));
      },
      /*
      		 returns the available platforms
      */
      "pull platform/dirs -> platforms": function(req, res, mw) {
        var allDirs, dir, _i, _len, _ref;
        allDirs = [];
        _ref = mw.sanitized.platformDirs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dir = _ref[_i];
          allDirs = allDirs.concat(dir.split(" "));
        }
        req.sanitized.platforms = allDirs = _.uniq(allDirs);
        if (!mw.next()) return res.end(allDirs);
      }
    });
  };

}).call(this);
