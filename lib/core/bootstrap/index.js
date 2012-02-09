(function() {
  var Bootstrap, BootstrapOperation, fs;

  BootstrapOperation = require("./Bootstrap");

  fs = require("fs");

  Bootstrap = (function() {
    /*
    */
    function Bootstrap(bootstrapDir, tplFactory, tplData) {
      this.bootstrapDir = bootstrapDir;
      this.tplFactory = tplFactory;
      this.tplData = tplData;
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
      return callback(null, this.tplData || {});
    };

    return Bootstrap;

  })();

  module.exports = function(bootstrapDir, tplFactory, tplData) {
    return new Bootstrap(bootstrapDir, tplFactory, tplData);
  };

}).call(this);
