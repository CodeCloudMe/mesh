(function() {
  var dirmr, path, _;

  dirmr = require("dirmr");

  _ = require("underscore");

  path = require("path");

  module.exports = function(platformDir, platforms) {
    var findTargetDirs;
    findTargetDirs = function(dir) {
      var dirParts, hasMatch, i, j, platform, targetPlatform, _len, _len2;
      for (i = 0, _len = platforms.length; i < _len; i++) {
        targetPlatform = platforms[i];
        targetPlatform = targetPlatform.split(":");
        dirParts = path.basename(dir).split(/\s*\>\s*/g);
        hasMatch = true;
        for (j = 0, _len2 = dirParts.length; j < _len2; j++) {
          platform = dirParts[j];
          if (j === targetPlatform.length || !_.intersection(platform.split(" "), [targetPlatform[j], "common"]).length) {
            hasMatch = false;
            break;
          }
        }
        if (hasMatch) return true;
      }
      return false;
    };
    return dirmr().readdir(platformDir, findTargetDirs);
  };

  module.exports.mergeJSON = dirmr.mergeJSON;

  module.exports.parseTemplate = dirmr.parseTemplate;

}).call(this);
