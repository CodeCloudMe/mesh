(function() {
  var BOOTSTRAP_DIR, Bootstrap, MAKE_DIR, Mesher, getPlatforms, merge, template;

  template = require("./core/template");

  Bootstrap = require("./core/bootstrap");

  merge = require("./core/merge");

  getPlatforms = require("./core/utils/getPlatforms");

  /*
  
  1. bootstrap
  2. merge
  3. make
  */

  BOOTSTRAP_DIR = __dirname + "/platform/bootstrap";

  MAKE_DIR = __dirname + "/platform/make";

  Mesher = (function() {
    /*
    */
    function Mesher(ops) {
      this._templateFactory = template.factory();
      this._bootstrap = new Bootstrap(BOOTSTRAP_DIR, this._templateFactory, ops.getTemplateData);
      this._platforms = getPlatforms(BOOTSTRAP_DIR);
    }

    /*
    */

    Mesher.prototype.bootstrap = function(ops, callback) {
      return this._bootstrap.start(ops, callback);
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

    /*
    */

    Mesher.prototype.platforms = function() {
      return this._platforms;
    };

    return Mesher;

  })();

  exports.mesher = function(ops) {
    if (!ops) ops = {};
    return new Mesher(ops);
  };

}).call(this);
