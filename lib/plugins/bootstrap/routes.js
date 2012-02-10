(function() {
  var async, fs, mkdirp, ncp, path, step, _;

  ncp = require("ncp").ncp;

  _ = require("underscore");

  fs = require("fs");

  async = require("asyncjs");

  path = require("path");

  mkdirp = require("mkdirp");

  step = require("step");

  module.exports = function(router, params) {
    var bootstrapDir, bootstrapSrcDir;
    bootstrapDir = params.dir;
    bootstrapSrcDir = bootstrapDir + "/src";
    return router.on({
      /*
      		 bootstraps a program by copying the target platform
      		 over to a new directory
      */
      "pull \		copy/platforms -> \		fill/templates -> \				bootstrap": function(req, res) {
        return console.log("bootstrapped!");
      },
      /*
      		 copies the target platforms from the scaffolding directory
      		 over to the output dir
      */
      "pull v/output -> platforms -> copy/platforms": function(req, res, mw) {
        var copyFiles, copyPlatform, dir, output, outputSrc, platforms, toCopy, _i, _len, _ref;
        platforms = mw.data('platforms') || [];
        output = mw.data('output');
        outputSrc = output + "/src";
        toCopy = [];
        _ref = req.sanitized.platformFolders;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dir = _ref[_i];
          toCopy.push("" + bootstrapSrcDir + "/" + dir);
        }
        console.log("copying target platforms");
        return step(function() {
          return mkdirp(outputSrc, 0777, this);
        }, function() {
          return fs.readdir(bootstrapDir, res.success(this));
        }, function(files) {
          var copiable, file, _j, _len2;
          copiable = [];
          for (_j = 0, _len2 = files.length; _j < _len2; _j++) {
            file = files[_j];
            file = "" + bootstrapDir + "/" + file;
            if (!fs.lstatSync(file).isDirectory()) copiable.push(file);
          }
          return this(copiable);
        }, (copyFiles = function(files) {
          var file,
            _this = this;
          if (!files.length) return this();
          file = files.shift();
          return ncp(file, "" + output + "/" + (path.basename(file)), res.success(function() {
            return copyFiles.call(_this, files);
          }));
        }), (copyPlatform = function() {
          var _this = this;
          if (!toCopy.length) return this();
          dir = toCopy.shift();
          return ncp(dir, "" + outputSrc + "/" + (path.basename(dir)), res.success(function() {
            return copyPlatform.call(_this);
          }));
        }), function() {
          if (!mw.next()) return res.end(true);
        });
      },
      /*
      		 returns the platform directories
      */
      "pull platform/dirs": function(req, res, mw) {
        var allDirs;
        allDirs = [];
        if (req.sanitized.platformDirs) mw.next();
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
        var allDirs, dir, dirParts, platformFolders, platforms, _i, _len, _ref;
        if (req.sanitized.allPlatforms) mw.next();
        platforms = req.query.platforms || [];
        allDirs = [];
        platformFolders = [];
        _ref = req.sanitized.platformDirs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dir = _ref[_i];
          dirParts = dir.split(" ");
          allDirs = allDirs.concat(dirParts);
          if (!platforms.length || _.intersection(platforms, dirParts).length) {
            platformFolders.push(dir);
          }
        }
        req.sanitized.allPlatforms = allDirs = _.uniq(allDirs);
        req.sanitized.platformFolders = platformFolders;
        req.query.platforms = req.query.platforms || req.sanitized.allPlatforms;
        if (!mw.next()) return res.end(allDirs);
      }
    });
  };

}).call(this);
