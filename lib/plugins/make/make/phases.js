(function() {
  var BuildPhase, BuildPhases, async;

  async = require("async");

  BuildPhase = (function() {
    /*
    */
    function BuildPhase(name) {
      this.name = name;
      this._builders = {};
    }

    /*
    */

    BuildPhase.prototype.add = function(type, builder) {
      return this._builders[type] = builder;
    };

    /*
    */

    BuildPhase.prototype.start = function(type, ops, next) {
      return this._builders[type].start(ops, next);
    };

    return BuildPhase;

  })();

  /*
  */

  module.exports = BuildPhases = (function() {
    /*
    */
    function BuildPhases(factory) {
      this.factory = factory;
      this._phases = {};
    }

    /*
    */

    BuildPhases.prototype.load = function(ops) {
      var phase, _results;
      _results = [];
      for (phase in phases) {
        _results.push(this.add(phase.name, phase));
      }
      return _results;
    };

    /*
    */

    BuildPhases.prototype.add = function(name, phase) {
      return this._phases[name] = _newBuildPhase(name, phase);
    };

    /*
    */

    BuildPhases.prototype.get = function(ops) {
      if (typeof ops === "string") return this._phases[ops];
      return this._newBuilder(null, ops);
    };

    /*
    */

    BuildPhases.prototype._newBuildPhase = function(name, builders) {
      var builderName, ph;
      ph = new BuildPhase(name);
      for (builderName in builders) {
        ph.add(builderName, _newBuilder(builders[builderName]));
      }
      return ph;
    };

    /*
    */

    BuildPhases.prototype._newBuilder = function(name, ops) {
      return this.factory.newBuilder(name, ops);
    };

    return BuildPhases;

  })();

}).call(this);
