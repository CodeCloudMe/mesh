(function() {
  var BaseOperation, DirMerge, fs, mkdirp, ncp, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../Base");

  fs = require("fs");

  _ = require("underscore");

  ncp = require("ncp").ncp;

  mkdirp = require("mkdirp");

  /*
    merges the sources of a directory into a single directory. Format of the dir should be as such:
   
    dir/
      node web/
      node/
      common/
   
    the output would be the target platform
  */

  module.exports = DirMerge = (function(_super) {

    __extends(DirMerge, _super);

    /*
    */

    function DirMerge(input, output, targets) {
      this.input = input;
      this.output = output;
      this.targets = targets;
      DirMerge.__super__.constructor.call(this);
    }

    /*
    */

    DirMerge.prototype.start = function() {
      return mkdirp(this.output, 0777, this._onSuccess(this._onOutputMade()));
    };

    /*
    */

    DirMerge.prototype._onOutputMade = function() {
      return fs.readdir(this.input, this._onSuccess(this._onInputDirs));
    };

    /*
    */

    DirMerge.prototype._onInputDirs = function(dirs) {
      this._dirs = DirMerge.intersection(dirs);
      return this._mergeDirs();
    };

    /*
    */

    DirMerge.prototype._mergeDirs = function() {
      if (!this._dirs.length) return this._end();
      return ncp("" + this.input + "/" + (this._dirs.shift()), this.output, this._onSuccess(this._mergeDirs));
    };

    return DirMerge;

  })(BaseOperation);

  /*
   returns the directories which intersect
   with the platforms given
  */

  DirMerge.intersection = function(dirs, targets) {
    var dir, includes, _i, _len;
    includes = [];
    for (_i = 0, _len = dirs.length; _i < _len; _i++) {
      dir = dirs[_i];
      if (_.intersection(targets, dir.split(" ")).length) includes.push(dir);
    }
    return includes;
  };

  /*
   static, shortcut method
  */

  DirMerge.start = function(ops, callback) {
    ops.include = _.union(ops.include, ["common"]);
    return new DirMerge(ops.input, ops.output, ops.include).onComplete(callback).start();
  };

}).call(this);
