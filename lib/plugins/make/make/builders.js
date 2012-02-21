(function() {
  var BuilderFactory, Builders, outcome;

  outcome = require("outcome");

  BuilderFactory = require("./factory");

  /*
   collection of builders loaded from configurations
  */

  module.exports = Builders = (function() {
    /*
    */
    function Builders(sibling) {
      this.sibling = sibling;
      this._builders = {};
      this.factory = new BuilderFactory(this);
    }

    /*
    */

    Builders.prototype.load = function(builders) {
      var builderName, builderNames, _i, _len, _ref;
      for (builderNames in builders) {
        _ref = builderNames.split(" ");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          builderName = _ref[_i];
          this.add(this.factory.newBuilder(builderName, builders[builderNames]));
        }
      }
      return this;
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
      if (this.sibling) return this.sibling.find(search);
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
      return this.find(name).start(target, next);
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
