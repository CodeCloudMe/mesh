(function() {
  var BaseBuilder, ScriptBuilder, async,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  async = require("async");

  BaseBuilder = require("./base").Builder;

  /*
   builds from a .js file
  */

  module.exports = ScriptBuilder = (function(_super) {

    __extends(ScriptBuilder, _super);

    function ScriptBuilder() {
      ScriptBuilder.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    ScriptBuilder.prototype.load = function(ops) {
      return this.builder = require(ops.script);
    };

    /*
    	 passes the build phase
    */

    ScriptBuilder.prototype._start = function(target, callback) {
      return this.builder.build.call(this, target, callback);
    };

    /*
    */

    ScriptBuilder.prototype._buildMessage = function(target) {
      if (this.builder.buildMessage) {
        return this.builder.buildMessage(target);
      } else {
        return ScriptBuilder.__super__._buildMessage.call(this, target);
      }
    };

    return ScriptBuilder;

  })(BaseBuilder);

  module.exports.test = function(config) {
    return !!config.script;
  };

}).call(this);
