(function() {
  var BaseOperation, Factory, SetVars, fs,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/Operation");

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
      SetVars.__super__.constructor.call(this);
    }

    /*
    	 handles the content, fills the tpl, and writes the data
    */

    SetVars.prototype.start = function() {
      return fs.readFile(this.file, "utf8", this._onSuccess(this._onContent));
    };

    /*
    */

    SetVars.prototype._onContent = function(content) {
      return this.engine.setVars(content, this.data, this._onSuccess(this._writeFile));
    };

    /*
    	 write the template file to a new file without the tpl ext
    */

    SetVars.prototype._writeFile = function(content) {
      return fs.writeFile(this.file.replace('.' + this.engine.name, ''), content, this._onSuccess(this._onWriteFile));
    };

    /*
    	 remove the template file
    */

    SetVars.prototype._onWriteFile = function() {
      return fs.unlink(this.file, this._method(this._end));
    };

    return SetVars;

  })(BaseOperation);

  /*
  */

  Factory = (function() {
    /*
    */
    function Factory() {
      this.engines = {};
      this.addEngine(require("./engines/mustache"));
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
      var type;
      type = this._typeFromFile(file);
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
