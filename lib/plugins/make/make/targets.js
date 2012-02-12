(function() {
  var BuildTarget, BuildTargets, async;

  async = require("async");

  /*
   target for the build scripts
  */

  BuildTarget = (function() {
    /*
    */
    function BuildTarget(ops, builderSearch) {
      this.ops = ops;
      this.builderSearch = builderSearch;
    }

    /*
    */

    BuildTarget.prototype.build = function(builder, next) {
      return builder.start(this.ops, next);
    };

    return BuildTarget;

  })();

  /* 
   chain of targets
  */

  module.exports = BuildTargets = (function() {
    /*
    */
    function BuildTargets(builders) {
      this.builders = builders;
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
        _results.push(this.add(new BuildTarget(target, target.build)));
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
      var _this = this;
      return async.forEach(this._targets, function(target, next) {
        var builder;
        builder = _this.builders.find(target.builderSearch.replace('*', type));
        return target.build(builder, next);
      }, callback);
    };

    return BuildTargets;

  })();

}).call(this);
