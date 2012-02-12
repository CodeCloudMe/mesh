(function() {
  var Modules, async, path;

  async = require("async");

  path = require("path");

  module.exports = Modules = (function() {

    function Modules() {
      this.dirs = [];
    }

    /*
    */

    Modules.prototype.addDir = function(dir) {
      if (dir instanceof Array) {
        return this.dirs = this.dirs.concat(dir);
      } else {
        return this.dirs.push(dir);
      }
    };

    /*
    */

    Modules.prototype.find = function(name, directories, callback) {
      if (directories instanceof Function) {
        callback = directories;
        directories = [];
      }
      return async.filter(directories.concat(this.dirs, path.exists, function(dirs) {
        if (!dirs.length) {
          return calllback(new Error("module " + name + " does not exist"));
        }
        return callback(null, dirs.shift());
      }));
    };

    return Modules;

  })();

}).call(this);
