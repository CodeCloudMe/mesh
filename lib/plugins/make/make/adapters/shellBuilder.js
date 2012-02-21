(function() {
  var BaseBuilder, ShellBuilder, async, exec, parseTpl,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  async = require("async");

  BaseBuilder = require("./base").Builder;

  parseTpl = require("../parseTpl");

  exec = require("child_process").exec;

  /*
   builds from a .js file
  */

  module.exports = ShellBuilder = (function(_super) {

    __extends(ShellBuilder, _super);

    function ShellBuilder() {
      ShellBuilder.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    ShellBuilder.prototype.load = function(ops) {
      return this.exec = ops.exec;
    };

    /*
    	 passes the build phase
    */

    ShellBuilder.prototype._start = function(target, callback) {
      var cmd;
      cmd = this._cmd(target);
      return exec(cmd, {
        cwd: target.cwd
      }, function(err, stdout, stderr) {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        return callback();
      });
    };

    /*
    */

    ShellBuilder.prototype._buildMessage = function(target) {
      return this._cmd(target);
    };

    /*
    */

    ShellBuilder.prototype._cmd = function(target) {
      return parseTpl(this.builderName, target);
    };

    return ShellBuilder;

  })(BaseBuilder);

  module.exports.test = function(config) {
    return !!config.exec;
  };

}).call(this);
