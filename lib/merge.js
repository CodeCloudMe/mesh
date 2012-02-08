(function() {
  var EventEmitter, SourceMesher, fs, mkdirp, ncp, outcome, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  EventEmitter = require("events").EventEmitter;

  fs = require("fs");

  outcome = require("outcome");

  _ = require("underscore");

  ncp = require("ncp").ncp;

  mkdirp = require("mkdirp");

  /*
    meshes the sources of a directory into a single directory. Format of the dir should be as such:
   
    dir/
      node web/
      node/
      common/
   
    the output would be the target platform
  */

  SourceMesher = (function(_super) {

    __extends(SourceMesher, _super);

    /*
    */

    function SourceMesher(input, output, targets) {
      var _this = this;
      this.input = input;
      this.output = output;
      this.targets = targets;
      this._on = outcome.error(function(err) {
        return _this.emit("error", err);
      });
    }

    /*
    	 entry point to the mesher
    */

    SourceMesher.prototype.mesh = function() {
      var _this = this;
      return mkdirp(this.output, 0777, this._on.success(function() {
        return _this._onOutputMade();
      }));
    };

    /*
    */

    SourceMesher.prototype._onOutputMade = function() {
      var _this = this;
      return fs.readdir(this.input, this._on.success(function(dirs) {
        return _this._onInputDirs(dirs);
      }));
    };

    /*
    	 called when the input dir is read
    */

    SourceMesher.prototype._onInputDirs = function(dirs) {
      this._dirs = this._findIncludes(dirs);
      return this._mergeDirs();
    };

    /*
    	 with the dirs given, finds the dirs to used based on the target
    	 platforms
    */

    SourceMesher.prototype._findIncludes = function(dirs) {
      var dir, includes, _i, _len;
      includes = [];
      for (_i = 0, _len = dirs.length; _i < _len; _i++) {
        dir = dirs[_i];
        if (_.intersection(this.targets, dir.split(" ")).length) {
          includes.push(dir);
        }
      }
      return includes;
    };

    /*
    	 recursively move the dirs to a new folder
    */

    SourceMesher.prototype._mergeDirs = function() {
      var _this = this;
      if (!this._dirs.length) return this.emit("complete");
      return ncp("" + this.input + "/" + (this._dirs.shift()), this.output, this._on.success(function() {
        return _this._mergeDirs();
      }));
    };

    return SourceMesher;

  })(EventEmitter);

  /*
   entry point
  */

  module.exports = function(ops, callback) {
    var mesher;
    ops.include.push("common");
    mesher = new SourceMesher(ops.input, ops.output, ops.include);
    mesher.on("complete", callback);
    mesher.on("error", callback);
    return mesher.mesh();
  };

}).call(this);
