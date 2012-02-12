(function() {
  var async, copyDir, copyFile, copyFile2, copyMergeable, copyr, fs, merge, mkdirp, ncp, outcome, path, readPackageConfig, rmdirr, step, _;

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
      loaded.src = path.normalize("" + dir + "/" + (dirs.src || ''));
      loaded.lib = path.normalize("" + dir + "/" + (dirs.lib || 'lib'));
      loaded.original = config;
      return callback(null, loaded);
    });
  };

  /*
  */

  copyMergeable = function(input, output, next) {
    output = output.replace(".merge", "");
    return step.async(function() {
      return path.exists(output, this);
    }, function(outExists) {
      var icfg, ocfg, ofg;
      if (!outExists) return copyFile2(input, output, next);
      ocfg = JSON.parse(fs.readFileSync(output, "utf8"));
      icfg = JSON.parse(fs.readFileSync(input, "utf8"));
      ofg = _.extend(ocfg, icfg);
      return fs.writeFile(output, JSON.stringify(ofg, null, 2), next);
    });
  };

  /*
  */

  copyFile2 = function(input, output, next) {
    var readStream, writeStream;
    readStream = fs.createReadStream(input);
    writeStream = fs.createWriteStream(output);
    readStream.pipe(writeStream);
    return readStream.once('end', next);
  };

  /*
  */

  copyFile = function(input, output, next) {
    if (input.match(/\.merge\.json/)) return copyMergeable(input, output, next);
    return copyFile2(input, output, next);
  };

  copyDir = function(input, output, next) {
    var res;
    res = outcome.error(next);
    return step.async(function() {
      return mkdirp(output, 0777, this);
    }, function() {
      return fs.readdir(input, res.success(this));
    }, function(files) {
      return async.forEach(files, function(file, next) {
        var ifile, ofile;
        ifile = "" + input + "/" + file;
        ofile = "" + output + "/" + file;
        return copyr(ifile, ofile, next);
      }, next);
    });
  };

  /*
  */

  copyr = function(input, output, next) {
    var res;
    res = outcome.error(next);
    return fs.lstat(input, res.success(function(stat) {
      if (stat.isDirectory()) return copyDir(input, output, next);
      return copyFile(input, output, next);
    }));
  };

  module.exports = merge = function(ops, callback) {
    var incModules, input, outputDir, platform, platformDirs, res, router, sourceDir;
    res = outcome.error(callback);
    input = ops.input;
    platform = ops.platform;
    router = ops.router;
    sourceDir = null;
    outputDir = ops.output;
    platformDirs = null;
    incModules = [];
    return step.async(function() {
      return readPackageConfig("" + input + "/package.json", res.success(this));
    }, function(config) {
      sourceDir = config.src;
      outputDir = outputDir || path.normalize("" + config.lib + "/" + platform);
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
      var dir, pkgFiles, _i, _len;
      pkgFiles = [];
      for (_i = 0, _len = dirs.length; _i < _len; _i++) {
        dir = dirs[_i];
        pkgFiles.push("" + dir + "/package.json");
      }
      platformDirs = dirs;
      return async.map(pkgFiles, readPackageConfig, res.success(this));
    }, function(pkgs) {
      var libDir, pkg, targetPkg, _i, _len;
      pkgs = pkgs.sort(function(a, b) {
        if (path.basename(a.dir) === platform) {
          return 1;
        } else {
          return -1;
        }
      });
      for (_i = 0, _len = pkgs.length; _i < _len; _i++) {
        pkg = pkgs[_i];
        incModules = incModules.concat(Object.keys(pkg.original.dependencies || []));
      }
      targetPkg = pkgs.pop();
      libDir = path.normalize("" + outputDir + "/" + (targetPkg.original.directories.lib || ''));
      return this(pkgs, targetPkg, libDir);
    }, function(pkgs, mainPkg, dir) {
      var _this = this;
      return async.forEach(pkgs, function(meshConfig, next) {
        return copyr(meshConfig.src, dir, function() {
          return copyr("" + meshConfig.dir + "/mesh.merge.json", "" + outputDir + "/mesh.merge.json", next);
        });
      }, function() {
        return _this(pkgs, mainPkg);
      });
    }, function(pkgs, mainPkg) {
      var _this = this;
      return copyr(mainPkg.dir, outputDir, res.success(function() {
        return _this(pkgs, mainPkg);
      }));
    }, function(pkgs, mainPkg) {
      var originalPkgs, pkg, _i, _len;
      originalPkgs = [];
      for (_i = 0, _len = pkgs.length; _i < _len; _i++) {
        pkg = pkgs[_i];
        originalPkgs.push(pkg.original);
      }
      originalPkgs.push(mainPkg.original);
      return this(_.extend.apply(null, originalPkgs) || {});
    }, function(config) {
      return fs.writeFile("" + outputDir + "/package.json", JSON.stringify(config, null, 2), res.success(this));
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
