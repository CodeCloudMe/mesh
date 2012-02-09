(function() {
  var BaseOperation, HandleFile, fs,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("./Base");

  fs = require("fs");

  module.exports = HandleFile = (function(_super) {

    __extends(HandleFile, _super);

    /*
    */

    function HandleFile(file) {
      this.file = file;
    }

    /*
    */

    HandleFile.prototype.start = function() {
      return fs.readFile(this.file, this._onSuccess(this._onReadFile));
    };

    /*
    */

    HandleFile.prototype._onReadFile = function(content) {
      return this._handleContent(content, this._method(this._end));
    };

    /*
    */

    HandleFile.prototype._handleContent = function(content, callback) {};

    /*
    	 additional
    */

    HandleFile.prototype._writeFile = function(content, callback) {
      return fs.writeFile(this.file, content, callback);
    };

    return HandleFile;

  })(BaseOperation);

}).call(this);
