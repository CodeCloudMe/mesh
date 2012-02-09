(function() {
  var BaseOperation, DepAnalyzer, RequireAnalyzer, fs, getPackagePath, getPathInfo, getPkgName, path,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/Operation");

  fs = require("fs");

  path = require("path");

  require("asyncjs");

  require("beanpoll");

  getPackagePath = function(file) {
    var pathParts, pkgPath;
    pathParts = path.dirname(file).split("/");
    while (pathParts.length) {
      try {
        pkgPath = "" + (pathParts.join("/")) + "/package.json";
        fs.lstatSync(pkgPath);
        return pkgPath;
      } catch (e) {

      }
      pathParts.pop();
    }
    return null;
  };

  getPkgName = function(pkg) {
    return JSON.parse(fs.readFileSync(pkg, "utf8")).name;
  };

  getPathInfo = function(required, from) {
    var pkgPath, realPath;
    if (from && required.substr(0, 1) === ".") {
      return {
        path: require.resolve("" + (path.dirname(from)) + "/" + required)
      };
    }
    try {
      realPath = require.resolve(required);
      pkgPath = getPackagePath(realPath);
      return {
        path: realPath,
        name: pkgPath ? getPkgName(pkgPath) : required,
        pkgPath: pkgPath,
        module: true,
        core: realPath.split('/').length === 1
      };
    } catch (e) {
      return null;
    }
  };

  RequireAnalyzer = (function(_super) {

    __extends(RequireAnalyzer, _super);

    /*
    */

    function RequireAnalyzer(fileInfo, included) {
      this.fileInfo = fileInfo != null ? fileInfo : {};
      this.included = included != null ? included : {
        modules: {},
        paths: {}
      };
      RequireAnalyzer.__super__.constructor.call(this);
    }

    /*
    */

    RequireAnalyzer.prototype.start = function() {
      if (this.fileInfo.module) {
        return fs.readFile(this.fileInfo.pkgPath, "utf8", this._onSuccess(this._onPkgContent));
      } else {
        return fs.readFile(this.fileInfo.path, "utf8", this._onSuccess(this._onJsContent));
      }
    };

    /*
    */

    RequireAnalyzer.prototype._onJsContent = function(content) {
      var relPath, required, toScan, _i, _len, _ref;
      toScan = [];
      _ref = content.match(/require\(["'].*?["']\)/g) || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        required = _ref[_i];
        relPath = required.match(/["'](.*?)["']/)[1];
        this._includePath(toScan, relPath, this.fileInfo.path);
      }
      return this._loadRequired(toScan);
    };

    /*
    */

    RequireAnalyzer.prototype._onPkgContent = function(content) {
      var dep, pkg, toScan;
      pkg = JSON.parse(content);
      toScan = [];
      for (dep in pkg.dependencies) {
        this._includePath(toScan, "" + (path.dirname(this.fileInfo.pkgPath)) + "/node_modules/" + dep);
      }
      return this._loadRequired(toScan);
    };

    /*
    */

    RequireAnalyzer.prototype._includePath = function(toScan, path, from) {
      var info, moduleUsed, pathUsed;
      info = getPathInfo(path, from);
      if (!info) return;
      pathUsed = !!this.included.paths[info.path];
      moduleUsed = !!this.included.modules[info.name];
      /*
      		1. do NOT include core modules
      		2. do NOT scan third-party modules. Third-party files are included - scanning not necessary
      */
      if (!info.core && !pathUsed && !moduleUsed) toScan.push(info);
      if (info.name) {
        this.included.modules[info.name] = info;
        if (moduleUsed) return;
      }
      return this.included.paths[info.path] = info;
    };

    /*
    */

    RequireAnalyzer.prototype._loadRequired = function(required) {
      var info,
        _this = this;
      if (!required.length) return this._onRequired();
      info = required.shift();
      return new RequireAnalyzer(info, this.included).onComplete(this._onSuccess(function() {
        return _this._loadRequired(required);
      })).start();
    };

    /*
    */

    RequireAnalyzer.prototype._onRequired = function() {
      return this._complete(this.included.paths);
    };

    return RequireAnalyzer;

  })(BaseOperation);

  module.exports = DepAnalyzer = (function(_super) {

    __extends(DepAnalyzer, _super);

    /*
    */

    function DepAnalyzer(file) {
      this.file = file;
      DepAnalyzer.__super__.constructor.call(this);
    }

    /*
    */

    DepAnalyzer.prototype.start = function() {
      return new RequireAnalyzer({
        path: this.file
      }).onComplete(this._onSuccess(this._onRequired)).start();
    };

    /*
    */

    DepAnalyzer.prototype._onRequired = function(files) {
      var file, fixed, info, used, _results;
      fixed = [];
      used = {};
      _results = [];
      for (file in files) {
        info = files[file];
        _results.push(console.log(info.name));
      }
      return _results;
    };

    return DepAnalyzer;

  })(BaseOperation);

  new DepAnalyzer(__filename).onComplete(function(err, files) {
    return console.log(files);
  }).start();

}).call(this);
