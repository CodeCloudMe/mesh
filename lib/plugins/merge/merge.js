(function() {
  var async, fs, merge, mkdirp, ncp, outcome, path, readMeshConfig, rmdirr, step, _;

  mkdirp = require("mkdirp");

  ncp = require("ncp").ncp;

  step = require("stepc");

  async = require("async");

  fs = require("fs");

  _ = require("underscore");

  path = require("path");

  rmdirr = require("rmdirr");

  outcome = require("outcome");

  /*
  */

  readMeshConfig = function(meshPath, callback) {
    return fs.readFile(meshPath, "utf8", function(err, content) {
      var config, loaded;
      config = content ? JSON.parse(content) : {};
      loaded = {};
      loaded.path = meshPath;
      loaded.dir = path.dirname(meshPath);
      loaded.src = path.normalize(config.src ? "" + loaded.dir + "/" + config.src : loaded.dir);
      loaded.lib = path.normalize(config.src ? "" + loaded.dir + "/" + config.lib : loaded.dir);
      loaded.merge = path.normalize(config.src ? "" + loaded.dir + "/" + config.merge : loaded.dir);
      loaded.original = config;
      return callback(null, loaded);
    });
  };

  /*
  */

  module.exports = merge = function(ops, callback) {
    var input, outputDir, platform, res, router, sourceDir;
    res = outcome.error(callback);
    input = ops.input;
    platform = ops.platform;
    router = ops.router;
    sourceDir = null;
    outputDir = ops.output ? "" + ops.output + "/" + platform : null;
    return step.async(function() {
      return readMeshConfig("" + input + "/mesh.json", res.success(this));
    }, function(config) {
      sourceDir = config.src;
      outputDir = outputDir || path.normalize("" + config.merge + "/" + platform);
      return this();
    }, function() {
      console.log("rm " + outputDir);
      return rmdirr(outputDir, this);
    }, function() {
      console.log("mk " + outputDir);
      return mkdirp(outputDir, 0777, res.success(this));
    }, function() {
      console.log("finding sources");
      return router.request("target/platform/dirs").query({
        platformDir: sourceDir,
        platforms: [platform]
      }).response(res.success(this)).pull();
    }, function(dirs) {
      var dir, meshFiles, _i, _len;
      console.log("reading mesh configs");
      meshFiles = [];
      for (_i = 0, _len = dirs.length; _i < _len; _i++) {
        dir = dirs[_i];
        meshFiles.push("" + dir + "/mesh.json");
      }
      return async.map(meshFiles, readMeshConfig, res.success(this));
    }, function(meshConfigs) {
      targetConfig;
      var i, meshConfig, srcDir, targetConfig, _len,
        _this = this;
      for (i = 0, _len = meshConfigs.length; i < _len; i++) {
        meshConfig = meshConfigs[i];
        if (path.basename(meshConfig.dir) === platform) {
          targetConfig = meshConfig;
          break;
        }
      }
      if (!targetConfig) {
        return callback(new Error("platform \"" + platform + "\" does not exist for \"" + input + "\""));
      }
      meshConfigs.splice(i, 1);
      srcDir = path.normalize("" + outputDir + "/" + (targetConfig.original.src || ''));
      return mkdirp(srcDir, 0777, res.success(function() {
        return ncp(targetConfig.dir, outputDir, res.success(function() {
          return _this(meshConfigs, targetConfig, srcDir);
        }));
      }));
    }, function(meshConfigs, mainConfig, srcDir) {
      var _this = this;
      console.log("merging sources");
      return async.forEach(meshConfigs, function(meshConfig, next) {
        return ncp(meshConfig.src, srcDir, next);
      }, function() {
        fs.unlink("" + srcDir + "/mesh.json");
        return _this(meshConfigs, mainConfig);
      });
    }, function(meshConfigs, mainConfig) {
      var config, originalConfigs, _i, _len;
      console.log("merging mesh configs");
      originalConfigs = [];
      for (_i = 0, _len = meshConfigs.length; _i < _len; _i++) {
        config = meshConfigs[_i];
        originalConfigs.push(config.original);
      }
      originalConfigs.push(mainConfig.original);
      return this(_.extend.apply(null, originalConfigs) || {});
    }, function(meshConfig) {
      var _this = this;
      console.log("writing mesh config");
      return fs.writeFile("" + outputDir + "/mesh.json", JSON.stringify(meshConfig, null, 2), res.success(function() {
        return _this(meshConfig);
      }));
    }, function(config) {
      var _this = this;
      return async.map(config.modules || [], function(module, next) {
        return router.request("find/module/dir").query({
          module: module,
          dirs: ["" + input + "/modules", "" + input + "/node_modules"]
        }).response(next).pull();
      }, res.success(function(moduleDirs) {
        return _this(moduleDirs);
      }));
    }, function(moduleDirs) {
      var dir, moduleMeshConfigPaths, _i, _len;
      moduleMeshConfigPaths = [];
      for (_i = 0, _len = moduleDirs.length; _i < _len; _i++) {
        dir = moduleDirs[_i];
        moduleMeshConfigPaths.push("" + dir + "/mesh.json");
      }
      return async.filter(moduleMeshConfigPaths, path.exists, this);
    }, function(meshedModuleConfigs) {
      var _this = this;
      return async.forEach(meshedModuleConfigs, function(dir, next) {
        return merge({
          input: path.dirname(meshedModuleConfigs),
          platform: platform,
          router: router
        }, next);
      }, res.success(function(result) {
        return callback(null, true);
      }));
    });
  };

}).call(this);