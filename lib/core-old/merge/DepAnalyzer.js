(function() {
  var BaseOperation, FindFiles, ModuleAnalyzer, ModulesAnalyzer, ProjAnalyzer, ReqAnalyzer, fs, getPackagePath, getPathInfo, getPkgName, path,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/Operation");

  fs = require("fs");

  path = require("path");

  FindFiles = require("../utils/FindFiles");

  /*
   returns the package path
  */

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

  /*
   returns the package name
  */

  getPkgName = function(pkg) {
    return JSON.parse(fs.readFileSync(pkg, "utf8")).name;
  };

  /*
   returns info about the given path ~ module? core? etc.
  */

  getPathInfo = function(required, from) {
    var name, pkgPath, realPath;
    if (from && required.substr(0, 1) === ".") {
      return {
        path: require.resolve("" + (path.dirname(from)) + "/" + required)
      };
    }
    try {
      realPath = require.resolve(required);
      pkgPath = getPackagePath(realPath);
      name = pkgPath ? getPkgName(pkgPath) : required;
      return {
        path: realPath,
        name: name,
        pkgPath: pkgPath,
        module: true,
        core: realPath.split('/').length === 1
      };
    } catch (e) {
      return null;
    }
  };

  /*
   scans a module's package for dependencies
  */

  ModuleAnalyzer = (function(_super) {

    __extends(ModuleAnalyzer, _super);

    /*
    */

    function ModuleAnalyzer(fileInfo) {
      this.fileInfo = fileInfo;
      ModuleAnalyzer.__super__.constructor.call(this);
    }

    /*
    */

    ModuleAnalyzer.prototype.start = function() {
      return fs.readFile(this.fileInfo.pkgPath, "utf8", this._onSuccess(this._onPkgContent));
    };

    /*
    */

    ModuleAnalyzer.prototype._onPkgContent = function(content) {
      var dep, pkg, toScan;
      pkg = JSON.parse(content);
      toScan = [];
      for (dep in pkg.dependencies) {
        toScan.push(getPathInfo("" + (path.dirname(this.fileInfo.pkgPath)) + "/node_modules/" + dep));
      }
      return new ModulesAnalyzer(toScan).onComplete(this._method(this._end)).start();
    };

    return ModuleAnalyzer;

  })(BaseOperation);

  /*
   scans a collection of modules
  */

  ModulesAnalyzer = (function(_super) {

    __extends(ModulesAnalyzer, _super);

    /*
    */

    function ModulesAnalyzer(modules) {
      this.modules = modules;
      ModulesAnalyzer.__super__.constructor.call(this);
    }

    /*
    */

    ModulesAnalyzer.prototype.start = function() {
      this._loadedModules = this.modules.concat();
      return this._loadModules(this._loadingModules = this.modules.concat());
    };

    /*
    */

    ModulesAnalyzer.prototype._loadModules = function(modules) {
      if (!modules.length) return this._complete(this._loadedModules);
      return new ModuleAnalyzer(modules.shift()).onComplete(this._onSuccess(this._onRequired)).start();
    };

    /*
    */

    ModulesAnalyzer.prototype._onRequired = function(modules) {
      this._loadedModules = this._loadedModules.concat(modules);
      return this._loadModules(this._loadingModules);
    };

    return ModulesAnalyzer;

  })(BaseOperation);

  /*
  */

  ReqAnalyzer = (function(_super) {

    __extends(ReqAnalyzer, _super);

    /*
    */

    function ReqAnalyzer(file) {
      this.file = file;
      ReqAnalyzer.__super__.constructor.call(this);
    }

    /*
    */

    ReqAnalyzer.prototype.start = function() {
      return fs.readFile(this.file, "utf8", this._onSuccess(this._onJsContent));
    };

    /*
    */

    ReqAnalyzer.prototype._onJsContent = function(content) {
      var info, relPath, required, toScan, _i, _len, _ref;
      toScan = [];
      _ref = content.match(/require\(["'].*?["']\)/g) || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        required = _ref[_i];
        relPath = required.match(/["'](.*?)["']/)[1];
        info = getPathInfo(relPath, this.file);
        if (info.module && !info.core) toScan.push(info);
      }
      return new ModulesAnalyzer(toScan).onComplete(this._method(this._end)).start();
    };

    return ReqAnalyzer;

  })(BaseOperation);

  /*
  */

  module.exports = ProjAnalyzer = (function(_super) {

    __extends(ProjAnalyzer, _super);

    /*
    */

    function ProjAnalyzer(dir) {
      this.dir = dir;
      ProjAnalyzer.__super__.constructor.call(this);
    }

    /*
    */

    ProjAnalyzer.prototype.start = function() {
      this._modules = [];
      return FindFiles.start({
        dir: this.dir,
        tester: /js$/
      }, this._onSuccess(this._scanFiles));
    };

    /*
    */

    ProjAnalyzer.prototype._scanFiles = function(files) {
      this._toScan = files;
      if (!files.length) return this._onScannedFiles();
      return new ReqAnalyzer(files.shift()).onComplete(this._onSuccess(this._onDependencies)).start();
    };

    /*
    */

    ProjAnalyzer.prototype._onDependencies = function(modules) {
      this._modules = this._modules.concat(modules);
      return this._scanFiles(this._toScan);
    };

    /*
    */

    ProjAnalyzer.prototype._onScannedFiles = function() {
      var module, usable, used, _i, _len, _ref;
      usable = [];
      used = {};
      _ref = this._modules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        module = _ref[_i];
        if (used[module.name]) continue;
        used[module.name] = true;
        usable.push(module);
      }
      return this._complete(usable);
    };

    return ProjAnalyzer;

  })(BaseOperation);

  exports.scan = function(dir, callback) {
    return new ProjAnalyzer(dir).onComplete(callback).start();
  };

}).call(this);
