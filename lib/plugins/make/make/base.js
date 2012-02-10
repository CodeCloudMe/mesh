
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

    _Class.prototype.start = function(input, callback) {};

    return _Class;

  })();

}).call(this);
