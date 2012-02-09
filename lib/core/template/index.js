(function() {
  var BaseOperation, Factory, SetVars, fs,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/BaseOperation");

  fs = require("fs");

  /*
  */

  SetVars = (function(_super) {

    __extends(SetVars, _super);

    /*
    */

    function SetVars(file, data, engine) {
      this.file = file;
      this.data = data;
      this.engine = engine;
    }

    /*
    	 handles the content, fills the tpl, and writes the data
    */

    SetVars.prototype.start = function() {
      return fs.readfile(this.file, this._on.success(this._onContent));
    };

    /*
    */

    SetVars.prototype._onContent = function(content) {
      var _this = this;
      return this.engine.setVars(content, this.data, this._onSuccess(function(tplContent) {
        return _this._writeFile(tplContent, _this._method(_this._end));
      }));
    };

    return SetVars;

  })(BaseFileOperation);

  /*
  */

  Factory = (function() {
    /*
    */
    function Factory() {
      this.engines = {};
    }

    /*
    */

    Factory.prototype.addEngine = function(tplEngine) {
      return this.engines[tplEngine.name] = tplEngine;
    };

    /*
    	 tests a file to see if whether it's a template or not
    */

    Factory.prototype.test = function(file) {
      var type;
      type = this._typeFromFile(file);
      if (type) {
        return !!this.engines[type];
      } else {
        return false;
      }
    };

    /*
    	 writes the template file data
    */

    Factory.prototype.write = function(file, data, callback) {
      return new SetVars(file, data, this._engineFromFile(file)).onComplete(callback).start();
    };

    /*
    */

    Factory.prototype._typeFromFile = function(file) {
      var type;
      type = file.match(/(\w+).\w+$/);
      if (type) {
        return type[1];
      } else {
        return null;
      }
    };

    /*
    */

    Factory.prototype._engineFromFile = function(file) {
      type(this._typeFromTyle(file));
      return this.engines[type];
    };

    return Factory;

  })();

  /*
   Singleton
  */

  exports.factory = function() {
    return new Factory();
  };

}).call(this);
