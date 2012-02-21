(function() {
  var findTargetDirs, fs, mkdirp, ncp, npm, path, step, _;

  ncp = require("ncp").ncp;

  _ = require("underscore");

  fs = require("fs");

  path = require("path");

  mkdirp = require("mkdirp");

  step = require("stepc");

  npm = require("npm");

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
      "pull v/output -> target/platform/dirs -> copy/platforms": function(req, res, mw) {
        var copyFiles, copyPlatform, output, outputSrc, toCopy;
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
        var dirs, platform, platforms, _i, _len;
        platforms = req.query.platforms || [];
        dirs = [];
        for (_i = 0, _len = platforms.length; _i < _len; _i++) {
          platform = platforms[_i];
          dirs = dirs.concat(findTargetDirs(req.sanitized.platformDirs, platform.split(":")));
        }
        req.sanitized.targetPlatformDirs = dirs;
        if (!mw.next()) return res.end(dirs);
      }
    });
  };

  findTargetDirs = function(allFiles, targetPlatforms) {
    var numTargetPlatforms;
    numTargetPlatforms = targetPlatforms.length;
    return allFiles.filter(function(dir) {
      var dirParts, i, platform, _len;
      dirParts = path.basename(dir).split(/\s*\>\s*/g);
      for (i = 0, _len = dirParts.length; i < _len; i++) {
        platform = dirParts[i];
        if (i === numTargetPlatforms) return false;
        if (!_.intersection(platform.split(" "), [targetPlatforms[i], "common"]).length) {
          return false;
        }
      }
      return true;
    });
  };

}).call(this);
