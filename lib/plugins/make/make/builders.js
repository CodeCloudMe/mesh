(function() {
  var Builders, outcome;

  outcome = require("outcome");

  /*
   collection of builders loaded from configurations
  */

  module.exports = Builders = (function() {
    /*
    */
    function Builders(factory, sibling) {
      this.factory = factory;
      this.sibling = sibling;
      this._builders = {};
      this.factory.builders = this;
    }

    /*
    */

    Builders.prototype.load = function(builders, namespaces) {
      var builderData, builderName, builderNames, _i, _len, _ref;
      if (!namespaces) namespaces = [];
      for (builderNames in builders) {
        _ref = builderNames.split(" ");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          builderName = _ref[_i];
          builderData = builders[builderNames];
          if (builderName.substr(0, 1) === "@") {
            this.load(builderData, namespaces.concat(builderName.substr(1)));
          } else {
            this.add(this.factory.newBuilder(namespaces.concat(builderName).join(":"), builders[builderNames]));
          }
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
