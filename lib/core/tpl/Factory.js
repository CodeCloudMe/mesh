(function() {
  var BaseFileOperation, Factory, GetVars, SetVars, fs,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseFileOperation = require("../operations/BaseFileOperation");

  fs = require("fs");

  /*
  */

  GetVars = (function(_super) {

    __extends(GetVars, _super);

    /*
    */

    function GetVars(file, engine) {
      this.engine = engine;
      GetVars.__super__.constructor.call(this, file);
    }

    /*
    */

    GetVars.prototype._handleContent = function(content, callback) {
      return this.engine.getVars(content, callback);
    };

    return GetVars;

  })(BaseFileOperation);

  /*
  */

  SetVars = (function(_super) {

    __extends(SetVars, _super);

    /*
    */

    function SetVars(file, data, engine) {
      this.data = data;
      this.engine = engine;
      SetVars.__super__.constructor.call(this, file);
    }

    /*
    */

    SetVars.prototype._handleContent = function(content, callback) {
      var _this = this;
      return this.engine.setVars(content, this.data, this._onSuccess(function(tplContent) {
        return _this._writeFile(tplContent, callback);
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
    	 returns the template variables of a file
    */

    Factory.prototype.getVars = function(file, callback) {
      return new GetVars(file, this._engineFromFile(file)).onComplete(callback).start();
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

  module.exports = new Factory();

}).call(this);
