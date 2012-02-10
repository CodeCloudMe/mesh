(function() {
  var async, fs, mkdirp, ncp, path, rmdirr, step, _;

  mkdirp = require("mkdirp");

  ncp = require("ncp").ncp;

  step = require("stepc");

  async = require("async");

  fs = require("fs");

  _ = require("underscore");

  path = require("path");

  rmdirr = require("rmdirr");

  exports.plugin = function(router) {
    return router.on({
      /*
      		 Merges two directories together
      */
      "pull merge": function(req, res, mw) {
        var input, output, platform;
        output = mw.data('output');
        input = mw.data('input');
        platform = mw.data('platform').split('+');
        return step.async(function() {
          console.log("rm " + output);
          return rmdirr(output, this);
        }, function() {
          console.log("mk " + output);
          return mkdirp(output, 0777, res.success(this));
        }, function() {
          console.log("finding sources");
          return router.request("target/platform/dirs").query({
            platformDir: input,
            platforms: platform
          }).response(res.success(this)).pull();
        }, function(dirs) {
          var _this = this;
          console.log("merging sources");
          return async.forEach(dirs, function(dir, next) {
            return ncp(dir, output, next);
          }, res.success(function() {
            return _this(dirs);
          }));
        }, function(dirs) {
          var dir, meshFiles, _i, _len;
          console.log("finding mesh configs");
          meshFiles = [];
          for (_i = 0, _len = dirs.length; _i < _len; _i++) {
            dir = dirs[_i];
            meshFiles.push("" + dir + "/mesh.json");
          }
          return async.filter(meshFiles, path.exists, this);
        }, function(meshFiles) {
          var _this = this;
          console.log("merging mesh configs");
          return async.map(meshFiles, fs.readFile, res.success(function(results) {
            var cfg, str, _i, _len;
            cfg = [];
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              str = results[_i];
              try {
                cfg.push(JSON.parse(str.toString()));
              } catch (e) {
                throw new Error("unable to parse mesh file");
              }
            }
            return _this(_.extend.apply(null, cfg));
          }));
        }, function(meshConfig) {
          console.log("writing mesh config");
          return fs.writeFile("" + output + "/mesh.json", JSON.stringify(meshConfig, null, 2), this);
        }, function() {
          return res.end(true);
        });
      }
    });
  };

}).call(this);
