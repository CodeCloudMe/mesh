(function() {
  var Bootstrap, Mesher, merge, template;

  template = require("./template");

  Bootstrap = require("./bootstrap");

  merge = require("./merge");

  /*
  
  1. bootstrap
  2. merge
  3. make
  */

  Mesher = (function() {
    /*
    */
    function Mesher(ops) {
      this._templateFactory = template.factory();
      this._bootstrap = new Bootstrap(this._templateFactory, ops.getTemplateData);
    }

    /*
    */

    Mesher.prototype.bootstrap = function(ops, callback) {
      return this._boostrap.start(ops, callback);
    };

    /*
    */

    Mesher.prototype.merge = function(ops, callback) {
      return merge(ops, callback);
    };

    /*
    	 TODO
    */

    Mesher.prototype.make = function(ops, callback) {};

    return Mesher;

  })();

  exports.mesher = function(ops) {
    if (!ops) ops = {};
    return new Mesher(ops);
  };

}).call(this);
