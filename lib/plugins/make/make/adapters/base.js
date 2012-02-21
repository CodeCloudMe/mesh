
/*
 base builder interface
*/

(function() {

  exports.Builder = (function() {
    /*
    */
    function _Class(name, builders) {
      this.name = name;
      this.builders = builders != null ? builders : null;
    }

    /*
    	 load from raw config
    */

    _Class.prototype.load = function(ops) {};

    /*
    	 start the build phase
    */

    _Class.prototype.start = function(target, callback) {
      if (this.name) {
        target.namespace = this.name;
        target.currentTask = this.name.split(":").pop();
      }
      this._printMessage(target);
      return this._start(target, callback);
    };

    /*
    */

    _Class.prototype._start = function(target, callback) {};

    /*
    */

    _Class.prototype._printMessage = function(target) {
      return console.log("" + (this._pointer()) + (this._buildMessage(target)));
    };

    /*
    */

    _Class.prototype._buildMessage = function(target) {
      return "make " + this.name;
    };

    /*
    */

    _Class.prototype._pointer = function() {
      return "--> ";
    };

    return _Class;

  })();

}).call(this);
