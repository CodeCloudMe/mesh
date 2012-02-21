(function() {
  var BaseBuilder, TargetBuilder, async, exec, handlebars, structr,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  async = require("async");

  BaseBuilder = require("./base").Builder;

  handlebars = require("handlebars");

  exec = require("child_process").exec;

  structr = require("structr");

  /*
   builds from a .js file
  */

  module.exports = TargetBuilder = (function(_super) {

    __extends(TargetBuilder, _super);

    function TargetBuilder() {
      TargetBuilder.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    TargetBuilder.prototype.load = function(target) {
      this.target = target;
      return this.builder = this.builders.factory.newBuilder(null, this.target.task);
    };

    /*
    	 passes the build phase
    */

    TargetBuilder.prototype._start = function(target, callback) {
      var obj;
      obj = {};
      structr.copy(target, obj);
      structr.copy(this.target, obj);
      return this.builder.start(obj, callback);
    };

    /*
    */

    TargetBuilder.prototype._buildMessage = function(target) {
      return "target " + (this.name || target.name || "");
    };

    /*
    */

    TargetBuilder.prototype._pointer = function() {
      return "";
    };

    return TargetBuilder;

  })(BaseBuilder);

  module.exports.test = function(config) {
    return !!config.task;
  };

}).call(this);
