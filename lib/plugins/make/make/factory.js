(function() {
  var ChainBuilder, Factory, ScriptBuilder, fs, outcome, path, step;

  ChainBuilder = require("./chainBuilder");

  ScriptBuilder = require("./scriptBuilder");

  step = require("stepc");

  fs = require("fs");

  outcome = require("outcome");

  path = require("path");

  /*
   creates new builders based on configs given
  */

  module.exports = Factory = (function() {
    /*
    */
    function Factory(makeConfig) {
      this.makeConfig = makeConfig;
      this._builderClasses = [];
      this.addBuilderClass(ChainBuilder);
      this.addBuilderClass(ScriptBuilder);
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

    Factory.prototype.newBuilder = function(name, ops, cwd) {
      var builder, builderClass, _i, _len, _ref;
      _ref = this._builderClasses;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        builderClass = _ref[_i];
        if (builderClass.test(ops)) {
          builder = new builderClass(name, this.makeConfig);
          builder.load(ops, cwd || this.makeConfig.cwd);
          return builder;
        }
      }
      return null;
    };

    return Factory;

  })();

}).call(this);