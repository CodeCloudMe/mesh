(function() {
  var BaseBuilder, ScriptBuilder, async,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseBuilder = require("./base").Builder;

  async = require("async");

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

    ScriptBuilder.prototype.load = function(ops, cwd) {
      return this.builder = require("" + cwd + "/" + ops.script);
    };

    /*
    	 passes the build phase
    */

    ScriptBuilder.prototype.start = function(input, callback) {
      return this.builder.call(this, input, callback);
    };

    return ScriptBuilder;

  })(BaseBuilder);

  module.exports.test = function(config) {
    return !!config.script;
  };

}).call(this);
