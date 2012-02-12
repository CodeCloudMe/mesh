(function() {
  var BuildTarget, BuildTargets, seq;

  seq = require("seq");

  /*
   target for the build scripts
  */

  BuildTarget = (function() {
    /*
    */
    function BuildTarget(options, cwd, targets) {
      this.options = options;
      this.cwd = cwd;
      this.targets = targets;
    }

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

    BuildTargets.prototype.load = function(targets, cwd) {
      var target, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        target = targets[_i];
        _results.push(this.add(new BuildTarget(target, cwd, this)));
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
      var index, self;
      index = 0;
      self = this;
      return seq(this._targets).seqEach(function(target) {
        console.log("* target %d", ++index);
        return self.builders.build(target.options.build.replace('*', type), target, this);
      }).seq(callback);
    };

    return BuildTargets;

  })();

}).call(this);
