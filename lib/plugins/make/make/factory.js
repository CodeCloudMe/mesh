(function() {
  var ChainBuilder, Factory, RefBuilder, ScriptBuilder, ShellBuilder, TargetBuilder, fs, outcome, path, step;

  fs = require("fs");

  path = require("path");

  step = require("stepc");

  outcome = require("outcome");

  ChainBuilder = require("./adapters/chainBuilder");

  ScriptBuilder = require("./adapters/scriptBuilder");

  ShellBuilder = require("./adapters/shellBuilder");

  RefBuilder = require("./adapters/refBuilder");

  TargetBuilder = require("./adapters/targetBuilder");

  /*
   creates new builders based on configs given
  */

  module.exports = Factory = (function() {
    /*
    */
    function Factory(builders) {
      this.builders = builders;
      this._builderClasses = [];
      this.addBuilderClass(ChainBuilder);
      this.addBuilderClass(ScriptBuilder);
      this.addBuilderClass(ShellBuilder);
      this.addBuilderClass(TargetBuilder);
      this.addBuilderClass(RefBuilder);
    }

    /*
    	 adds a builder class - must also be a tester
    */

    Factory.prototype.addBuilderClass = function(builderClass) {
      return this._builderClasses.push(builderClass);
    };

    /*
    	 returns a new builder based on the options given. CWD is also
    	 important since SOME builders may load from disc
    */

    Factory.prototype.newBuilder = function(name, ops) {
      var builder, builderClass, _i, _len, _ref;
      _ref = this._builderClasses;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        builderClass = _ref[_i];
        if (builderClass.test(ops)) {
          builder = new builderClass(name, this.builders);
          builder.load(ops);
          return builder;
        }
      }
      return null;
    };

    return Factory;

  })();

}).call(this);
