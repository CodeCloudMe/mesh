(function() {
  var Bootstrap, BootstrapOperation;

  BootstrapOperation = require("./Operation");

  Bootstrap = (function() {
    /*
    */
    function Bootstrap(tplFactory, getTplVars) {
      this.tplFactory = tplFactory;
      this.getTplVars = getTplVars;
    }

    /*
    */

    Bootstrap.prototype.start = function(ops, callback) {
      return new BootstrapOperation(ops.input, ops.output, this.tplFactory, this._method(this._getTplVars, ops.target)).onComplete(callback).start();
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
