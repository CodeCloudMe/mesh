(function() {
  var Builders, outcome;

  outcome = require("outcome");

  /*
   collection of builders loaded from configurations
  */

  module.exports = Builders = (function() {
    /*
    */
    function Builders(factory) {
      this.factory = factory;
      this._builders = {};
    }

    /*
    */

    Builders.prototype.load = function(builders) {
      var builderName, _results;
      _results = [];
      for (builderName in builders) {
        _results.push(this.add(this.factory.newBuilder(builderName, builders[builderName])));
      }
      return _results;
    };

    /*
    	 returns a builder based on the name
    */

    Builders.prototype.get = function(name) {
      return this._builders[name];
    };

    /*
    	 finds a builder based on the pattern given
    */

    Builders.prototype.find = function(search) {
      var name, tester;
      tester = this._nameTester(search);
      for (name in this._builders) {
        if (tester.test(name)) return this._builders[name];
      }
      throw new Error("Cannot find builder \"" + search + "\"");
    };

    /*
    */

    Builders.prototype.add = function(builder) {
      return this._builders[builder.name] = builder;
    };

    /*
    */

    Builders.prototype.build = function(name, target, next) {
      var builder;
      builder = this.find(name);
      console.log("--> " + (builder.buildMessage(target)));
      return builder.start(target, outcome.error(next).success(next));
    };

    /*
    */

    Builders.prototype._nameTester = function(search) {
      if (search instanceof RegExp) return search;
      if (search instanceof Function) {
        return {
          test: search
        };
      }
      if (typeof search === "string") {
        return new RegExp("^" + (search.replace(/\./g, "\\.").replace(/\*\*/g, ".*").replace(/\*/g, "[^\\.]")) + "$");
      }
    };

    return Builders;

  })();

}).call(this);
