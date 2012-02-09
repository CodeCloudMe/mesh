(function() {
  var BaseOperation, DependencyLoader, RequireAnalyzer, fs, getPathInfo, path,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/Operation");

  fs = require("fs");

  path = require("path");

  require("asyncjs");

  require("beanpoll");

  getPathInfo = function(required, from) {
    if (required.substr(0, 1) === ".") {
      return {
        path: require.resolve("" + (path.dirname(from)) + "/" + required)
      };
    }
    try {
      return {
        path: require.resolve(required),
        module: true
      };
    } catch (e) {
      return {
        path: required,
        core: true
      };
    }
  };

  RequireAnalyzer = (function(_super) {

    __extends(RequireAnalyzer, _super);

    /*
    */

    function RequireAnalyzer(file, included) {
      this.file = file;
      this.included = included != null ? included : {};
      RequireAnalyzer.__super__.constructor.call(this);
    }

    /*
    */

    RequireAnalyzer.prototype.start = function() {
      return fs.readFile(this.file, "utf8", this._onSuccess(this._onContent));
    };

    /*
    */

    RequireAnalyzer.prototype._onContent = function(content) {
      var info, relPath, required, toScan, _i, _len, _ref;
      toScan = [];
      _ref = content.match(/require\(["'].*?["']\)/g) || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        required = _ref[_i];
        relPath = required.match(/["'](.*?)["']/)[1];
        info = getPathInfo(relPath, this.file);
        /*
        			1. do NOT include core modules
        			2. do NOT scan third-party modules. Third-party files are included - scanning not necessary
        */
        if (!info.core && !info.module && !this.included[info.path]) {
          toScan.push(info.path);
        }
        this.included[info.path] = info;
      }
      return this._loadRequired(toScan);
    };

    /*
    */

    RequireAnalyzer.prototype._loadRequired = function(required) {
      var _this = this;
      if (!required.length) return this._onRequired();
      return new RequireAnalyzer(required.shift(), this.included).onComplete(this._onSuccess(function() {
        return _this._loadRequired(required);
      })).start();
    };

    /*
    */

    RequireAnalyzer.prototype._onRequired = function() {
      return this._complete(Object.keys(this.included));
    };

    return RequireAnalyzer;

  })(BaseOperation);

  module.exports = DependencyLoader = (function(_super) {

    __extends(DependencyLoader, _super);

    /*
    */

    function DependencyLoader(file) {
      this.file = file;
      DependencyLoader.__super__.constructor.call(this);
    }

    /*
    */

    DependencyLoader.prototype.start = function() {
      return new RequireAnalyzer(this.file).onComplete(this._onSuccess(this._onRequired)).start();
    };

    /*
    */

    DependencyLoader.prototype._onRequired = function(files) {
      return console.log(files);
    };

    return DependencyLoader;

  })(BaseOperation);

  new DependencyLoader(__filename).onComplete(function(err, files) {
    return console.log(files);
  }).start();

}).call(this);
