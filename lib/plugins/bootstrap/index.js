(function() {
  var fs, mkdirp, ncp, path, step, _;

  ncp = require("ncp").ncp;

  _ = require("underscore");

  fs = require("fs");

  path = require("path");

  mkdirp = require("mkdirp");

  step = require("stepc");

  exports.plugin = function(router, params) {
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
      "pull v/output -> target/platforms -> copy/platforms": function(req, res, mw) {
        var copyFiles, copyPlatform, output, outputSrc, platforms, toCopy;
        platforms = mw.data('platforms') || [];
        output = mw.data('output');
        outputSrc = output + "/src";
        toCopy = req.sanitized.targetPlatformDirs;
        console.log("copying target platforms");
        return step.async(function() {
          return mkdirp(outputSrc, 0777, this);
        }, function() {
          return fs.readdir(bootstrapDir, res.success(this));
        }, function(files) {
          var copiable, file, _i, _len;
          copiable = [];
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            file = files[_i];
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
          var dir,
            _this = this;
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
        var allDirs, input;
        allDirs = [];
        input = req.query.platformDir || bootstrapSrcDir;
        return fs.readdir(input, res.success(function(dirs) {
          var dir, _i, _len;
          for (_i = 0, _len = dirs.length; _i < _len; _i++) {
            dir = dirs[_i];
            if (dir.substr(0, 1) === ".") continue;
            allDirs.push("" + input + "/" + dir);
          }
          req.sanitized.platformDirs = allDirs;
          if (!mw.next()) return res.end(allDirs);
        }));
      },
      /*
      		 finds the target platform dirs, and filters out the rest
      */
      "pull platform/dirs -> target/platform/dirs": function(req, res, mw) {
        var allDirs, dir, dirParts, platforms, targetPlatformDirs, _i, _len, _ref;
        platforms = req.query.platforms || [];
        allDirs = [];
        targetPlatformDirs = [];
        _ref = req.sanitized.platformDirs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dir = _ref[_i];
          dirParts = path.basename(dir).split(" ");
          if (!platforms.length || _.intersection(platforms, dirParts).length) {
            targetPlatformDirs.push(dir);
          }
        }
        req.sanitized.targetPlatformDirs = targetPlatformDirs;
        if (!mw.next()) return res.end(targetPlatformDirs);
      }
    });
  };

}).call(this);
