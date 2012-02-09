(function() {
  var fs, _;

  _ = require("underscore");

  fs = require("fs");

  /*
   returns the directories which intersect
   with the platforms given
  */

  module.exports = function(dirs) {
    var allDirs, dir, _i, _len;
    if (typeof dirs === 'string') dirs = fs.readdirSync(dirs);
    allDirs = [];
    for (_i = 0, _len = dirs.length; _i < _len; _i++) {
      dir = dirs[_i];
      allDirs = allDirs.concat(dir.split(" "));
    }
    return _.uniq(allDirs);
  };

}).call(this);
