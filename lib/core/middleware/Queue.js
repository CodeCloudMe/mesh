(function() {
  var BaseOperation, Queue,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseOperation = require("../base/Operation");

  Queue = (function(_super) {

    __extends(Queue, _super);

    /*
    */

    function Queue(target) {
      this.target = target;
      Queue.__super__.constructor.call(this);
      this._callbacks = [];
    }

    /*
    */

    Queue.prototype.add = function(callback) {
      var cb, _i, _len;
      if (callback instanceof Array) {
        for (_i = 0, _len = callback.length; _i < _len; _i++) {
          cb = callback[_i];
          this.add(cb);
        }
        return;
      }
      return this._callbacks.push(callback);
    };

    /*
    */

    Queue.prototype.start = function() {
      return this._next();
    };

    /*
    */

    Queue.prototype._next = function() {
      if (!this._callbacks.length) return this._end();
      try {
        return this._callbacks.shift().call(null, this.target, this._onSuccess(this._next));
      } catch (e) {
        return this._error(e);
      }
    };

    return Queue;

  })(BaseOperation);

}).call(this);
