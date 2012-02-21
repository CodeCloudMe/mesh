
/*
 base builder interface
*/

(function() {

  exports.Builder = (function() {
    /*
    */
    function _Class(name, builders) {
      this.name = name;
      this.builders = builders;
    }

    /*
    	 load from raw config
    */

    _Class.prototype.load = function(ops) {};

    /*
    	 start the build phase
    */

    _Class.prototype.start = function(target, callback) {
      console.log("--> " + (this._buildMessage(target)));
      return this._start(target, callback);
    };

    /*
    */

    _Class.prototype._start = function(target, callback) {};

    /*
    */

    _Class.prototype._buildMessage = function(target) {
      return "build " + this.name;
    };

    return _Class;

  })();

}).call(this);
