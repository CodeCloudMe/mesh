(function() {
  var async, fs, merge, mkdirp, ncp, outcome, path, readMeshConfig, readPackageConfig, rmdirr, step, _;

  _ = require("underscore");

  fs = require("fs");

  ncp = require("ncp").ncp;

  step = require("stepc");

  path = require("path");

  async = require("async");

  mkdirp = require("mkdirp");

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
      loaded.merge = path.normalize("" + loaded.dir + "/" + (config.merge || ''));
      loaded.original = config;
      return callback(null, loaded);
    });
  };

  /*
  */

  readPackageConfig = function(pkg, callback) {
    return fs.readFile(pkg, "utf8", function(err, content) {
      var config, dir, dirs;
      if (err) return callback(null, {});
      config = content ? JSON.parse(content) : {};
      dir = path.dirname(pkg);
      dirs = config.directories;
      dirs.src = path.normalize("" + dir + "/" + (dirs.src || ''));
      dirs.lib = path.normalize("" + dir + "/" + (dirs.lib || 'lib'));
      dirs.interm = path.normalize("" + dir + "/" + (dirs.interm || 'intermediate'));
      return callback(null, config);
    });
  };

  /*
  */

  module.exports = merge = function(ops, callback) {
    var incModules, input, outputDir, platform, platformDirs, res, router, sourceDir;
    res = outcome.error(callback);
    input = ops.input;
    platform = ops.platform;
    router = ops.router;
    sourceDir = null;
    outputDir = ops.output;
    platformDirs = null;
    incModules = null;
    return step.async(function() {
      return readPackageConfig("" + input + "/package.json", res.success(this));
    }, function(config) {
      sourceDir = config.directories.src;
      outputDir = outputDir || path.normalize("" + config.directories.interm + "/" + platform);
      return this();
    }, function() {
      return rmdirr(outputDir, this);
    }, function() {
      return mkdirp(outputDir, 0777, res.success(this));
    }, function() {
      return router.request("target/platform/dirs").query({
        platformDir: sourceDir,
        platforms: [platform]
      }).response(res.success(this)).pull();
    }, function(dirs) {
      var dir, meshFiles, _i, _len;
      platformDirs = dirs;
      meshFiles = [];
      for (_i = 0, _len = dirs.length; _i < _len; _i++) {
        dir = dirs[_i];
        meshFiles.push("" + dir + "/mesh.json");
      }
      return async.map(meshFiles, readMeshConfig, res.success(this));
    }, function(meshConfigs) {
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
      srcDir = path.normalize("" + outputDir + "/" + (targetConfig.original.merge || ''));
      return mkdirp(srcDir, 0777, res.success(function() {
        return ncp(targetConfig.dir, outputDir, res.success(function() {
          return _this(meshConfigs, targetConfig, srcDir);
        }));
      }));
    }, function(meshConfigs, mainConfig, srcDir) {
      var _this = this;
      return async.forEach(meshConfigs, function(meshConfig, next) {
        return ncp(meshConfig.merge, srcDir, next);
      }, function() {
        return _this(meshConfigs, mainConfig);
      });
    }, function(meshConfigs, mainConfig) {
      var config, originalConfigs, _i, _len;
      originalConfigs = [];
      for (_i = 0, _len = meshConfigs.length; _i < _len; _i++) {
        config = meshConfigs[_i];
        originalConfigs.push(config.original);
      }
      originalConfigs.push(mainConfig.original);
      return this(_.extend.apply(null, originalConfigs) || {});
    }, function(config) {
      var target, _i, _len, _ref;
      incModules = (config.modules || []).concat();
      if (config.targets) {
        _ref = config.targets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          target = _ref[_i];
          incModules = modules.concat(target.modules || []);
        }
      }
      return fs.writeFile("" + outputDir + "/mesh.json", JSON.stringify(config, null, 2), res.success(this));
    }, function() {
      var dir, pkgFiles, _i, _len;
      pkgFiles = ["" + input + "/package.json"];
      for (_i = 0, _len = platformDirs.length; _i < _len; _i++) {
        dir = platformDirs[_i];
        pkgFiles.push("" + dir + "/package.json");
      }
      return async.map(pkgFiles, readPackageConfig, res.success(this));
    }, function(pkgs) {
      var pkg;
      pkg = _.extend.apply(null, pkgs);
      incModules = incModules.concat(Object.keys(pkg.dependencies || {}));
      incModules = _.uniq(incModules);
      return fs.writeFile("" + outputDir + "/package.json", JSON.stringify(pkg, null, 2), res.success(this));
    }, function() {
      var _this = this;
      return async.map(incModules, function(module, next) {
        return router.request("find/module/dir").query({
          module: module,
          dirs: ["" + input + "/modules", "" + input + "/node_modules"]
        }).response(next).pull();
      }, res.success(function(moduleDirs) {
        return _this(moduleDirs);
      }));
    }, function(moduleDirs) {
      var _this = this;
      return async.map(moduleDirs, function(dir, next) {
        var od;
        od = "" + input + "/node_modules/" + (path.basename(dir));
        return mkdirp(od, 0777, function() {
          return ncp(dir, od, function() {
            return next(null, od);
          });
        });
      }, res.success(function(newDirs) {
        return _this(newDirs);
      }));
    }, function(moduleDirs) {
      var dir, pkgPaths, _i, _len;
      pkgPaths = [];
      for (_i = 0, _len = moduleDirs.length; _i < _len; _i++) {
        dir = moduleDirs[_i];
        pkgPaths.push("" + dir + "/package.json");
      }
      return async.filter(pkgPaths, path.exists, this);
    }, function(pkgPaths) {
      var _this = this;
      return async.forEach(pkgPaths, function(pkgPath, next) {
        var modInput;
        modInput = path.dirname(pkgPath);
        return merge({
          input: modInput,
          output: "" + outputDir + "/node_modules/" + (path.basename(modInput)),
          platform: platform,
          router: router
        }, next);
      }, res.success(function(result) {
        return callback(null, {
          output: outputDir
        });
      }));
    });
  };

}).call(this);
