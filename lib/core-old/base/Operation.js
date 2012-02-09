(function() {
  var EventEmitter, Operation, outcome,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  EventEmitter = require("events").EventEmitter;

  outcome = require("outcome");

  module.exports = Operation = (function(_super) {

    __extends(Operation, _super);

    /*
    */

    function Operation() {
      var _this = this;
      this._on = outcome.error(function(err) {
        return _this._error(err);
      });
    }

    /*
    	 starts the operation
    */

    Operation.prototype.start = function() {};

    /*
    	 wraps around a callback for complete, and error
    */

    Operation.prototype.onComplete = function(callback) {
      this.on("complete", function(result) {
        return callback(null, result);
      });
      this.on("error", callback);
      return this;
    };

    /*
    	 wraps around a callback - only called on success
    */

    Operation.prototype._onSuccess = function(cb) {
      return this._on(outcome.success(this._method(cb)));
    };

    /*
    	 wraps a method - makes it callable
    */

    Operation.prototype._method = function(cb) {
      var _this = this;
      return function() {
        return cb.apply(_this, arguments);
      };
    };

    /*
    	 called on end
    */

    Operation.prototype._end = function(err, result) {
      if (err) return this._error(err);
      return this._complete(result);
    };

    /*
    */

    Operation.prototype._complete = function(result) {
      return this.emit("complete", result);
    };

    /*
    */

    Operation.prototype._error = function(err) {
      return this.emit("error", err);
    };

    return Operation;

  })(EventEmitter);

}).call(this);
