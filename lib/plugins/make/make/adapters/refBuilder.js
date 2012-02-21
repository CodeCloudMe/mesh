(function() {
  var BaseBuilder, RefBuilder, async, handlebars,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  async = require("async");

  BaseBuilder = require("./base").Builder;

  handlebars = require('handlebars');

  /*
   builds from a .js file
  */

  module.exports = RefBuilder = (function(_super) {

    __extends(RefBuilder, _super);

    function RefBuilder() {
      RefBuilder.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    RefBuilder.prototype.load = function(builderName) {
      this.builderName = builderName;
    };

    /*
    	 passes the build phase
    */

    RefBuilder.prototype.start = function(target, callback) {
      return this.builders.find(this._find(target)).start(target, callback);
    };

    /*
    */

    RefBuilder.prototype._find = function(target) {
      return handlebars.compile(this.builderName)(target);
    };

    return RefBuilder;

  })(BaseBuilder);

  module.exports.test = function(config) {
    return typeof config === "string";
  };

}).call(this);
