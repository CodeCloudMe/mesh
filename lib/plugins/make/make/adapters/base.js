
/*
 base builder interface
*/

(function() {

  exports.Builder = (function() {
    /*
    */
    function _Class(name, makeConfig) {
      this.name = name;
      this.makeConfig = makeConfig;
    }

    /*
    	 load from raw config
    */

    _Class.prototype.load = function(ops) {};

    /*
    	 start the build phase
    */

    _Class.prototype.start = function(target, callback) {};

    /*
    */

    _Class.prototype.buildMessage = function(target) {
      return "build " + this.name;
    };

    return _Class;

  })();

}).call(this);
