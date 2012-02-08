(function() {
  var BaseOperation, GetTplVars, SetTplVars, async, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("./Base");

  _ = require("underscore");

  async = require("async");

  /*
   Fetches all the template vars in a bootstrap directory
  */

  GetTplVars = (function(_super) {

    __extends(GetTplVars, _super);

    /*
    */

    function GetTplVars(files, tplVactory) {
      this.files = files;
      this.tplVactory = tplVactory;
      GetTplVars.__super__.constructor.call(this);
    }

    /*
    */

    GetTplVars.prototype.start = function() {
      return async.concat(this.files, this._method(this._getVars, this._onSuccess(this._onTplVars)));
    };

    /*
    */

    GetTplVars.prototype._getTplVars = function(file, next) {
      return this.tplVactory.getVars(file, next);
    };

    /*
    */

    GetTplVars.prototype._onTplVars = function(vars) {
      return this._complete(_.uniq(vars));
    };

    return GetTplVars;

  })(BaseOperation);

  /*
   files in all the vars in a template directory
  */

  SetTplVars = (function(_super) {

    __extends(SetTplVars, _super);

    /*
    */

    function SetTplVars(files, data, tplVactory) {
      this.files = files;
      this.data = data;
      this.tplVactory = tplVactory;
      SetTplVars.__super__.constructor.call(this);
    }

    /*
    */

    SetTplVars.prototype.start = function() {
      return async.forEach(this.files, this._method(this._setVars, this._method(this._end)));
    };

    /*
    */

    SetTplVars.prototype._setVars = function(file, next) {
      return this.tplFactory.write(file, this.data, next);
    };

    return SetTplVars;

  })(BaseOperation);

  exports.get = function(ops, complete) {
    return new GetTplVars(ops.files, ops.tplFactory).onComplete(complete).start();
  };

  exports.set = function(ops, complete) {
    return new SetTplVars(ops.files, ops.data, ops.tplFactory).onComplete(complete).start();
  };

}).call(this);
