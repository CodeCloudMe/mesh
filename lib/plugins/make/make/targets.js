(function() {
  var BuildTarget, BuildTargets, async;

  async = require("async");

  /*
   target for the build scripts
  */

  BuildTarget = (function() {
    /*
    */
    function BuildTarget(ops, buildPhase) {
      this.ops = ops;
      this.buildPhase = buildPhase;
    }

    /*
    */

    BuildTarget.prototype.build = function(type, callback) {
      return buildPhase.start(type, this.ops, callback);
    };

    return BuildTarget;

  })();

  /* 
   chain of targets
  */

  module.exports = BuildTargets = (function() {
    /*
    */
    function BuildTargets(buildPhases) {
      this.buildPhases = buildPhases;
      this._targets = [];
    }

    /* 
    	 load targets from config
    */

    BuildTargets.prototype.load = function(targets) {
      var target, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        target = targets[_i];
        _results.push(this.add(new BuildTarget(target, this.buildPhases.get(target.build))));
      }
      return _results;
    };

    /*
    */

    BuildTargets.prototype.add = function(target) {
      return this._targets.push(target);
    };

    /*
    */

    BuildTargets.prototype.build = function(type, callback) {
      return async.forEach(this._targets, function(target, next) {
        return target.build(type, next);
      }, callback);
    };

    return BuildTargets;

  })();

}).call(this);
