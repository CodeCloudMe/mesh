(function() {
  var Hook, Queue;

  Queue = require("./Queue");

  module.exports = Hook = (function() {
    /*
    */
    function Hook() {
      this._pre = [];
      this._mid = [];
      this._post = [];
      /*
      */
    }

    Hook.prototype.pre = function(middleware) {
      return this._pre.push(middleware);
    };

    /*
    */

    Hook.prototype.mid = function(middleware) {
      return this._mid.push(middleware);
    };

    /*
    */

    Hook.prototype.post = function(middleware) {
      return this._post.push(middleware);
    };

    /*
    */

    Hook.prototype.run = function(target, callback) {
      var q;
      q = new Queue(target);
      q.add(this._pre.concat(this._mid).concat(this._post));
      q.onComplete(callback);
      return q.start();
    };

    return Hook;

  })();

}).call(this);
