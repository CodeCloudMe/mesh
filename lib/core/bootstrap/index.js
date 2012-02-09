(function() {
  var Bootstrap, BootstrapOperation, fs;

  BootstrapOperation = require("./Bootstrap");

  fs = require("fs");

  Bootstrap = (function() {
    /*
    */
    function Bootstrap(bootstrapDir, tplFactory, getTplVars) {
      this.bootstrapDir = bootstrapDir;
      this.tplFactory = tplFactory;
      this.getTplVars = getTplVars;
    }

    /*
    */

    Bootstrap.prototype.start = function(ops, callback) {
      var _this = this;
      return new BootstrapOperation(this.bootstrapDir, ops.output, this.tplFactory, (function(cb) {
        return _this._getTplVars(cb);
      }), ops.target).onComplete(callback).start();
    };

    /*
    */

    Bootstrap.prototype._getTplVars = function(callback) {
      if (this.getTplVars) {
        return this.getTplVars(callback);
      } else {
        return callback({});
      }
    };

    return Bootstrap;

  })();

  module.exports = function(tplFactory, getTplVars) {
    return new Bootstrap(tplFactory, getTplVars);
  };

}).call(this);
