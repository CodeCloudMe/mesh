(function() {
  var BaseOperation, SetTplVars, async, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/Operation");

  _ = require("underscore");

  async = require("async");

  /*
   files in all the vars in a template directory
  */

  SetTplVars = (function(_super) {

    __extends(SetTplVars, _super);

    /*
    */

    function SetTplVars(files, data, tplFactory) {
      this.files = files;
      this.data = data;
      this.tplFactory = tplFactory;
      SetTplVars.__super__.constructor.call(this);
    }

    /*
    */

    SetTplVars.prototype.start = function() {
      return async.forEach(this.files, this._method(this._setVars), this._method(this._end));
    };

    /*
    */

    SetTplVars.prototype._setVars = function(file, next) {
      return this.tplFactory.write(file, this.data, next);
    };

    return SetTplVars;

  })(BaseOperation);

  exports.set = function(ops, complete) {
    return new SetTplVars(ops.files, ops.data, ops.tplFactory).onComplete(complete).start();
  };

}).call(this);
