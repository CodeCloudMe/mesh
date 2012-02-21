(function() {
  var Seq, async, fs, linkToParent, merge, mergeDirs, meshable, mkdirp, outcome, path, readPackageConfig, resolve, step, structr, walkr, _;

  _ = require("underscore");

  fs = require("fs");

  walkr = require("walkr");

  step = require("stepc");

  path = require("path");

  async = require("async");

  mkdirp = require("mkdirp");

  outcome = require("outcome");

  structr = require("structr");

  Seq = require("seq");

  mergeDirs = require("../../utils/mergeDirs");

  resolve = require("resolve");

  module.exports = function(ops, callback) {
    var dir, dirs, platforms;
    dir = ops.input;
    platforms = ops.platform.split(":");
    return dirs = _findTargetDirs(dir, platforms);
  };

  module.exports = merge = function(ops, callback) {
    var appPkg, incModules, input, linkTo, nodeModulesDir, outputDir, outputModulesDir, outputPkg, platform, platformDirs, res, router, sourceDir;
    res = outcome.error(callback);
    input = ops.input;
    platform = ops.platform;
    router = ops.router;
    sourceDir = null;
    outputDir = null;
    outputPkg = null;
    platformDirs = null;
    appPkg = null;
    incModules = [];
    nodeModulesDir = "" + input + "/node_modules";
    outputModulesDir = null;
    linkTo = ops.link;
    return step.async(function() {
      return readPackageConfig("" + input + "/package.json", this);
    }, res.success(function(config) {
      console.log("merge " + config.original.name);
      appPkg = config.original;
      sourceDir = config.src;
      outputDir = outputDir || path.normalize("" + config.lib + "/" + platform);
      outputPkg = "" + outputDir + "/package.json";
      outputModulesDir = "" + outputDir + "/node_modules";
      return this();
    }), function() {
      return mkdirp(outputModulesDir, 0777, this);
    }, function() {
      return fs.writeFile("" + outputDir + "/package.json", JSON.stringify({}, null, 2), this);
    }, function() {
      return fs.readdir(nodeModulesDir, this);
    }, function(err, dirs) {
      if (err) return this();
      return async.forEach(dirs, function(dir, next) {
        return fs.symlink("" + nodeModulesDir + "/" + dir, "" + outputModulesDir + "/" + dir, function() {
          return next();
        });
      }, this);
    }, res.success(function() {
      return linkToParent(outputDir, linkTo, this);
    }), res.success(function() {
      return mergeDirs(sourceDir, [platform]).filterFile(/\.merge\.json/, mergeDirs.mergeJSON(".json")).filterFile(/package\.json/, mergeDirs.mergeJSON(".json", appPkg)).filterFile(mergeDirs.parseTemplate({})).join(outputDir).complete(this);
    }), res.success(function() {
      var deps;
      deps = Object.keys(JSON.parse(fs.readFileSync(outputPkg, "utf8")).dependencies || {});
      deps = deps.concat(Object.keys(appPkg.dependencies || {}));
      return this(null, deps = _.uniq(deps));
    }), res.success(function(deps) {
      var dep, pkgPaths, _i, _len;
      pkgPaths = [];
      for (_i = 0, _len = deps.length; _i < _len; _i++) {
        dep = deps[_i];
        pkgPaths.push("" + input + "/node_modules/" + dep + "/package.json");
      }
      return async.filter(pkgPaths, meshable, this);
    }), function(pkgPaths) {
      var _this = this;
      return async.forEach(pkgPaths, function(pkgPath, next) {
        var modInput;
        modInput = path.dirname(pkgPath);
        return merge({
          input: modInput,
          link: "" + outputModulesDir + "/" + (path.basename(modInput)),
          platform: platform,
          router: router
        }, next);
      }, this);
    }, res.success(function() {
      return callback(null, {
        output: outputDir
      });
    }));
  };

  /*
  */

  readPackageConfig = function(pkg, callback) {
    return fs.readFile(pkg, "utf8", function(err, content) {
      var config, dir, dirs, loaded;
      config = content ? JSON.parse(content) : {};
      dir = path.dirname(pkg);
      loaded = {
        dir: dir
      };
      if (!config.directories) config.directories = {};
      dirs = config.directories;
      loaded.src = path.normalize("" + dir + "/" + (dirs["mesh-src"] || 'src'));
      loaded.lib = path.normalize("" + dir + "/" + (dirs.lib || 'lib'));
      loaded.original = config;
      return callback(null, loaded);
    });
  };

  /*
  */

  linkToParent = function(outputDir, to, callback) {
    if (!to) return callback();
    return step.async(function() {
      return fs.unlink(to, this);
    }, function() {
      return fs.symlink(outputDir, to, this);
    }, callback);
  };

  /*
  */

  meshable = function(pkg, callback) {
    return step.async(function() {
      return fs.readFile(pkg, "utf8", this);
    }, function(err, content) {
      if (err) return callback(false);
      try {
        return callback(JSON.parse(content).directories["mesh-src"]);
      } catch (e) {
        return callback(false);
      }
    });
  };

}).call(this);
