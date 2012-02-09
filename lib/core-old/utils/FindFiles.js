(function() {
  var BaseOperation, FindFiles, findit,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/Operation");

  findit = require("findit").find;

  /*
   finds files based on params given
  */

  module.exports = FindFiles = (function(_super) {

    __extends(FindFiles, _super);

    /*
    */

    function FindFiles(dir, match) {
      this.dir = dir;
      this.match = match;
      this.allFiles = [];
    }

    /*
    */

    FindFiles.prototype.start = function() {
      var find,
        _this = this;
      find = findit(this.dir);
      find.on("file", this._method(this._onFile));
      return find.on("end", function() {
        return _this._complete(_this.allFiles);
      });
    };

    /*
    	 called once a file is found
    */

    FindFiles.prototype._onFile = function(file) {
      if (!this.match.test(file)) return;
      return this.allFiles.push(file);
    };

    return FindFiles;

  })(BaseOperation);

  FindFiles.start = function(ops, onComplete) {
    return new FindFiles(ops.dir, ops.tester).onComplete(onComplete).start();
  };

}).call(this);
