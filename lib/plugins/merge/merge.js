(function() {
  var async, copyDir, copyFile, copyFile2, copyMergeable, copyr, fs, linkToParent, merge, meshable, mkdirp, ncp, outcome, path, readPackageConfig, rmdirr, step, _;

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
      loaded.src = path.normalize("" + dir + "/" + (dirs["mesh-src"] || ''));
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
      ocfg = outExists ? JSON.parse(fs.readFileSync(output, "utf8")) : {};
      icfg = JSON.parse(fs.readFileSync(input, "utf8"));
      ofg = _.extend(ocfg, icfg);
      fs.writeFileSync(output, JSON.stringify(ofg, null, 2));
      return next();
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
      return fs.readdir(input, this);
    }, res.success(function(files) {
      return async.forEach(files, function(file, next) {
        var ifile, ofile;
        ifile = "" + input + "/" + file;
        ofile = "" + output + "/" + file;
        return copyr(ifile, ofile, next);
      }, next);
    }));
  };

  /*
  */

  copyr = function(input, output, next) {
    var res;
    res = outcome.error(function() {
      return next(new Error("" + input + " does not exist"));
    });
    return fs.lstat(input, res.success(function(stat) {
      if (stat.isDirectory()) return copyDir(input, output, next);
      return copyFile(input, output, next);
    }));
  };

  linkToParent = function(outputDir, to, callback) {
    if (!to) return callback();
    return step.async(function() {
      return fs.unlink(to, this);
    }, function() {
      return fs.symlink(outputDir, to, this);
    }, callback);
  };

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

  module.exports = merge = function(ops, callback) {
    var appPkg, incModules, input, linkTo, nodeModulesDir, outputDir, outputModulesDir, platform, platformDirs, res, router, sourceDir;
    res = outcome.error(callback);
    input = ops.input;
    platform = ops.platform;
    router = ops.router;
    sourceDir = null;
    outputDir = null;
    platformDirs = null;
    appPkg = null;
    incModules = [];
    nodeModulesDir = "" + input + "/node_modules";
    outputModulesDir = null;
    linkTo = ops.link;
    return step.async(function() {
      return readPackageConfig("" + input + "/package.json", this);
    }, res.success(function(config) {
      console.log("- merge " + config.original.name);
      appPkg = config.original;
      sourceDir = config.src;
      outputDir = outputDir || path.normalize("" + config.lib + "/" + platform);
      outputModulesDir = "" + outputDir + "/node_modules";
      return this();
    }), function() {
      return mkdirp(outputModulesDir, 0777, this);
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
      return router.request("target/platform/dirs").query({
        platformDir: sourceDir,
        platforms: [platform]
      }).response(this).pull();
    }), res.success(function(dirs) {
      var dir, pkgFiles, _i, _len;
      pkgFiles = [];
      for (_i = 0, _len = dirs.length; _i < _len; _i++) {
        dir = dirs[_i];
        pkgFiles.push("" + dir + "/package.json");
      }
      platformDirs = dirs;
      return async.map(pkgFiles, readPackageConfig, this);
    }), res.success(function(pkgs) {
      var libDir, targetPkg;
      pkgs = pkgs.sort(function(a, b) {
        if (path.basename(a.dir) === platform) {
          return 1;
        } else {
          return -1;
        }
      });
      targetPkg = pkgs.pop();
      libDir = path.normalize("" + outputDir + "/" + (targetPkg.original.directories.lib || ''));
      return this(pkgs, targetPkg, libDir);
    }), function(pkgs, mainPkg, dir) {
      var _this = this;
      return async.forEach(pkgs, function(meshConfig, next) {
        return copyr(meshConfig.src, dir, function() {
          return copyr("" + meshConfig.dir + "/mesh.merge.json", "" + outputDir + "/mesh.merge.json", function() {
            return next();
          });
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
      pkg = _.extend.apply(null, originalPkgs) || {};
      delete appPkg.main;
      _.defaults(pkg, appPkg);
      incModules = incModules.concat(Object.keys(pkg.dependencies || {}));
      return this(pkg);
    }, function(config) {
      return fs.writeFile("" + outputDir + "/package.json", JSON.stringify(config, null, 2), this);
    }, res.success(function() {
      var _this = this;
      return async.map(incModules, function(module, next) {
        return router.request("find/module/dir").query({
          module: module,
          dirs: ["" + input + "/modules", "" + input + "/node_modules"]
        }).response(next).pull();
      }, this);
    }), res.success(function(moduleDirs) {
      var dir, pkgPaths, _i, _len;
      pkgPaths = [];
      for (_i = 0, _len = moduleDirs.length; _i < _len; _i++) {
        dir = moduleDirs[_i];
        pkgPaths.push("" + dir + "/package.json");
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

}).call(this);
