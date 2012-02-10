(function() {
  var BaseBuilder, ChainBuilder, async,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseBuilder = require("./base").Builder;

  async = require("async");

  /*
   a chain of builders
  
   Example:
  
   "firefox":["combine","compile-firefox"]
  */

  module.exports = ChainBuilder = (function(_super) {

    __extends(ChainBuilder, _super);

    function ChainBuilder() {
      ChainBuilder.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    ChainBuilder.prototype.load = function(chains) {
      this.chains = chains;
    };

    /*
    */

    ChainBuilder.prototype.start = function(input, callback) {
      var _this = this;
      return async.forEach(this.chains, function(chain, next) {
        return _this.makeConfig.builders.get(chain).start(input, next);
      }, callback);
    };

    return ChainBuilder;

  })(BaseBuilder);

  module.exports.test = function(config) {
    return config instanceof Array;
  };

}).call(this);
